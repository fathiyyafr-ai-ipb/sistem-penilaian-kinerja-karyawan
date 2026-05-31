const db = require('../config/db');

// GET /api/activities/:activityId/tasks
const getTasks = async (req, res) => {
  try {
    const { activityId } = req.params;
    const [rows] = await db.query(`
      SELECT t.*, u.name AS assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.activity_id = ?
      ORDER BY t.created_at ASC
    `, [activityId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/activities/:activityId/tasks
// Bulk management (create, update, delete in one list)
const manageTasks = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { tasks } = req.body; // format: [{ id, title, assigned_to, weight }]

    if (!Array.isArray(tasks)) {
      return res.status(400).json({ message: 'tasks harus berupa array' });
    }

    // 0. Validasi Otorisasi Keamanan Keanggotaan/Kepemimpinan Tim
    const [actRows] = await db.query('SELECT title, team_id, created_by FROM activities WHERE id = ?', [activityId]);
    if (!actRows.length) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }
    const activity = actRows[0];

    if (req.user.role === 'pegawai') {
      if (req.user.is_leader) {
        // Hanya boleh mengelola sub-tugas jika dia pembuat kegiatan atau memimpin tim kegiatan tersebut
        let allowed = parseInt(activity.created_by) === parseInt(req.user.id);
        if (!allowed && activity.team_id) {
          const [teamRows] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [activity.team_id]);
          if (teamRows.length && parseInt(teamRows[0].leader_id) === parseInt(req.user.id)) {
            allowed = true;
          }
        }
        if (!allowed) {
          return res.status(403).json({ message: 'Akses ditolak. Anda hanya dapat mengelola tugas pada kegiatan yang Anda pimpin atau buat.' });
        }
      } else {
        // Pegawai biasa dilarang mengelola tugas
        return res.status(403).json({ message: 'Akses ditolak. Pegawai pelaksana tidak memiliki wewenang mengelola tugas.' });
      }
    } else if (!['admin', 'kasubag', 'kepala_bps'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    // 1. Validasi: Akumulasi bobot harus 100% jika ada sub-tugas yang didefinisikan
    if (tasks.length > 0) {
      const totalWeight = tasks.reduce((sum, t) => sum + parseInt(t.weight || 0), 0);
      if (totalWeight !== 100) {
        return res.status(400).json({ message: 'Akumulasi bobot tugas harus tepat 100%' });
      }
    }

    // Ambil sub-tugas yang saat ini ada di DB
    const [existing] = await db.query('SELECT id FROM tasks WHERE activity_id = ?', [activityId]);
    const existingIds = existing.map(e => e.id);

    // Filter ID dari payload
    const payloadIds = tasks.filter(t => t.id).map(t => parseInt(t.id));

    // 2. Hapus sub-tugas yang tidak ada di payload baru (di-delete oleh atasan)
    const idsToDelete = existingIds.filter(id => !payloadIds.includes(id));
    if (idsToDelete.length > 0) {
      const placeholders = idsToDelete.map(() => '?').join(',');
      await db.query(`DELETE FROM tasks WHERE id IN (${placeholders})`, idsToDelete);
    }

    // 3. Tambah (Insert) baru atau Perbarui (Update) yang sudah ada
    for (const t of tasks) {
      const title = t.title;
      const assigned_to = t.assigned_to || null;
      const weight = parseInt(t.weight || 0);

      if (t.id) {
        // Update yang sudah ada
        await db.query(
          'UPDATE tasks SET title = ?, assigned_to = ?, weight = ? WHERE id = ? AND activity_id = ?',
          [title, assigned_to, weight, t.id, activityId]
        );
      } else {
        // Insert sub-tugas baru
        await db.query(
          'INSERT INTO tasks (activity_id, title, assigned_to, weight, progress_percentage, status) VALUES (?, ?, ?, ?, 0, \'pending\')',
          [activityId, title, assigned_to, weight]
        );

        if (assigned_to) {
          await db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [assigned_to, `Anda telah ditugaskan tugas baru: "${title}" dalam kegiatan "${activity.title}"`]
          );
        }
      }
    }

    // 4. Hitung ulang progres total kegiatan induk berdasarkan bobot & progres sub-tugas yang ada
    const [agg] = await db.query(
      'SELECT COALESCE(SUM(progress_percentage * weight) / 100.0, 0) as total_progress FROM tasks WHERE activity_id = ?',
      [activityId]
    );
    const totalProgress = parseFloat(agg[0].total_progress);

    let actStatus = 'on_progress';
    if (totalProgress >= 100) actStatus = 'selesai';
    else if (totalProgress <= 0) actStatus = 'pending';

    await db.query('UPDATE activities SET status = ? WHERE id = ?', [actStatus, activityId]);

    res.json({ message: 'Sub-tugas berhasil diperbarui', total_progress: totalProgress });
  } catch (err) {
    console.error('Error in manageTasks:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTasks, manageTasks };
