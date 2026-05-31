const db     = require('../config/db');
const multer = require('multer');
const path   = require('path');

// Konfigurasi penyimpanan file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // maks 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.zip', '.rar'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak diizinkan. Gunakan PDF, Doc, Excel, JPG, PNG, atau ZIP/RAR.'));
    }
  }
});

// GET /api/progress
const getProgress = async (req, res) => {
  try {
    let query = `
      SELECT tl.*, t.title AS task_title, u.name AS user_name, a.title AS activity_title
      FROM task_logbooks tl
      JOIN tasks t ON tl.task_id = t.id
      JOIN activities a ON t.activity_id = a.id
      JOIN users     u ON tl.user_id      = u.id
    `;
    const params = [];
    const conditions = [];

    const { task_id } = req.query;

    if (task_id) {
      conditions.push('tl.task_id = ?');
      params.push(task_id);
    }

    if (req.user.role === 'pegawai') {
      conditions.push('tl.user_id = ?');
      params.push(req.user.id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY tl.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/progress
const createProgress = async (req, res) => {
  try {
    const { task_id, progress_percentage, notes } = req.body;
    const user_id     = req.user.id;
    const file_report = req.file ? req.file.filename : null;

    if (!task_id) {
      return res.status(400).json({ message: 'task_id wajib diisi' });
    }

    // 0. Validasi Otorisasi: Pegawai hanya boleh mengisi log-book untuk tugas yang ditugaskan padanya
    const [taskRow] = await db.query('SELECT assigned_to, activity_id FROM tasks WHERE id = ?', [task_id]);
    if (taskRow.length === 0) {
      return res.status(404).json({ message: 'Sub-tugas tidak ditemukan' });
    }
    if (req.user.role === 'pegawai' && parseInt(taskRow[0].assigned_to) !== parseInt(req.user.id)) {
      return res.status(403).json({ message: 'Akses ditolak. Anda hanya dapat mengisi log-book untuk tugas yang ditugaskan kepada Anda sendiri.' });
    }

    if (parseInt(progress_percentage) > 100) {
      return res.status(400).json({ message: 'Progress tidak boleh lebih dari 100%' });
    }

    // Save to task_logbooks (tabel logbook baru)
    const [result] = await db.query(
      'INSERT INTO task_logbooks (task_id, user_id, progress_percentage, notes, file_report) VALUES (?, ?, ?, ?, ?)',
      [task_id, user_id, progress_percentage, notes, file_report]
    );

    // Update status & progres sub-tugas
    let taskStatus = 'on_progress';
    if (parseInt(progress_percentage) === 100) taskStatus = 'selesai';
    else if (parseInt(progress_percentage) === 0) taskStatus = 'pending';

    await db.query(
      'UPDATE tasks SET progress_percentage = ?, status = ? WHERE id = ?',
      [progress_percentage, taskStatus, task_id]
    );

    // Dapatkan activity_id untuk hitung ulang progres total kegiatan induk
    if (taskRow.length > 0) {
      const activity_id = taskRow[0].activity_id;

      // Hitung rata-rata progres berdasarkan bobot sub-tugas (Weighted Sum)
      const [agg] = await db.query(
        'SELECT COALESCE(SUM(progress_percentage * weight) / 100.0, 0) as total_progress FROM tasks WHERE activity_id = ?',
        [activity_id]
      );
      const totalProgress = parseFloat(agg[0].total_progress);

      let actStatus = 'on_progress';
      if (totalProgress >= 100) actStatus = 'selesai';
      else if (totalProgress <= 0) actStatus = 'pending';

      await db.query('UPDATE activities SET status = ? WHERE id = ?', [actStatus, activity_id]);
    }

    res.status(201).json({ message: 'Log-book dan progress berhasil disimpan', id: result.insertId });
  } catch (err) {
    console.error('Error createProgress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/progress/:id (Mengedit entri log-book)
const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress_percentage, notes } = req.body;
    const file_report = req.file ? req.file.filename : null;

    // Ambil logbook yang ada
    const [log] = await db.query('SELECT * FROM task_logbooks WHERE id = ?', [id]);
    if (!log.length) return res.status(404).json({ message: 'Log-book tidak ditemukan' });

    const l = log[0];

    // Pegawai hanya bisa mengedit logbook milik sendiri pada tugas yang ditugaskan kepadanya
    if (req.user.role === 'pegawai') {
      const [taskRow] = await db.query('SELECT assigned_to FROM tasks WHERE id = ?', [l.task_id]);
      if (l.user_id !== req.user.id || (taskRow.length && parseInt(taskRow[0].assigned_to) !== parseInt(req.user.id))) {
        return res.status(403).json({ message: 'Akses ditolak. Anda hanya dapat mengedit log-book Anda sendiri untuk tugas yang ditugaskan kepada Anda.' });
      }
    }

    const newProgress = progress_percentage !== undefined ? parseInt(progress_percentage) : l.progress_percentage;
    const newNotes = notes !== undefined ? notes : l.notes;
    const newFile = file_report || l.file_report;

    await db.query(
      'UPDATE task_logbooks SET progress_percentage = ?, notes = ?, file_report = ?, updated_at = NOW() WHERE id = ?',
      [newProgress, newNotes, newFile, id]
    );

    // Update progres sub-tugas ke progres logbook terbaru untuk tugas tersebut
    const [latestLog] = await db.query(
      'SELECT progress_percentage FROM task_logbooks WHERE task_id = ? ORDER BY created_at DESC, id DESC LIMIT 1',
      [l.task_id]
    );
    if (latestLog.length > 0) {
      const latestProg = latestLog[0].progress_percentage;
      let taskStatus = 'on_progress';
      if (latestProg === 100) taskStatus = 'selesai';
      else if (latestProg === 0) taskStatus = 'pending';

      await db.query(
        'UPDATE tasks SET progress_percentage = ?, status = ? WHERE id = ?',
        [latestProg, taskStatus, l.task_id]
      );

      // Hitung ulang progres total kegiatan induk
      const [taskRow] = await db.query('SELECT activity_id FROM tasks WHERE id = ?', [l.task_id]);
      if (taskRow.length > 0) {
        const activity_id = taskRow[0].activity_id;

        const [agg] = await db.query(
          'SELECT COALESCE(SUM(progress_percentage * weight) / 100.0, 0) as total_progress FROM tasks WHERE activity_id = ?',
          [activity_id]
        );
        const totalProgress = parseFloat(agg[0].total_progress);

        let actStatus = 'on_progress';
        if (totalProgress >= 100) actStatus = 'selesai';
        else if (totalProgress <= 0) actStatus = 'pending';

        await db.query('UPDATE activities SET status = ? WHERE id = ?', [actStatus, activity_id]);
      }
    }

    res.json({ message: 'Log-book berhasil diperbarui' });
  } catch (err) {
    console.error('Error updateProgress:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getProgress, createProgress, updateProgress, upload };
