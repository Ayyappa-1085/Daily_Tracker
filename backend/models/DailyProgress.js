const mongoose = require("mongoose");

const dailyProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },

    xpEarned: {
      type: Number,
      default: 0,
    },

    missionsCompleted: {
      type: Number,
      default: 0,
    },

    missionsTotal: {
      type: Number,
      default: 0,
    },

    learningCompleted: {
      type: Number,
      default: 0,
    },

    journalWritten: {
      type: Boolean,
      default: false,
    },

    workoutDone: {
      type: Boolean,
      default: false,
    },

    waterGoalCompleted: {
      type: Boolean,
      default: false,
    },

    completionRate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

dailyProgressSchema.index(
  {
    user: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("DailyProgress", dailyProgressSchema);