const db = require('../config/db');

// GET /api/reviews
const getReviews = async (req, res) => {
  try {
    let query = `
      SELECT pr.*, u.name AS user_name, u.nip, u.jabatan,
             r.name AS reviewer_name
      FROM performance_reviews pr
      JOIN users u ON pr.user_id    = u.id
      JOIN users r ON pr.reviewer_id= r.id
    `;
    const params = [];
    if (req.user.role === 'pegawai') {
      query += ' WHERE pr.user_id = ?';
      params.push(req.user.id);
    }
    query += ' ORDER BY pr.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/reviews/stage1  (ketua_tim)
const createStage1 = async (req, res) => {
  try {
    const { user_id, speed_score, quality_score, contribution_score, notes, periode } = req.body;
    const reviewer_id = req.user.id;
    const total = ((+speed_score + +quality_score + +contribution_score) / 3).toFixed(2);

    const [result] = await db.query(`
      INSERT INTO performance_reviews
        (user_id, reviewer_id, stage, speed_score, quality_score, contribution_score, total_score, notes, status, periode)
      VALUES (?, ?, 1, ?, ?, ?, ?, ?, 'submitted', ?)
    `, [user_id, reviewer_id, speed_score, quality_score, contribution_score, total, notes, periode]);

    res.status(201).json({ message: 'Penilaian tahap 1 berhasil disimpan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/reviews/stage2  (kasubag)
const createStage2 = async (req, res) => {
  try {
    const { user_id, discipline_score, notes, periode } = req.body;
    const reviewer_id = req.user.id;

    // Pastikan penilaian tahap 1 sudah ada
    const [stage1] = await db.query(
      "SELECT * FROM performance_reviews WHERE user_id=? AND stage=1 AND periode=? AND status='submitted'",
      [user_id, periode]
    );
    if (!stage1.length) {
      return res.status(400).json({ message: 'Penilaian tahap 1 belum ada atau belum selesai' });
    }

    // 70% nilai tahap 1 + 30% disiplin
    const totalFinal = (stage1[0].total_score * 0.7 + +discipline_score * 0.3).toFixed(2);

    const [result] = await db.query(`
      INSERT INTO performance_reviews
        (user_id, reviewer_id, stage, discipline_score, total_score, notes, status, periode)
      VALUES (?, ?, 2, ?, ?, ?, 'submitted', ?)
    `, [user_id, reviewer_id, discipline_score, totalFinal, notes, periode]);

    res.status(201).json({ message: 'Penilaian tahap 2 berhasil disimpan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/validation/final  (kepala_bps)
const validateFinal = async (req, res) => {
  try {
    const { review_ids, periode } = req.body;
    await db.query(
      "UPDATE performance_reviews SET status='validated' WHERE id IN (?) AND periode=?",
      [review_ids, periode]
    );
    res.json({ message: 'Penilaian berhasil divalidasi' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [rev] = await db.query('SELECT reviewer_id FROM performance_reviews WHERE id = ?', [id]);
    if (!rev.length) return res.status(404).json({ message: 'Penilaian tidak ditemukan' });

    if (rev[0].reviewer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    await db.query('DELETE FROM performance_reviews WHERE id = ?', [id]);
    res.json({ message: 'Penilaian berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { speed_score, quality_score, contribution_score, discipline_score, notes, periode } = req.body;

    const [rev] = await db.query('SELECT * FROM performance_reviews WHERE id = ?', [id]);
    if (!rev.length) return res.status(404).json({ message: 'Penilaian tidak ditemukan' });

    if (rev[0].reviewer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    let total = rev[0].total_score;
    if (rev[0].stage === 1) {
      total = ((+speed_score + +quality_score + +contribution_score) / 3).toFixed(2);
      await db.query(`
        UPDATE performance_reviews 
        SET speed_score=?, quality_score=?, contribution_score=?, total_score=?, notes=?, periode=?
        WHERE id=?
      `, [speed_score, quality_score, contribution_score, total, notes, periode, id]);
    } else {
      // Untuk stage 2, kita perlu nilai stage 1
      const [stage1] = await db.query(
        "SELECT total_score FROM performance_reviews WHERE user_id=? AND stage=1 AND periode=?",
        [rev[0].user_id, periode]
      );
      if (stage1.length) {
        total = (stage1[0].total_score * 0.7 + +discipline_score * 0.3).toFixed(2);
      } else {
        total = (+discipline_score).toFixed(2);
      }
      await db.query(`
        UPDATE performance_reviews 
        SET discipline_score=?, total_score=?, notes=?, periode=?
        WHERE id=?
      `, [discipline_score, total, notes, periode, id]);
    }

    res.json({ message: 'Penilaian berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getReviews, createStage1, createStage2, validateFinal, updateReview, deleteReview };
