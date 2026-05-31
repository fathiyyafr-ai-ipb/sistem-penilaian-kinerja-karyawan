require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'moalhilap',
  database: process.env.DB_NAME || 'SIMONEV',
});

async function runSql() {
  const dbName = process.env.DB_NAME || 'SIMONEV';
  try {
    await client.connect();
    console.log(`Connected to database: ${dbName}`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    console.log('Running schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('schema.sql executed successfully');

    console.log('Running seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('seed.sql executed successfully');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

runSql();
