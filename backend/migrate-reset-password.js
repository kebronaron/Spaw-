const pool = require('./src/db');

async function addPasswordResetColumns() {
  try {
    const query = `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(500);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
    `;
    
    await pool.query(query);
    console.log('Password reset columns added successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error adding columns:', err);
    process.exit(1);
  }
}

addPasswordResetColumns();
