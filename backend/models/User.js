const mongoose = require("mongoose");

// XP required per level. 800 XP -> next level (mirrors the 620/800 XP bar in the UI).
const XP_PER_LEVEL = 800;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: "" },
    quote: {
      type: String,
      default: "Small daily improvements lead to stunning results.",
    },

    totalXp: { type: Number, default: 0 }, // lifetime XP, drives level
    xpToday: { type: Number, default: 0 },
    xpTodayDate: { type: String, default: "" }, // 'YYYY-MM-DD', used to roll xpToday over at midnight

    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStreakDate: { type: String, default: "" }, // last 'YYYY-MM-DD' the streak was credited
  },
  { timestamps: true },
);

userSchema.virtual("level").get(function () {
  return Math.floor(this.totalXp / XP_PER_LEVEL) + 1;
});

userSchema.virtual("xpIntoLevel").get(function () {
  return this.totalXp % XP_PER_LEVEL;
});

userSchema.virtual("xpForNextLevel").get(function () {
  return XP_PER_LEVEL;
});

userSchema.set("toJSON", { virtuals: true });
userSchema.set("toObject", { virtuals: true });

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    quote: this.quote,
    level: this.level,
    xpIntoLevel: this.xpIntoLevel,
    xpForNextLevel: this.xpForNextLevel,
    totalXp: this.totalXp,
    xpToday: this.xpToday,
    streak: this.streak,
    longestStreak: this.longestStreak,
  };
};

module.exports = mongoose.model("User", userSchema);
module.exports.XP_PER_LEVEL = XP_PER_LEVEL;
