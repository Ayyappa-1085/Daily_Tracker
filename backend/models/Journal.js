const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: String, required: true, index: true }, // 'YYYY-MM-DD'
    content: { type: String, required: true, trim: true },
    mood: {
      type: String,
      enum: ["great", "good", "okay", "rough"],
      default: "okay",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Journal", journalSchema);
