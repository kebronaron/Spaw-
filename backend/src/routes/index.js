
require("dotenv").config();
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./authRoutes");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes); // /api/auth/register

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
