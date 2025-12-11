// backend/routes/testRoutes.js
// Test and diagnostic endpoints (remove or restrict in production)
const express = require("express");
const db = require("../db");

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint — verifies server and database connectivity
 * Response: { status: "ok" | "error", timestamp, db_connected: boolean }
 */
router.get("/health", async (_req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    const timestamp = result.rows[0].now;
    res.status(200).json({
      status: "ok",
      timestamp,
      db_connected: true,
      uptime_ms: process.uptime() * 1000,
    });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      db_connected: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/status
 * API status endpoint — returns version, environment, and server info
 * Response: { version, environment, uptime_seconds, node_version }
 */
router.get("/status", (_req, res) => {
  res.status(200).json({
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime_seconds: Math.floor(process.uptime()),
    node_version: process.version,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/test/users
 * List all users in the database (for testing/debugging only)
 * Response: { count, users: [{ id, email, username, created_at }] }
 */
router.get("/test/users", async (_req, res) => {
  try {
    const result = await db.query(
      "SELECT id, email, username, created_at FROM users ORDER BY created_at DESC LIMIT 50"
    );
    res.status(200).json({
      count: result.rows.length,
      users: result.rows,
    });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({
      error: "Failed to fetch users",
      message: err.message,
    });
  }
});

/**
 * POST /api/test/db-connection
 * Test database connection and return connection details
 * Response: { connected: boolean, db: string, user: string }
 */
router.post("/db-connection", async (_req, res) => {
  try {
    const result = await db.query(
      "SELECT current_database(), current_user, version()"
    );
    const row = result.rows[0];
    res.status(200).json({
      connected: true,
      database: row.current_database,
      user: row.current_user,
      postgres_version: row.version.split(",")[0],
    });
  } catch (err) {
    console.error("Database connection test failed:", err.message);
    res.status(500).json({
      connected: false,
      error: err.message,
    });
  }
});

/**
 * GET /api/test/echo
 * Echo endpoint — returns request data for debugging
 * Query params: ?message=hello → returns { message: "hello", timestamp }
 */
router.get("/echo", (req, res) => {
  const message = req.query.message || "pong";
  res.status(200).json({
    message,
    query: req.query,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
