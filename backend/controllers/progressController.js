const ProgressHistory = require("../models/ProgressHistory");

async function getProgress(req, res, next) {
  try {
    const user = req.user;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Current Month
    const currentHistory = await ProgressHistory.findOne({
      user: user._id,
      year: currentYear,
      month: currentMonth,
    });
    const monthly = currentHistory?.days || [];

const weekly = [];

for (let i = 6; i >= 0; i--) {
  const date = new Date();
  date.setDate(date.getDate() - i);

  const dateKey = date.toISOString().split("T")[0];

  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const existing = monthly.find((d) => d.date === dateKey);

  weekly.push({
    day: labels[date.getDay()],
    date: dateKey,
    completed: existing?.completed || 0,
    total: existing?.total || 0,
    xp: existing?.xp || 0,
  });
}

    // Last 12 Months
    const history = await ProgressHistory.find({
      user: user._id,
    })
      .sort({
        year: -1,
        month: -1,
      })
      .limit(12);

    // Statistics
    let totalXp = 0;
    let totalCompleted = 0;
    let totalMissions = 0;
    let totalLearning = 0;

    let bestDay = {
      date: "",
      xp: 0,
    };

    history.forEach((month) => {
      month.days.forEach((day) => {
        totalXp += day.xp;
        totalCompleted += day.completed;
        totalMissions += day.total;
        totalLearning += day.learning;

        if (day.xp > bestDay.xp) {
          bestDay = {
            date: day.date,
            xp: day.xp,
          };
        }
      });
    });

    const averageXp =
      totalXp === 0
        ? 0
        : Math.round(totalXp / Math.max(monthly.length, 1));

    const completionRate =
      totalMissions === 0
        ? 0
        : Math.round((totalCompleted / totalMissions) * 100);

    res.json({
      user: {
        level: user.level,
        totalXp: user.totalXp,
        xpToday: user.xpToday,
        streak: user.streak,
        longestStreak: user.longestStreak,
      },

      weekly,

      monthly,

      stats: {
        averageXp,
        completionRate,
        bestDay,
        learningSolved: totalLearning,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProgress,
};