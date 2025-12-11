// backend/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../../db");

const router = express.Router();

// helpers
const createAccessToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
  );

const createRefreshToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d" }
  );

const sendRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: false, // set true in production with HTTPS
    sameSite: "lax",
    path: "/api/auth/refresh",
  });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1) Check if user already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    // 2) Hash password
    const saltRounds = Number(process.env.BCRYPT_ROUNDS || 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3) Insert into DB
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, full_name, email, created_at`,
      [username, email, passwordHash]
    );

    const user = {
      id: result.rows[0].id,
      name: result.rows[0].full_name,
      email: result.rows[0].email,
    };

    // Seed default tasks for the new user (server-side seeding ensures templates exist)
    try {
      const templates = [
        { title: "Plan today's goals", due_time: "9:00 AM" },
        { title: "Check and respond to emails", due_time: "10:00 AM" },
        { title: "Team standup / sync", due_time: "11:00 AM" },
      ];
      for (const t of templates) {
        await pool.query(
          "INSERT INTO tasks (user_id, title, due_time, completed) VALUES ($1, $2, $3, $4)",
          [user.id, t.title, t.due_time, false]
        );
      }
      console.log(`Default tasks seeded for new user ${user.id}`);
    } catch (seedErr) {
      console.error("Failed to seed default tasks:", seedErr);
      // not fatal - continue
    }

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    sendRefreshTokenCookie(res, refreshToken);

    return res.status(201).json({
      user,
      accessToken,
    });
  } catch (err) {
    console.error("Error in /register:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  console.log('POST /api/auth/login request from', req.ip);
  console.log('Request body:', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const result = await pool.query(
      "SELECT id, full_name, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const userRow = result.rows[0];

    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = {
      id: userRow.id,
      name: userRow.full_name,
      email: userRow.email,
    };

    console.log('User found, about to create tokens');
    const accessToken = createAccessToken(user);
    console.log('Token created successfully');
    const refreshToken = createRefreshToken(user);
    sendRefreshTokenCookie(res, refreshToken);

    console.log('About to send response');
    try {
      res.json({ user, accessToken });
    } catch (sendErr) {
      console.error('Error sending response:', sendErr);
    }
    console.log('Response sent');
  } catch (err) {
    console.error("Error in /login - Caught exception:", err ? err.toString() : 'NULL ERROR');
    if (err && typeof err === 'object' && err.message) {
      console.error("Error message:", err.message);
    }
    if (err && typeof err === 'object' && err.stack) {
      console.error("Stack trace:", err.stack);
    }
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, payload) => {
    if (err) {
      console.error("Refresh verify error:", err);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: payload.userId, email: payload.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
    );

    return res.json({ accessToken });
  });
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  return res.json({ message: "Logged out" });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const result = await pool.query(
      "SELECT id, email FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      // For security, don't reveal if email exists
      return res.status(200).json({ message: "If an account exists with this email, a password reset link will be sent." });
    }

    const user = result.rows[0];

    // Create a password reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: "reset" },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    // Store reset token in database (you could use a separate table or add a column)
    await pool.query(
      "UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL '1 hour' WHERE id = $2",
      [resetToken, user.id]
    );

    // In production, send email with reset link
    // For now, return the token (in real app, send via email)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return res.status(200).json({
      message: "If an account exists with this email, a password reset link will be sent.",
      // Remove this in production - only for testing
      resetToken: resetToken,
    });
  } catch (err) {
    console.error("Error in /forgot-password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required" });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    // Check if token exists in database and is not expired
    const result = await pool.query(
      "SELECT id, email FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expiry > NOW()",
      [decoded.userId, resetToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2",
      [hashedPassword, decoded.userId]
    );

    return res.status(200).json({ message: "Password reset successfully. Please login with your new password." });
  } catch (err) {
    console.error("Error in /reset-password:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
