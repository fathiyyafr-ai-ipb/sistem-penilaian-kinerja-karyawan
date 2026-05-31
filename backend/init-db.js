require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'moalhilap',
  database: 'postgres',
});

async function initDb() {
  const dbName = process.env.DB_NAME || 'SIMONEV';
  try {
    await client.connect();
    console.log('Connected to postgres database');
    
    // Check if database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
    if (res.rowCount === 0) {
      // Gunakan double quotes untuk menjaga case-sensitivity nama database
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully!`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

initDb();
