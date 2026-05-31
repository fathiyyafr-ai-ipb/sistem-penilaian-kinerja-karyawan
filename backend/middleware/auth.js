const jwt = require('jsonwebtoken');

// Middleware: verifikasi JWT token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, akses ditolak' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan data user di request

    // Cek secara dinamis ke database apakah user memimpin suatu tim
    const db = require('../config/db');
    const [teams] = await db.query('SELECT 1 FROM teams WHERE leader_id = ? LIMIT 1', [req.user.id]);
    req.user.is_leader = teams.length > 0;

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
};

// Middleware: cek role tertentu
// Contoh penggunaan: authorize('admin', 'kasubag')
const authorize = (...roles) => {
  return (req, res, next) => {
    // Lolos jika role cocok secara eksplisit
    if (roles.includes(req.user.role)) {
      return next();
    }
    // Lolos jika route membutuhkan 'ketua_tim' dan user adalah leader aktif
    if (roles.includes('ketua_tim') && req.user.is_leader) {
      return next();
    }

    return res.status(403).json({
      message: `Akses ditolak. Hanya untuk: ${roles.join(', ')}`
    });
  };
};

module.exports = { verifyToken, authorize };
