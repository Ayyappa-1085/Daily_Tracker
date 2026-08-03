require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
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

const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(cors({ origin: clientOrigin }));
app.use(express.json());
app.use(compression());

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many auth attempts. Please try again later.",
  },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/progress", progressRoutes);

if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }

    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function start() {
  await connectDB();
  const server = app.listen(PORT, () => {
    // Server started
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Set a different PORT in your environment or stop the process using this port.`,
      );
      process.exit(1);
    }
    console.error("Server error:", err);
    process.exit(1);
  });
}

start();

module.exports = app;
