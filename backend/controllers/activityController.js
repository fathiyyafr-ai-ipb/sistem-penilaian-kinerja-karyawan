const db = require('../config/db');

// GET /api/activities
const getActivities = async (req, res) => {
  try {
    let query = `
      SELECT a.*,
        u.name  AS created_by_name,
        t.team_name,
        t.leader_id AS team_leader_id,
        au.name AS assigned_to_name,
        COALESCE(calc.total_progress, 0) as total_progress
      FROM activities a
      LEFT JOIN users u  ON a.created_by  = u.id
      LEFT JOIN teams t  ON a.team_id     = t.id
      LEFT JOIN users au ON a.assigned_to = au.id
      LEFT JOIN LATERAL (
          SELECT COALESCE(SUM(ts.progress_percentage * ts.weight) / 100.0, 0) as total_progress
          FROM tasks ts
          WHERE ts.activity_id = a.id
      ) calc ON true
    `;
    const params = [];

    if (req.user.role === 'pegawai') {
      query += ` WHERE (
        a.assigned_to = ? OR 
        a.created_by = ? OR 
        a.team_id IN (SELECT id FROM teams WHERE leader_id = ?) OR 
        a.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)
      )`;
      params.push(req.user.id, req.user.id, req.user.id, req.user.id);
    }

    query += ' ORDER BY a.deadline ASC';
    const [rows] = await db.query(query, params);

    // Hitung sisa hari deadline
    const today = new Date();
    rows.forEach(row => {
      if (row.deadline) {
        const diff = Math.ceil((new Date(row.deadline) - today) / (1000 * 60 * 60 * 24));
        row.days_left = diff;
      }
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/activities
const createActivity = async (req, res) => {
  try {
    const { title, description, start_date, deadline, team_id, assigned_to } = req.body;
    const created_by = req.user.id;

    const final_team_id = team_id || null;
    const final_assigned_to = assigned_to || null;
    const final_start_date = start_date || null;

    const [result] = await db.query(
      'INSERT INTO activities (title, description, start_date, deadline, created_by, team_id, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, final_start_date, deadline, created_by, final_team_id, final_assigned_to]
    );

    const activity_id = result?.insertId;

    // Send notifications to all team members if a team is assigned
    if (final_team_id && activity_id) {
      const [members] = await db.query(
        'SELECT user_id FROM team_members WHERE team_id = ?',
        [final_team_id]
      );
      for (const member of members) {
        await db.query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [member.user_id, `Kegiatan baru telah dibuat dalam tim Anda: "${title}"`]
        );
      }
    }

    res.status(201).json({ message: 'Kegiatan berhasil dibuat', id: activity_id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/activities/:id
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, deadline, status, assigned_to, team_id } = req.body;

    // Check permission
    const [act] = await db.query('SELECT team_id, created_by FROM activities WHERE id = ?', [id]);
    if (!act.length) return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });

    if (req.user.role === 'pegawai' && req.user.is_leader) {
      const [team] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [act[0].team_id]);
      if (parseInt(act[0].created_by) !== parseInt(req.user.id) && (!team.length || parseInt(team[0].leader_id) !== parseInt(req.user.id))) {
        return res.status(403).json({ message: 'Akses ditolak. Anda bukan pemilik atau ketua tim untuk kegiatan ini.' });
      }
    } else if (!['admin', 'kasubag', 'kepala_bps'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    const final_team_id = team_id || null;
    const final_assigned_to = assigned_to || null;
    const final_start_date = start_date || null;

    await db.query(
      'UPDATE activities SET title=?, description=?, start_date=?, deadline=?, status=?, assigned_to=?, team_id=? WHERE id=?',
      [title, description, final_start_date, deadline, status, final_assigned_to, final_team_id, id]
    );

    res.json({ message: 'Kegiatan berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/activities/:id
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permission
    const [act] = await db.query('SELECT team_id, created_by FROM activities WHERE id = ?', [id]);
    if (!act.length) return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });

    if (req.user.role === 'pegawai' && req.user.is_leader) {
      const [team] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [act[0].team_id]);
      if (parseInt(act[0].created_by) !== parseInt(req.user.id) && (!team.length || parseInt(team[0].leader_id) !== parseInt(req.user.id))) {
        return res.status(403).json({ message: 'Akses ditolak.' });
      }
    } else if (!['admin', 'kasubag', 'kepala_bps'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    await db.query('DELETE FROM activities WHERE id=?', [id]);
    res.json({ message: 'Kegiatan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/activities/:id/monitoring
const getActivityMonitoring = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has permission to monitor this activity
    const [act] = await db.query('SELECT team_id, created_by FROM activities WHERE id = ?', [id]);
    if (!act.length) return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });

    if (req.user.role === 'pegawai' && req.user.is_leader) {
      const [team] = await db.query('SELECT leader_id FROM teams WHERE id = ?', [act[0].team_id]);
      if (act[0].created_by !== req.user.id && (!team.length || team[0].leader_id !== req.user.id)) {
        return res.status(403).json({ message: 'Akses ditolak. Anda bukan ketua tim untuk kegiatan ini.' });
      }
    } else if (req.user.role !== 'admin' && req.user.role !== 'kepala_bps') {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }
    
    // 1. Get all assigned users
    const queryAssigned = `
      SELECT u.id, u.name, u.nip, u.jabatan
      FROM (
        SELECT user_id FROM team_members WHERE team_id = (SELECT team_id FROM activities WHERE id = ?)
        UNION
        SELECT assigned_to FROM activities WHERE id = ? AND assigned_to IS NOT NULL
      ) assigned
      JOIN users u ON assigned.user_id = u.id
    `;
    const [members] = await db.query(queryAssigned, [id, id]);

    // 2. Get latest progress for each member
    const queryProgress = `
      SELECT DISTINCT ON (user_id) 
        user_id, progress_percentage, notes, file_report, created_at
      FROM activity_progress
      WHERE activity_id = ?
      ORDER BY user_id, created_at DESC
    `;
    const [progress] = await db.query(queryProgress, [id]);

    // Combine
    const monitoring = members.map(m => {
      const p = progress.find(p => p.user_id === m.id);
      return {
        ...m,
        progress: p ? p.progress_percentage : 0,
        notes: p ? p.notes : '-',
        file_report: p ? p.file_report : null,
        updated_at: p ? p.created_at : null
      };
    });

    res.json(monitoring);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getActivities, createActivity, updateActivity, getActivityMonitoring, deleteActivity };
