const db = require('../config/db');

// =================================================================
// GET /api/employee-of-month
// Semua user bisa akses — untuk widget Home dan halaman EOM.
// Query param: ?period=YYYY-MM
// =================================================================
const getEmployeeOfMonth = async (req, res) => {
  try {
    const { period } = req.query;
    let query = `
      SELECT eom.*, u.name, u.jabatan, u.unit_kerja, u.nip, u.pangkat,
             vb.name AS validated_by_name
      FROM employee_of_month eom
      JOIN  users u  ON eom.user_id     = u.id
      LEFT JOIN users vb ON eom.validated_by = vb.id
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

// =================================================================
// GET /api/employee-of-month/ranking?period=YYYY-MM
// Hitung ranking pegawai dari penilaian yang sudah tervalidasi.
// Tidak menyimpan ke DB — hanya kalkulasi live.
// Hanya kepala_bps & admin yang bisa akses.
// =================================================================
const getRanking = async (req, res) => {
  try {
    const { period } = req.query;
    if (!period) return res.status(400).json({ message: 'Parameter period (YYYY-MM) diperlukan' });

    // Ambil rata-rata per komponen per pegawai dari penilaian tervalidasi
    const [rows] = await db.query(`
      SELECT
        pr.user_id,
        u.name,
        u.nip,
        u.jabatan,
        u.unit_kerja,
        u.pangkat,
        COUNT(pr.id)                         AS jumlah_penilai,
        ROUND(AVG(pr.speed_score), 2)        AS avg_speed,
        ROUND(AVG(pr.quality_score), 2)      AS avg_quality,
        ROUND(AVG(pr.contribution_score), 2) AS avg_contribution,
        ROUND(AVG(pr.responsibility_score), 2) AS avg_responsibility,
        ROUND(
          (AVG(pr.speed_score) + AVG(pr.quality_score) +
           AVG(pr.contribution_score) + AVG(pr.responsibility_score)) / 4
        , 2) AS final_score
      FROM performance_reviews pr
      JOIN users u ON pr.user_id = u.id
      WHERE pr.status = 'tervalidasi'
        AND pr.periode = ?
      GROUP BY pr.user_id, u.name, u.nip, u.jabatan, u.unit_kerja, u.pangkat
      ORDER BY
        final_score        DESC,
        avg_responsibility DESC,
        avg_contribution   DESC
    `, [period]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================================================================
// POST /api/employee-of-month/determine   (kepala_bps / admin)
// Simpan TOP 3 dari ranking ke tabel employee_of_month.
// Jika sudah ada di periode itu, update saja.
// =================================================================
const determineEOM = async (req, res) => {
  try {
    const { period } = req.body;
    if (!period) return res.status(400).json({ message: 'Period diperlukan' });

    const validated_by = req.user.id;

    // Hitung ranking live
    const [top] = await db.query(`
      SELECT
        pr.user_id,
        ROUND(
          (AVG(pr.speed_score) + AVG(pr.quality_score) +
           AVG(pr.contribution_score) + AVG(pr.responsibility_score)) / 4
        , 2) AS final_score,
        ROUND(AVG(pr.responsibility_score), 2) AS avg_responsibility,
        ROUND(AVG(pr.contribution_score), 2)   AS avg_contribution
      FROM performance_reviews pr
      WHERE pr.status = 'tervalidasi'
        AND pr.periode = ?
      GROUP BY pr.user_id
      ORDER BY
        final_score        DESC,
        avg_responsibility DESC,
        avg_contribution   DESC
      LIMIT 3
    `, [period]);

    if (!top.length) {
      return res.status(400).json({ message: 'Belum ada penilaian tervalidasi untuk periode ini' });
    }

    // Hapus data EOM lama untuk periode ini lalu insert baru
    await db.query('DELETE FROM employee_of_month WHERE period = ?', [period]);

    for (const emp of top) {
      await db.query(`
        INSERT INTO employee_of_month (user_id, total_score, period, validated_by)
        VALUES (?, ?, ?, ?)
      `, [emp.user_id, emp.final_score, period, validated_by]);
    }

    res.json({ message: 'Employee of the Month berhasil ditentukan', count: top.length });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =================================================================
// DELETE /api/employee-of-month/:id   (kepala_bps / admin)
// =================================================================
const deleteEOM = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM employee_of_month WHERE id = ?', [id]);
    res.json({ message: 'Data EOM berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getEmployeeOfMonth, getRanking, determineEOM, deleteEOM };
