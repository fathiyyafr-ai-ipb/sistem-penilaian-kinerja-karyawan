const db     = require('../config/db');
const multer = require('multer');
const path   = require('path');

// Konfigurasi penyimpanan file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, './uploads/'); },
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // maks 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xlsx', '.jpg', '.png'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Format file tidak diizinkan'));
  }
});

// GET /api/progress
const getProgress = async (req, res) => {
  try {
    let query = `
      SELECT ap.*, a.title AS activity_title, u.name AS user_name
      FROM activity_progress ap
      JOIN activities a ON ap.activity_id = a.id
      JOIN users     u ON ap.user_id      = u.id
    `;
    const params = [];

    if (req.user.role === 'pegawai') {
      query += ' WHERE ap.user_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY ap.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/progress
const createProgress = async (req, res) => {
  try {
    const { activity_id, progress_percentage, notes } = req.body;
    const user_id     = req.user.id;
    const file_report = req.file ? req.file.filename : null;

    // Validasi: progress tidak boleh lebih dari 100%
    if (parseInt(progress_percentage) > 100) {
      return res.status(400).json({ message: 'Progress tidak boleh lebih dari 100%' });
    }

    const [result] = await db.query(
      'INSERT INTO activity_progress (activity_id, user_id, progress_percentage, notes, file_report) VALUES (?, ?, ?, ?, ?)',
      [activity_id, user_id, progress_percentage, notes, file_report]
    );

    // Update status kegiatan otomatis
    if (parseInt(progress_percentage) === 100) {
      await db.query("UPDATE activities SET status='selesai'     WHERE id=?", [activity_id]);
    } else if (parseInt(progress_percentage) > 0) {
      await db.query("UPDATE activities SET status='on_progress' WHERE id=?", [activity_id]);
    }

    res.status(201).json({ message: 'Progress berhasil disimpan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getProgress, createProgress, upload };
