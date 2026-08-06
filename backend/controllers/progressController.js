const Mission = require("../models/Mission");
const UserLearningProgress = require("../models/UserLearningProgress");
const { dateKeyDaysAgo } = require("../utils/date");
const { syncStreakBreak } = require("../utils/gamification");
const { getCache, setCache } = require("../utils/cache");

async function getProgress(req, res, next) {
  try {
    const user = req.user;
    const cacheKey = `progress:${user._id}`;
    const cached = getCache(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    syncStreakBreak(user);
    if (user.isModified()) {
      await user.save();
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const monthKey = String(currentMonth).padStart(2, "0");
    const currentMonthPrefix = `${currentYear}-${monthKey}`;

    const missions = await Mission.find({
      user: user._id,
    }).lean();

    const missionsByDate = new Map();

    for (const mission of missions) {
      if (!missionsByDate.has(mission.date)) {
        missionsByDate.set(mission.date, []);
      }

      missionsByDate.get(mission.date).push(mission);
    }

    const buildDaySummary = (date) => {
      const dayMissions = missionsByDate.get(date) || [];

      return dayMissions.reduce(
        (summary, mission) => {
          summary.completed += mission.completed ? 1 : 0;
          summary.total += 1;
          summary.xp += mission.completed ? mission.xpReward || 0 : 0;
          return summary;
        },
        {
          date,
          completed: 0,
          total: 0,
          xp: 0,
        },
      );
    };

    const weekly = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = dateKeyDaysAgo(i);
      const day = buildDaySummary(date);

      weekly.push({
        day: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }),
        ...day,
      });
    }

    const currentMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    const monthly = Array.from({ length: 35 }, (_, index) => {
      const dayNumber = index + 1;

      if (dayNumber > currentMonthDays) {
        return {
          date: "",
          completed: 0,
          total: 0,
          xp: 0,
        };
      }

      const date = `${currentMonthPrefix}-${String(dayNumber).padStart(2, "0")}`;
      return buildDaySummary(date);
    });

    let totalXp = 0;
    let totalCompleted = 0;
    let totalMissions = 0;
    let bestDay = { date: "", xp: 0 };

    for (const [date, dayMissions] of missionsByDate.entries()) {
      const dayXp = dayMissions.reduce(
        (sum, mission) => sum + (mission.completed ? mission.xpReward || 0 : 0),
        0,
      );
      const dayCompleted = dayMissions.filter((mission) => mission.completed).length;

      totalXp += dayXp;
      totalCompleted += dayCompleted;
      totalMissions += dayMissions.length;

      if (dayXp > bestDay.xp) {
        bestDay = { date, xp: dayXp };
      }
    }

    const activeDays = missionsByDate.size;
    const averageXp = activeDays === 0 ? 0 : Math.round(totalXp / activeDays);
    const completionRate = totalMissions === 0 ? 0 : Math.round((totalCompleted / totalMissions) * 100);

    const learning = await UserLearningProgress.findOne({
      user: user._id,
    }).lean();

    const learningSolved = learning?.completedQuestions?.length || 0;

    const response = {
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
        learningSolved,
      },
    };

    setCache(cacheKey, response, 20 * 1000);

    res.json(response);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProgress,
};