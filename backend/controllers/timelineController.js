const TimelineEvent = require("../models/TimelineEvent");
const { todayKey } = require("../utils/date");
const { clearUserCache } = require("../utils/cache");
const {
  ensureTodayTimeline,
  computeDisplayStatus,
  nowMinutesOfDay,
} = require("../utils/timelineDefaults");

// GET /api/timeline/today
async function getToday(req, res, next) {
  try {
    const date = req.query.date || todayKey();
    const events = await ensureTodayTimeline(req.user._id, date);
    const nowMinutes = nowMinutesOfDay();

    const withStatus = events.map((e) => ({
      ...e.toObject(),
      status: computeDisplayStatus(e, nowMinutes),
    }));

    res.json({ date, events: withStatus });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/timeline/:id/status  { status: 'done' | 'pending' }
async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!["done", "pending"].includes(status)) {
      return res
        .status(400)
        .json({ message: "status must be 'done' or 'pending'." });
    }

    const event = await TimelineEvent.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true },
    );
    if (!event)
      return res.status(404).json({ message: "Timeline event not found." });

    clearUserCache(req.user._id);
    res.json({ event });
  } catch (err) {
    next(err);
  }
}

// POST /api/timeline  — add a custom stop to today's timeline
async function createEvent(req, res, next) {
  try {
    const { time, sortKey, label, icon, linkedType, date } = req.body;
    if (!time || sortKey == null || !label) {
      return res
        .status(400)
        .json({ message: "time, sortKey and label are required." });
    }

    const event = await TimelineEvent.create({
      user: req.user._id,
      date: date || todayKey(),
      time,
      sortKey,
      label,
      icon: icon || "clock",
      linkedType: linkedType || null,
    });

    clearUserCache(req.user._id);
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
}

module.exports = { getToday, updateStatus, createEvent };
