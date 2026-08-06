const Mission = require("../models/Mission");
const UserLearningProgress = require("../models/UserLearningProgress");
const LeetCodeQuestion = require("../models/LeetCodeQuestion");
const { todayKey, dateKeyDaysAgo } = require("../utils/date");
const { ensureTodayMissions } = require("../utils/missionDefaults");
const {
  ensureTodayTimeline,
  computeDisplayStatus,
  nowMinutesOfDay,
} = require("../utils/timelineDefaults");
const { syncStreakBreak } = require("../utils/gamification");
const { generateInsight } = require("../utils/insightEngine");
const { getCache, setCache, clearUserCache } = require("../utils/cache");

/** Last 7 days of completion-% and XP-earned, oldest first — feeds the sparkline charts. */
async function getWeeklyTrends(userId) {
  const start = dateKeyDaysAgo(6);
  const rows = await Mission.find({
    user: userId,
    date: { $gte: start },
  }).lean();

  const byDate = {};
  for (const m of rows) {
    if (!byDate[m.date]) byDate[m.date] = { total: 0, done: 0, xp: 0 };
    byDate[m.date].total += 1;
    if (m.completed) {
      byDate[m.date].done += 1;
      byDate[m.date].xp += m.xpReward;
    }
  }

  const completion = [];
  const xp = [];
  for (let i = 6; i >= 0; i -= 1) {
    const key = dateKeyDaysAgo(i);
    const day = byDate[key];
    completion.push(
      day && day.total > 0 ? Math.round((day.done / day.total) * 100) : 0,
    );
    xp.push(day ? day.xp : 0);
  }

  return { completion, xp };
}

// GET /api/dashboard  — everything the Home screen needs in one round trip
async function getDashboard(req, res, next) {
  try {
    const date = req.query.date || todayKey();
    const user = req.user;
    const cacheKey = `dashboard:${user._id}:${date}`;
    const cached = getCache(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    syncStreakBreak(user);
    if (user.isModified()) {
      await user.save();
    }

    const missionsPromise = ensureTodayMissions(user._id, date);
    const timelinePromise = ensureTodayTimeline(user._id, date);
    const insightPromise = generateInsight(user._id);
    const trendsPromise = getWeeklyTrends(user._id);

    const [missions, timelineEvents, insight, trends] = await Promise.all([
      missionsPromise,
      timelinePromise,
      insightPromise,
      trendsPromise,
    ]);

    const nowMinutes = nowMinutesOfDay();
    const timeline = timelineEvents.map((e) => ({
      ...e.toObject(),
      status: computeDisplayStatus(e, nowMinutes),
    }));

    const overallProgress =
      missions.length > 0
        ? Math.round(
            missions.reduce((sum, m) => sum + m.progress, 0) / missions.length,
          )
        : 0;

    const totalLearningQuestions = await LeetCodeQuestion.countDocuments({
      isActive: true,
    });

    let continueLearning = null;
    const progressDoc = await UserLearningProgress.findOne({
      user: user._id,
    })
      .select("currentQuestion completedQuestions progress")
      .lean();

    if (progressDoc?.currentQuestion) {
      const currentQuestion = await LeetCodeQuestion.findById(
        progressDoc.currentQuestion,
      )
        .select(
          "leetcodeNumber problemName topic difficulty pattern estimatedTime xp",
        )
        .lean();

      if (currentQuestion) {
        const completedIds = new Set(
          (progressDoc.completedQuestions || []).map((id) => id.toString()),
        );

        continueLearning = {
          _id: currentQuestion._id,
          problemName: currentQuestion.problemName,
          topic: currentQuestion.topic,
          difficulty: currentQuestion.difficulty,
          pattern: currentQuestion.pattern,
          estimatedTime: currentQuestion.estimatedTime,
          xp: currentQuestion.xp,
          completed: completedIds.has(currentQuestion._id.toString()),
          progress: progressDoc.progress || 0,
          completedCount: progressDoc.completedQuestions?.length || 0,
          total: totalLearningQuestions,
          subtitle: `DSA • ${currentQuestion.topic}`,
          leetcodeNumber: currentQuestion.leetcodeNumber,
        };
      }
    }

    const response = {
      date,
      greetingName: user.name,
      streakDay: user.streak,
      quote: user.quote,
      missions,
      overallProgress,
      stats: {
        streak: user.streak,
        level: user.level,
        totalXp: user.totalXp,
        xpToday: user.xpToday,
      },
      continueLearning,
      currentQuestion: continueLearning,
      aiInsight: insight,
      timeline,
      trends,
    };

    setCache(cacheKey, response, 15 * 1000);

    res.json(response);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
