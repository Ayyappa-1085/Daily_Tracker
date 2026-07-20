const mongoose = require("mongoose");

const MISSION_TYPES = ["dsa", "development", "workout", "reading", "water"];

const missionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
    type: { type: String, enum: MISSION_TYPES, required: true },

    title: { type: String, required: true }, // e.g. "DSA", "Development"
    topic: { type: String, default: "" }, // e.g. "Sliding Window" for Continue Learning
    subtitle: { type: String, default: "" }, // e.g. "DSA • Arrays"

    progress: { type: Number, default: 0, min: 0, max: 100 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },

    remainingMinutes: { type: Number, default: null },
    xpReward: { type: Number, default: 20 },
  },
  { timestamps: true },
);

missionSchema.index({ user: 1, date: 1, type: 1 });

module.exports = mongoose.model("Mission", missionSchema);
module.exports.MISSION_TYPES = MISSION_TYPES;
