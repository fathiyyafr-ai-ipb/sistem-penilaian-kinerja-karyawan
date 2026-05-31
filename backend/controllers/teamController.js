const db = require('../config/db');

// GET /api/teams
const getAllTeams = async (req, res) => {
  try {
    const [teams] = await db.query(`
      SELECT t.*, u.name AS leader_name
      FROM teams t
      LEFT JOIN users u ON t.leader_id = u.id
    `);

    for (let team of teams) {
      const [members] = await db.query(`
        SELECT u.id, u.name, u.jabatan
        FROM team_members tm
        JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = ?
      `, [team.id]);
      team.members = members;
    }

    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/teams
const createTeam = async (req, res) => {
  try {
    const { team_name, leader_id, type, is_active, members } = req.body;
    const finalLeaderId = leader_id || null;
    const finalType = type || 'inti';
    const finalIsActive = is_active !== undefined ? is_active : true;

    const [result] = await db.query(
      'INSERT INTO teams (team_name, leader_id, type, is_active) VALUES (?, ?, ?, ?)',
      [team_name, finalLeaderId, finalType, finalIsActive]
    );
    const team_id = result?.insertId;

    if (team_id && members && Array.isArray(members) && members.length > 0) {
      for (const user_id of members) {
        await db.query(
          'INSERT INTO team_members (team_id, user_id) VALUES (?, ?) ON CONFLICT (team_id, user_id) DO NOTHING',
          [team_id, user_id]
        );
        // Notifikasi ke setiap anggota yang ditambahkan
        await db.query(
          'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
          [user_id, `Anda telah ditambahkan ke dalam tim baru: ${team_name}`]
        );
      }
    }

    res.status(201).json({ message: 'Tim berhasil dibuat', id: team_id });
  } catch (err) {
    console.error('Error createTeam:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/teams/add-member
const addMember = async (req, res) => {
  try {
    const { team_id, user_id } = req.body;

    // Ambil nama tim
    const [teamRows] = await db.query('SELECT team_name FROM teams WHERE id = ?', [team_id]);
    if (teamRows.length === 0) {
      return res.status(404).json({ message: 'Tim tidak ditemukan' });
    }
    const team_name = teamRows[0].team_name;

    await db.query(
      'INSERT INTO team_members (team_id, user_id) VALUES (?, ?) ON CONFLICT (team_id, user_id) DO NOTHING',
      [team_id, user_id]
    );

    // Kirim notifikasi
    await db.query(
      'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
      [user_id, `Anda telah ditambahkan ke dalam tim baru: ${team_name}`]
    );

    res.json({ message: 'Anggota berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/teams/:id
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { team_name, leader_id, type, is_active, members } = req.body;
    const finalLeaderId = leader_id || null;
    const finalType = type || 'inti';
    const finalIsActive = is_active !== undefined ? is_active : true;

    // 1. Dapatkan daftar anggota saat ini sebelum dihapus
    const [existingMembersRows] = await db.query(
      'SELECT user_id FROM team_members WHERE team_id = ?',
      [id]
    );
    const existingMemberIds = existingMembersRows.map(m => m.user_id);

    // Update table teams
    await db.query(
      'UPDATE teams SET team_name = ?, leader_id = ?, type = ?, is_active = ? WHERE id = ?',
      [team_name, finalLeaderId, finalType, finalIsActive, id]
    );

    // Delete existing members then insert new ones
    await db.query('DELETE FROM team_members WHERE team_id = ?', [id]);

    if (members && Array.isArray(members) && members.length > 0) {
      for (const user_id of members) {
        await db.query(
          'INSERT INTO team_members (team_id, user_id) VALUES (?, ?) ON CONFLICT (team_id, user_id) DO NOTHING',
          [id, user_id]
        );

        // Jika user_id belum ada di existingMemberIds, kirim notifikasi
        if (!existingMemberIds.includes(user_id)) {
          await db.query(
            'INSERT INTO notifications (user_id, message) VALUES (?, ?)',
            [user_id, `Anda telah ditambahkan ke dalam tim baru: ${team_name}`]
          );
        }
      }
    }

    res.json({ message: 'Tim berhasil diperbarui' });
  } catch (err) {
    console.error('Error updateTeam:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/teams/:id
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM teams WHERE id = ?', [id]);
    res.json({ message: 'Tim berhasil dihapus' });
  } catch (err) {
    console.error('Error deleteTeam:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllTeams, createTeam, addMember, updateTeam, deleteTeam };
