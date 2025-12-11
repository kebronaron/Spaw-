// src/app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const weatherRoutes = require("./routes/weatherRoutes");
const locationRoutes = require("./routes/locationRoutes");
const authRoutes = require("./api/auth/authRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// existing routes
app.use("/api/weather", weatherRoutes);
app.use("/api/location", locationRoutes);

// NEW auth routes
app.use("/api/auth", authRoutes);

module.exports = app;
