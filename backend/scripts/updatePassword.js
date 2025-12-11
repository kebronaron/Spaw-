const pool = require('../src/db');
const bcrypt = require('bcryptjs');

const [,,email, newPass] = process.argv;
if (!email || !newPass) {
  console.error('Usage: node scripts/updatePassword.js <email> <newPassword>');
  process.exit(1);
}

(async ()=>{
  try {
    const hash = await bcrypt.hash(newPass, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE email=$2', [hash, email]);
    console.log('Password updated for', email);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
