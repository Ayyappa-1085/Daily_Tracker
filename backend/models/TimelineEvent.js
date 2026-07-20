const mongoose = require("mongoose");

const timelineEventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
    time: { type: String, required: true }, // display string e.g. '6:00 AM'
    sortKey: { type: Number, required: true }, // minutes since midnight, for ordering
    label: { type: String, required: true }, // e.g. 'Wake Up'
    icon: { type: String, default: "clock" }, // icon key used by the frontend
    linkedType: { type: String, default: null }, // optional mission type this maps to
    status: {
      type: String,
      enum: ["done", "active", "pending"],
      default: "pending",
    },
  },
  { timestamps: true },
);

timelineEventSchema.index({ user: 1, date: 1, sortKey: 1 });

module.exports = mongoose.model("TimelineEvent", timelineEventSchema);
