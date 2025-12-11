const express = require("express");
const pool = require("../db");

const router = express.Router();

// Middleware to verify token and extract user ID
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = require("jsonwebtoken").verify(
      token,
      process.env.JWT_ACCESS_SECRET
    );
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// GET /api/tasks - Get all tasks for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, due_time, completed FROM tasks WHERE user_id = $1 ORDER BY created_at ASC",
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/tasks/ensure-defaults - Create default templates if user has no tasks (atomic)
router.post("/ensure-defaults", verifyToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const countRes = await client.query(
      "SELECT COUNT(*)::int AS cnt FROM tasks WHERE user_id = $1",
      [req.userId]
    );
    const cnt = countRes.rows[0].cnt;
    if (cnt === 0) {
      const templates = [
        { title: "Plan today's goals", due_time: "9:00 AM" },
        { title: "Check and respond to emails", due_time: "10:00 AM" },
        { title: "Team standup / sync", due_time: "11:00 AM" },
      ];

      for (const t of templates) {
        await client.query(
          "INSERT INTO tasks (user_id, title, due_time, completed) VALUES ($1, $2, $3, $4)",
          [req.userId, t.title, t.due_time, false]
        );
      }
      console.log(`Default templates created for user ${req.userId}`);
    }
    await client.query("COMMIT");
    res.json({ created: cnt === 0 });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error ensuring default tasks:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});

// POST /api/tasks - Create a new task
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, dueTime } = req.body;

    if (!title || !dueTime) {
      return res
        .status(400)
        .json({ message: "Title and due time are required" });
    }

    const result = await pool.query(
      "INSERT INTO tasks (user_id, title, due_time, completed) VALUES ($1, $2, $3, $4) RETURNING id, title, due_time, completed",
      [req.userId, title, dueTime, false]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/tasks/:id - Update a task
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, dueTime, completed } = req.body;

    // Verify the task belongs to the user
    const taskCheck = await pool.query(
      "SELECT user_id FROM tasks WHERE id = $1",
      [id]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (taskCheck.rows[0].user_id !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      "UPDATE tasks SET title = COALESCE($1, title), due_time = COALESCE($2, due_time), completed = COALESCE($3, completed), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, title, due_time, completed",
      [title, dueTime, completed, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/tasks/:id - Delete a task
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify the task belongs to the user
    const taskCheck = await pool.query(
      "SELECT user_id FROM tasks WHERE id = $1",
      [id]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (taskCheck.rows[0].user_id !== req.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
