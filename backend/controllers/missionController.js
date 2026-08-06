const Mission = require("../models/Mission");
const { todayKey } = require("../utils/date");
const { ensureTodayMissions } = require("../utils/missionDefaults");
const {
  awardXp,
  revokeXp,
  creditStreak,
} = require("../utils/gamification");
const { syncTimelineForMission } = require("../utils/timelineDefaults");
const { updateProgressHistory } = require("../utils/progressService");
const { clearUserCache } = require("../utils/cache");

// GET /api/missions/today
async function getToday(req, res, next) {
  try {
    const date = req.query.date || todayKey();
    const missions = await ensureTodayMissions(req.user._id, date);

    res.json({
      date,
      missions,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/missions/:id/toggle
async function toggleMission(req, res, next) {
  try {
    const mission = await Mission.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!mission) {
      return res.status(404).json({
        message: "Mission not found.",
      });
    }

    const user = req.user;
    let leveledUp = false;

    if (mission.completed) {
      // Undo completion
      mission.completed = false;
      mission.completedAt = null;
      mission.progress = 0;

      revokeXp(user, mission.xpReward);
    } else {
      // Complete mission
      mission.completed = true;
      mission.completedAt = new Date();
      mission.progress = 100;

      const result = awardXp(user, mission.xpReward);
      leveledUp = result.leveledUp;

      creditStreak(user);
    }

    await mission.save();
    await user.save();

    await syncTimelineForMission(
      user._id,
      mission.date,
      mission.type,
      mission.completed
    );
    clearUserCache(user._id);

    // ✅ Update Progress History
    
await updateProgressHistory(user);

    res.json({
      mission,
      user: user.toSafeObject(),
      leveledUp,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/missions/:id/progress
async function updateProgress(req, res, next) {
  try {
    const { progress } = req.body;

    if (
      typeof progress !== "number" ||
      progress < 0 ||
      progress > 100
    ) {
      return res.status(400).json({
        message: "progress must be a number between 0 and 100.",
      });
    }

    const mission = await Mission.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!mission) {
      return res.status(404).json({
        message: "Mission not found.",
      });
    }

    const user = req.user;
    const wasCompleted = mission.completed;

    mission.progress = progress;

    let leveledUp = false;

    if (progress >= 100 && !wasCompleted) {
      mission.completed = true;
      mission.completedAt = new Date();

      const result = awardXp(user, mission.xpReward);
      leveledUp = result.leveledUp;

      creditStreak(user);
    } else if (progress < 100 && wasCompleted) {
      mission.completed = false;
      mission.completedAt = null;

      revokeXp(user, mission.xpReward);
    }

    await mission.save();
    await user.save();

    await syncTimelineForMission(
      user._id,
      mission.date,
      mission.type,
      mission.completed
    );
    clearUserCache(user._id);

    // ✅ Update Progress History
    await updateProgressHistory(user);

    res.json({
      mission,
      user: user.toSafeObject(),
      leveledUp,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/missions
async function createMission(req, res, next) {
  try {
    const {
      type,
      title,
      subtitle,
      xpReward,
      date,
    } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        message: "type and title are required.",
      });
    }

    const mission = await Mission.create({
      user: req.user._id,
      date: date || todayKey(),
      type,
      title,
      subtitle: subtitle || "",
      xpReward: xpReward || 20,
    });

    res.status(201).json({
      mission,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/missions/:id
async function deleteMission(req, res, next) {
  try {
    const mission = await Mission.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!mission) {
      return res.status(404).json({
        message: "Mission not found.",
      });
    }

    res.json({
      message: "Mission deleted.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getToday,
  toggleMission,
  updateProgress,
  createMission,
  deleteMission,
};