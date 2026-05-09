const bcrypt = require('bcrypt');
const db     = require('../config/db');

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, nip, email, role, pangkat, jabatan, unit_kerja, created_at FROM users ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, nip, email, password, role, pangkat, jabatan, unit_kerja } = req.body;

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const [result] = await db.query(
      'INSERT INTO users (name, nip, email, password, role, pangkat, jabatan, unit_kerja) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, nip, email, hashedPassword, role || 'pegawai', pangkat, jabatan, unit_kerja]
    );

    res.status(201).json({ message: 'Pegawai berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/users/:id
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nip, email, role, pangkat, jabatan, unit_kerja, password } = req.body;

    let query  = 'UPDATE users SET name=?, nip=?, email=?, role=?, pangkat=?, jabatan=?, unit_kerja=?';
    let params = [name, nip, email, role, pangkat, jabatan, unit_kerja];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password=?';
      params.push(hashedPassword);
    }

    query += ' WHERE id=?';
    params.push(id);

    await db.query(query, params);
    res.json({ message: 'Data pegawai berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'Pegawai berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
