const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },

    xp: {
      type: Number,
      default: 0,
    },

    completed: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    learning: {
      type: Number,
      default: 0,
    },

    journal: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const progressHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    year: {
      type: Number,
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    days: {
      type: [daySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

progressHistorySchema.index(
  {
    user: 1,
    year: 1,
    month: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "ProgressHistory",
  progressHistorySchema
);