const jwt = require('jsonwebtoken');

// Middleware: verifikasi JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan, akses ditolak' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // simpan data user di request
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
};

// Middleware: cek role tertentu
// Contoh penggunaan: authorize('admin', 'kasubag')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Akses ditolak. Hanya untuk: ${roles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = { verifyToken, authorize };
