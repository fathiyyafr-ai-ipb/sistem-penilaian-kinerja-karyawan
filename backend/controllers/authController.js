const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    // Cari user berdasarkan email
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Buat JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Jangan kirim password ke client
    const { password: _, ...userData } = user;

    res.json({ message: 'Login berhasil', token, user: userData });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/register (hanya admin)
const register = async (req, res) => {
  try {
    const { name, nip, email, password, role, pangkat, jabatan, unit_kerja } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, password wajib diisi' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, nip, email, password, role, pangkat, jabatan, unit_kerja) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, nip, email, hashedPassword, role || 'pegawai', pangkat, jabatan, unit_kerja]
    );

    res.status(201).json({ message: 'Pegawai berhasil ditambahkan', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, nip, email, role, pangkat, jabatan, unit_kerja, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { login, register, getProfile };
