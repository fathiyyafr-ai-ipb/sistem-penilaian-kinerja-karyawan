const { Pool } = require('pg');
require('dotenv').config();

// Buat koneksi pool PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'PIa1234!',
  database: process.env.DB_NAME || 'Simonev',
  max: 10,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test koneksi saat startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Gagal koneksi ke PostgreSQL:', err.message);
  }
  console.log('Berhasil terhubung ke PostgreSQL!');
  if (release) release();
});

// Wrapper agar kompatibel dengan cara kerja mysql2 di aplikasi ini
const db = {
  query: async (sql, params = []) => {
    // 1. Ubah syntax '?' dari MySQL menjadi '$1, $2' untuk PostgreSQL
    let newSql = sql;
    if (params && params.length > 0) {
      let i = 1;
      newSql = sql.replace(/\?/g, () => `$${i++}`);
    }

    // 2. Jika ini query INSERT, pastikan PostgreSQL mengembalikan ID (RETURNING id)
    const isInsert = newSql.trim().toUpperCase().startsWith('INSERT');
    if (isInsert && !newSql.toUpperCase().includes('RETURNING')) {
      newSql += ' RETURNING id';
    }

    try {
      const res = await pool.query(newSql, params);
      
      // 3. Format hasil kembalian agar mirip dengan [rows] di mysql2
      if (isInsert) {
        // mysql2 mengembalikan result.insertId untuk INSERT
        const insertId = res.rows.length > 0 ? res.rows[0].id : null;
        return [{ insertId }, res.fields];
      }
      
      // Untuk SELECT, UPDATE, DELETE, kembalikan array baris
      return [res.rows, res.fields];
    } catch (err) {
      console.error('Database Query Error:', err.message);
      console.error('SQL:', newSql);
      throw err;
    }
  }
};

module.exports = db;
