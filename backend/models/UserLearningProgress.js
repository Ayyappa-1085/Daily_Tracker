const mongoose = require("mongoose");

const userLearningProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    currentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeetCodeQuestion",
      default: null,
    },

    questionNotes: {
      type: [
        {
          question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LeetCodeQuestion",
            required: true,
          },
          approach: {
            type: String,
            default: "",
          },
          notes: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    completedQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LeetCodeQuestion",
      },
    ],

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "UserLearningProgress",
  userLearningProgressSchema,
);
