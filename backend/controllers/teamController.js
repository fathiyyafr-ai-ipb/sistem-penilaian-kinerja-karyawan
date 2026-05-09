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
    const { team_name, leader_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO teams (team_name, leader_id) VALUES (?, ?)',
      [team_name, leader_id]
    );
    res.status(201).json({ message: 'Tim berhasil dibuat', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/teams/add-member
const addMember = async (req, res) => {
  try {
    const { team_id, user_id } = req.body;
    await db.query(
      'INSERT IGNORE INTO team_members (team_id, user_id) VALUES (?, ?)',
      [team_id, user_id]
    );
    res.json({ message: 'Anggota berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllTeams, createTeam, addMember };
