const db = require('../config/db');

// =================================================================
// GET /api/reviews
// - pegawai   : hanya penilaian miliknya yang sudah 'tervalidasi'
// - ketua_tim / kasubag : penilaian yang reviewer_id = dirinya
// - kepala_bps / admin  : semua penilaian
// =================================================================
const getReviews = async (req, res) => {
  try {
    let query = `
      SELECT
        pr.*,
        u.name      AS user_name,
        u.nip,
        u.jabatan,
        u.unit_kerja,
        r.name      AS reviewer_name,
        r.jabatan   AS reviewer_jabatan,
        r.role      AS reviewer_role,
        vb.name     AS validated_by_name
      FROM performance_reviews pr
      JOIN  users u  ON pr.user_id       = u.id
      JOIN  users r  ON pr.reviewer_id   = r.id
      LEFT JOIN users vb ON pr.validated_by = vb.id
    `;
    const params = [];

    if (req.user.role === 'pegawai') {
      query += ` WHERE pr.user_id = ? AND pr.status = 'tervalidasi'`;
      params.push(req.user.id);
    } else if (req.user.role === 'ketua_tim' || req.user.role === 'kasubag') {
      query += ' WHERE pr.reviewer_id = ?';
      params.push(req.user.id);
    }
    // kepala_bps & admin: tanpa filter → lihat semua

    query += ' ORDER BY pr.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error in getReviews:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================================================================
// GET /api/reviews/subordinates
// Daftar pegawai yang bisa dinilai oleh penilai yang sedang login.
// - ketua_tim : anggota tim yang dipimpinnya
// - kasubag   : semua pegawai (karena kasubag menilai seluruh staf)
// =================================================================
const getSubordinates = async (req, res) => {
  try {
    console.log('Fetching subordinates for user:', req.user);
    let rows;
    if (req.user.role === 'ketua_tim') {
      [rows] = await db.query(`
        SELECT u.id, u.name, u.nip, u.jabatan, u.unit_kerja, u.role
        FROM team_members tm
        JOIN teams t ON tm.team_id = t.id
        JOIN users u ON tm.user_id = u.id
        WHERE t.leader_id = ?
          AND u.role = 'pegawai'
      `, [req.user.id]);
    } else {
      // kasubag & admin: semua pegawai
      [rows] = await db.query(
        `SELECT id, name, nip, jabatan, unit_kerja, role FROM users WHERE role = 'pegawai' ORDER BY name`
      );
    }
    console.log('Subordinates found:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error in getSubordinates:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================================================================
// POST /api/reviews
// Buat penilaian baru oleh ketua_tim atau kasubag.
// Satu reviewer hanya bisa menilai satu pegawai sekali per periode.
// =================================================================
const createReview = async (req, res) => {
  try {
    const {
      user_id,
      speed_score,
      quality_score,
      contribution_score,
      responsibility_score,
      reviewer_notes,
      periode
    } = req.body;

    const reviewer_id = req.user.id;

    // Cek duplikat: reviewer yang sama menilai pegawai yang sama di periode yang sama
    const [existing] = await db.query(
      'SELECT id FROM performance_reviews WHERE user_id = ? AND reviewer_id = ? AND periode = ?',
      [user_id, reviewer_id, periode]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        message: 'Anda sudah menilai pegawai ini pada periode tersebut. Gunakan fitur edit untuk memperbarui.'
      });
    }

    // Hitung rata-rata
    const total = (
      (+speed_score + +quality_score + +contribution_score + +responsibility_score) / 4
    ).toFixed(2);

    const [result] = await db.query(`
      INSERT INTO performance_reviews
        (user_id, reviewer_id, speed_score, quality_score, contribution_score,
         responsibility_score, total_score, reviewer_notes, status, periode)
      VALUES (?,?,?,?,?,?,?,?,'menunggu_validasi',?)
    `, [
      user_id, reviewer_id,
      speed_score, quality_score, contribution_score, responsibility_score,
      total, reviewer_notes || null, periode
    ]);

    res.status(201).json({ message: 'Penilaian berhasil disimpan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================================================================
// PUT /api/reviews/:id
// - ketua_tim / kasubag : bisa edit jika status masih 'menunggu_validasi'
//                         dan mereka adalah reviewer-nya
// - kepala_bps / admin  : bisa edit nilai + tambah kepala_notes kapan saja
//                         (asalkan belum 'tervalidasi')
// =================================================================
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      speed_score,
      quality_score,
      contribution_score,
      responsibility_score,
      reviewer_notes,
      kepala_notes,
      periode
    } = req.body;

    const [rev] = await db.query('SELECT * FROM performance_reviews WHERE id = ?', [id]);
    if (!rev.length) return res.status(404).json({ message: 'Penilaian tidak ditemukan' });

    const r = rev[0];

    // Penilaian yang sudah tervalidasi tidak bisa diedit oleh siapapun kecuali admin
    if (r.status === 'tervalidasi' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Penilaian yang sudah tervalidasi tidak dapat diedit.' });
    }

    // Ketua Tim / Kasubag: hanya bisa edit penilaian miliknya sendiri
    if (['ketua_tim', 'kasubag'].includes(req.user.role)) {
      if (parseInt(r.reviewer_id) !== parseInt(req.user.id)) {
        return res.status(403).json({ message: 'Anda hanya dapat mengedit penilaian yang Anda buat.' });
      }
    }

    // Hitung ulang total
    const newSpeed  = speed_score  ?? r.speed_score;
    const newQual   = quality_score ?? r.quality_score;
    const newContr  = contribution_score ?? r.contribution_score;
    const newResp   = responsibility_score ?? r.responsibility_score;
    const total     = ((+newSpeed + +newQual + +newContr + +newResp) / 4).toFixed(2);

    // Kepala BPS juga bisa update kepala_notes
    const newKepalaNote = (req.user.role === 'kepala_bps' || req.user.role === 'admin')
      ? (kepala_notes ?? r.kepala_notes)
      : r.kepala_notes;

    await db.query(`
      UPDATE performance_reviews
      SET speed_score=?, quality_score=?, contribution_score=?,
          responsibility_score=?, total_score=?,
          reviewer_notes=?, kepala_notes=?, periode=?
      WHERE id=?
    `, [
      newSpeed, newQual, newContr, newResp, total,
      reviewer_notes ?? r.reviewer_notes,
      newKepalaNote,
      periode ?? r.periode,
      id
    ]);

    res.json({ message: 'Penilaian berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================================================================
// DELETE /api/reviews/:id
// Hanya reviewer sendiri yang bisa hapus, dan hanya jika belum tervalidasi.
// Admin bisa hapus kapan saja.
// =================================================================
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const [rev] = await db.query('SELECT * FROM performance_reviews WHERE id = ?', [id]);
    if (!rev.length) return res.status(404).json({ message: 'Penilaian tidak ditemukan' });

    const r = rev[0];

    if (r.status === 'tervalidasi' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Penilaian yang sudah tervalidasi tidak dapat dihapus.' });
    }

    if (parseInt(r.reviewer_id) !== parseInt(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Anda hanya dapat menghapus penilaian yang Anda buat.' });
    }

    await db.query('DELETE FROM performance_reviews WHERE id = ?', [id]);
    res.json({ message: 'Penilaian berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================================================================
// POST /api/reviews/:id/validate   (kepala_bps / admin)
// Kepala BPS memvalidasi penilaian. Bisa sekaligus tambah kepala_notes.
// =================================================================
const validateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { kepala_notes } = req.body;

    const [rev] = await db.query('SELECT * FROM performance_reviews WHERE id = ?', [id]);
    if (!rev.length) return res.status(404).json({ message: 'Penilaian tidak ditemukan' });

    if (rev[0].status === 'tervalidasi') {
      return res.status(400).json({ message: 'Penilaian ini sudah tervalidasi.' });
    }

    await db.query(`
      UPDATE performance_reviews
      SET status='tervalidasi',
          validated_by=?,
          validated_at=NOW(),
          kepala_notes=COALESCE(?, kepala_notes)
      WHERE id=?
    `, [req.user.id, kepala_notes || null, id]);

    res.json({ message: 'Penilaian berhasil divalidasi' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================================================================
// POST /api/reviews/validate-bulk  (kepala_bps / admin)
// Validasi banyak penilaian sekaligus.
// =================================================================
const validateBulk = async (req, res) => {
  try {
    const { review_ids } = req.body;
    if (!Array.isArray(review_ids) || review_ids.length === 0) {
      return res.status(400).json({ message: 'review_ids harus berupa array yang tidak kosong' });
    }

    const placeholders = review_ids.map(() => '?').join(',');
    await db.query(`
      UPDATE performance_reviews
      SET status='tervalidasi', validated_by=?, validated_at=NOW()
      WHERE id IN (${placeholders}) AND status != 'tervalidasi'
    `, [req.user.id, ...review_ids]);

    res.json({ message: `${review_ids.length} penilaian berhasil divalidasi` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getReviews,
  getSubordinates,
  createReview,
  updateReview,
  deleteReview,
  validateReview,
  validateBulk
};
