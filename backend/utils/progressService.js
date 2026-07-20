const ProgressHistory = require("../models/ProgressHistory");
const Mission = require("../models/Mission");
const UserLearningProgress = require("../models/UserLearningProgress");
const Journal = require("../models/Journal");
const { todayKey } = require("./date");

async function updateProgressHistory(user) {
  try {
    const today = todayKey();
    const [year, month] = today.split("-").map(Number);

    // Missions
    const totalMissions = await Mission.countDocuments({
      user: user._id,
      date: today,
    });

    const completedMissions = await Mission.countDocuments({
      user: user._id,
      date: today,
      completed: true,
    });

    // XP
    const xp = user.xpToday;

    // Learning
    const learning = await UserLearningProgress.findOne({
      user: user._id,
    });

    const solved = learning?.completedQuestions?.length || 0;

    // Journal
    const journal = await Journal.exists({
      user: user._id,
      date: today,
    });

    // Find month document
    let history = await ProgressHistory.findOne({
      user: user._id,
      year,
      month,
    });

    if (!history) {
      history = await ProgressHistory.create({
        user: user._id,
        year,
        month,
        days: [],
      });
    }

    const todayData = {
      date: today,
      xp,
      completed: completedMissions,
      total: totalMissions,
      learning: solved,
      journal: Boolean(journal),
    };

    const index = history.days.findIndex(
      (day) => day.date === today
    );

    if (index === -1) {
      history.days.push(todayData);
    } else {
      history.days[index] = todayData;
    }

    await history.save();

    return history;
  } catch (err) {
    console.error("updateProgressHistory ERROR:", err);
    throw err;
  }
}

module.exports = {
  updateProgressHistory,
};