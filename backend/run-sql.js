const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '01234567890',
  database: 'bps_kinerja',
});

async function runSql() {
  try {
    await client.connect();
    console.log('Connected to bps_kinerja database');

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
