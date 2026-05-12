const db = require('../config/db');

// GET /api/attendance
const getAttendance = async (req, res) => {
  try {
    const { periode } = req.query;
    let query = `
      SELECT a.*, u.name, u.nip, u.jabatan
      FROM attendance a
      JOIN users u ON a.user_id = u.id
    `;
    const conditions = [];
    const params     = [];

    if (req.user.role === 'pegawai') {
      conditions.push('a.user_id = ?');
      params.push(req.user.id);
    }
    if (periode) {
      conditions.push('a.periode = ?');
      params.push(periode);
    }
    if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/attendance  (kasubag)
const upsertAttendance = async (req, res) => {
  try {
    const { user_id, hadir, terlambat, pulang_cepat, hadir_rapat, hadir_upacara, periode } = req.body;

    await db.query(`
      INSERT INTO attendance (user_id, hadir, terlambat, pulang_cepat, hadir_rapat, hadir_upacara, periode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (user_id, periode) DO UPDATE SET
        hadir        = EXCLUDED.hadir,
        terlambat    = EXCLUDED.terlambat,
        pulang_cepat = EXCLUDED.pulang_cepat,
        hadir_rapat  = EXCLUDED.hadir_rapat,
        hadir_upacara= EXCLUDED.hadir_upacara
    `, [user_id, hadir, terlambat, pulang_cepat, hadir_rapat, hadir_upacara, periode]);

    res.json({ message: 'Data presensi berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAttendance, upsertAttendance };
