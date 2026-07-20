const mongoose = require("mongoose");

const leetCodeQuestionSchema = new mongoose.Schema(
  {
    phase: {
      type: Number,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },

    leetcodeNumber: {
      type: Number,
      required: true,
    },

    problemName: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },

    pattern: {
      type: String,
      required: true,
      trim: true,
    },

    approach: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("LeetCodeQuestion", leetCodeQuestionSchema);
