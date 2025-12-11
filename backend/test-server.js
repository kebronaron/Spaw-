const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Simple test endpoint
app.post("/api/auth/login", (req, res) => {
  console.log("Request received!");
  res.json({ ok: true, message: "Test response" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
