const Journal = require("../models/Journal");
const { todayKey } = require("../utils/date");
const { updateProgressHistory } = require("../utils/progressService");

// GET /api/journal  (optionally ?limit=20)
async function getAll(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 100);

    const entries = await Journal.find({
      user: req.user._id,
    })
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(limit);

    res.json({ entries });
  } catch (err) {
    next(err);
  }
}

// GET /api/journal/today
async function getToday(req, res, next) {
  try {
    const entry = await Journal.findOne({
      user: req.user._id,
      date: todayKey(),
    });

    res.json({
      entry: entry || null,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/journal
async function createEntry(req, res, next) {
  try {
    const { content, mood, date } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Journal content cannot be empty.",
      });
    }

    const entryDate = date || todayKey();

    const entry = await Journal.findOneAndUpdate(
      {
        user: req.user._id,
        date: entryDate,
      },
      {
        content: content.trim(),
        mood: mood || "okay",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Update Progress History
    await updateProgressHistory(req.user);

    res.status(201).json({
      entry,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/journal/:id
async function updateEntry(req, res, next) {
  try {
    const { content, mood } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Journal content cannot be empty.",
      });
    }

    const entry = await Journal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        content: content.trim(),
        mood: mood || "okay",
      },
      {
        new: true,
      },
    );

    if (!entry) {
      return res.status(404).json({
        message: "Journal entry not found.",
      });
    }

    await updateProgressHistory(req.user);

    res.json({
      entry,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/journal/:id
async function deleteEntry(req, res, next) {
  try {
    const entry = await Journal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Journal entry not found.",
      });
    }

    // Recalculate Progress History
    await updateProgressHistory(req.user);

    res.json({
      message: "Entry deleted.",
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getToday,
  createEntry,
  updateEntry,
  deleteEntry,
};