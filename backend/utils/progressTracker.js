const ProgressHistory = require("../models/ProgressHistory");

async function updateProgressHistory(
  userId,
  {
    xp = 0,
    missionCompleted = false,
    missionTotal = null,
    learningSolved = false,
    journalWritten = false,
    workoutCompleted = false,
    waterCompleted = false,
  }
) {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const date = now.toISOString().split("T")[0];

  let history = await ProgressHistory.findOne({
    user: userId,
    year,
    month,
  });

  if (!history) {
    history = await ProgressHistory.create({
      user: userId,
      year,
      month,
      days: [],
    });
  }

  let today = history.days.find((d) => d.date === date);

  if (!today) {
    today = {
      date,

      xp: 0,

      missionsCompleted: 0,

      missionsTotal: missionTotal || 0,

      learningSolved: 0,

      journalWritten: false,

      workoutCompleted: false,

      waterCompleted: false,

      completionRate: 0,
    };

    history.days.push(today);
  }

  // XP

  today.xp += xp;

  // Missions

  if (missionCompleted) {
    today.missionsCompleted += 1;
  }

  if (missionTotal !== null) {
    today.missionsTotal = missionTotal;
  }

  // Learning

  if (learningSolved) {
    today.learningSolved += 1;
  }

  // Journal

  if (journalWritten) {
    today.journalWritten = true;
  }

  // Workout

  if (workoutCompleted) {
    today.workoutCompleted = true;
  }

  // Water

  if (waterCompleted) {
    today.waterCompleted = true;
  }

  // Completion %

  if (today.missionsTotal > 0) {
    today.completionRate = Math.round(
      (today.missionsCompleted / today.missionsTotal) * 100
    );
  }

  await history.save();

  return history;
}

module.exports = updateProgressHistory;