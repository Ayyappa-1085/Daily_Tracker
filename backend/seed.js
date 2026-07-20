require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Mission = require("./models/Mission");
const TimelineEvent = require("./models/TimelineEvent");
const Journal = require("./models/Journal");
const { todayKey, dateKeyDaysAgo, yesterdayKey } = require("./utils/date");
const { DEFAULT_MISSIONS } = require("./utils/missionDefaults");
const { DEFAULT_TIMELINE } = require("./utils/timelineDefaults");

const DEMO_EMAIL = "dude@ascend.app";
const DEMO_PASSWORD = "password123";

async function seed() {
  await connectDB();

  await User.deleteOne({ email: DEMO_EMAIL });
  const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);

  const XP_PER_LEVEL = 800;
  const totalXp = XP_PER_LEVEL * 8 + 620;

  const user = await User.create({
    name: "Dude",
    email: DEMO_EMAIL,
    password: hashed,
    totalXp,
    xpToday: 120,
    xpTodayDate: todayKey(),
    streak: 23,
    longestStreak: 23,
    lastStreakDate: yesterdayKey(),
  });

  await Mission.deleteMany({ user: user._id });
  await TimelineEvent.deleteMany({ user: user._id });
  await Journal.deleteMany({ user: user._id });

  const today = todayKey();

  await Mission.insertMany([
    {
      user: user._id,
      date: today,
      ...DEFAULT_MISSIONS[0],
      progress: 100,
      completed: true,
      completedAt: new Date(),
    },
    {
      user: user._id,
      date: today,
      ...DEFAULT_MISSIONS[1],
      progress: 45,
      completed: false,
      remainingMinutes: 18,
    },
    {
      user: user._id,
      date: today,
      ...DEFAULT_MISSIONS[2],
      progress: 0,
      completed: false,
    },
    {
      user: user._id,
      date: today,
      ...DEFAULT_MISSIONS[3],
      progress: 100,
      completed: true,
      completedAt: new Date(),
    },
    {
      user: user._id,
      date: today,
      ...DEFAULT_MISSIONS[4],
      progress: 0,
      completed: false,
    },
  ]);

  const yesterday = yesterdayKey();

  await Mission.insertMany(
    DEFAULT_MISSIONS.map((m) => ({
      user: user._id,
      date: yesterday,
      ...m,
      progress: m.type === "reading" ? 0 : 100,
      completed: m.type !== "reading",
    }))
  );

  for (let i = 2; i <= 6; i += 1) {
    const date = dateKeyDaysAgo(i);

    await Mission.insertMany(
      DEFAULT_MISSIONS.map((m) => ({
        user: user._id,
        date,
        ...m,
        progress: Math.random() > 0.25 ? 100 : 0,
        completed: Math.random() > 0.25,
      }))
    );
  }

  await TimelineEvent.insertMany(
    DEFAULT_TIMELINE.map((e, idx) => ({
      user: user._id,
      date: today,
      ...e,
      status: idx < 2 ? "done" : "pending",
    }))
  );

  await Journal.create({
    user: user._id,
    date: yesterday,
    content:
      "Solid day overall — shipped the Razorpay webhook fix. Skipped reading, need to catch up today.",
    mood: "good",
  });

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});