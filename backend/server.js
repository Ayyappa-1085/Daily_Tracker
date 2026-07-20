require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const missionRoutes = require("./routes/missionRoutes");
const timelineRoutes = require("./routes/timelineRoutes");
const journalRoutes = require("./routes/journalRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const learningRoutes = require("./routes/learningRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);

app.use("/api/auth", authRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/progress", progressRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => console.log(`Ascend API running on port ${PORT}`));
}

start();

module.exports = app;
