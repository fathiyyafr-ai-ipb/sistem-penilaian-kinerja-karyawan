const db = require('../config/db');

// GET /api/employee-of-month
const getEmployeeOfMonth = async (req, res) => {
  try {
    const { period } = req.query;
    let query = `
      SELECT eom.*, u.name, u.jabatan, u.unit_kerja, u.nip
      FROM employee_of_month eom
      JOIN users u ON eom.user_id = u.id
    `;
    const params = [];
    if (period) { query += ' WHERE eom.period = ?'; params.push(period); }
    query += ' ORDER BY eom.total_score DESC';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/employee-of-month/determine  (kepala_bps)
const determineEOM = async (req, res) => {
  try {
    const { period } = req.body;
    const validated_by = req.user.id;

    const [top] = await db.query(`
      SELECT user_id, MAX(total_score) AS max_score
      FROM performance_reviews
      WHERE stage=2 AND status='validated' AND periode=?
      GROUP BY user_id
      ORDER BY max_score DESC
      LIMIT 3
    `, [period]);

    if (!top.length) {
      return res.status(400).json({ message: 'Belum ada penilaian tervalidasi untuk periode ini' });
    }

    for (const emp of top) {
      await db.query(`
        INSERT INTO employee_of_month (user_id, total_score, period, validated_by)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE total_score=VALUES(total_score), validated_by=VALUES(validated_by)
      `, [emp.user_id, emp.max_score, period, validated_by]);
    }

    res.json({ message: 'Employee of the Month berhasil ditentukan', count: top.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getEmployeeOfMonth, determineEOM };
