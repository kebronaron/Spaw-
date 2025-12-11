const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    // Read and execute userModel.sql
    const userModelSql = fs.readFileSync(path.join(__dirname, 'src/models/userModel.sql'), 'utf8');
    await client.query(userModelSql);
    console.log('✓ Users table initialized');

    // Read and execute tasksModel.sql
    const tasksModelSql = fs.readFileSync(path.join(__dirname, 'src/models/tasksModel.sql'), 'utf8');
    await client.query(tasksModelSql);
    console.log('✓ Tasks table initialized');

    console.log('✓ Database initialization complete');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  } finally {
    client.release();
  }
}

initDatabase();
