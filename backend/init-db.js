const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '01234567890',
  database: 'postgres',
});

async function initDb() {
  try {
    await client.connect();
    console.log('Connected to postgres database');
    
    // Check if bps_kinerja exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'bps_kinerja'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE bps_kinerja');
      console.log('Database bps_kinerja created');
    } else {
      console.log('Database bps_kinerja already exists');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

initDb();
