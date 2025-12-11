-- Add password reset functionality columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
