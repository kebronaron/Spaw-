// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");


dotenv.config();


const db = require("./db");
db.on('error', (err) => {
  console.error('DB Connection Error:', err);
  process.exit(1);
});

const authRoutes = require("./api/auth/authRoutes");
const testRoutes = require("./routes/testRoutes");
const tasksRoutes = require("./routes/tasksRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,               // allow cookies
  })
);

// mount auth routes
app.use("/api/auth", authRoutes);

// mount tasks routes
app.use("/api/tasks", tasksRoutes);

// mount test/health routes
app.use("/api", testRoutes);

app.get("/", (_req, res) => res.send("SPaW backend is running 🚀"));

// Removed duplicate /health route (now in testRoutes.js)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

// Catch unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
