const { todayKey, yesterdayKey } = require("./date");
const { XP_PER_LEVEL } = require("../models/User");

/**
 * Award XP to a user (called when a mission is marked complete).
 * Rolls the "XP today" counter over automatically when the day changes.
 * Returns whether this award pushed the user into a new level, so the
 * frontend can show a level-up toast if it wants to.
 */
function awardXp(user, amount) {
  const today = todayKey();
  if (user.xpTodayDate !== today) {
    user.xpToday = 0;
    user.xpTodayDate = today;
  }

  const levelBefore = Math.floor(user.totalXp / XP_PER_LEVEL);
  user.totalXp += amount;
  user.xpToday += amount;
  const levelAfter = Math.floor(user.totalXp / XP_PER_LEVEL);

  return { leveledUp: levelAfter > levelBefore, newLevel: levelAfter + 1 };
}

/** Reverse an XP award (called when a mission is un-completed). Never drops below 0. */
function revokeXp(user, amount) {
  const today = todayKey();
  user.totalXp = Math.max(0, user.totalXp - amount);
  if (user.xpTodayDate === today) {
    user.xpToday = Math.max(0, user.xpToday - amount);
  }
}

/**
 * Credit the day-streak the first time a user completes any mission on a given day.
 * - Same day already credited -> no-op.
 * - Credited yesterday -> streak continues (+1).
 * - Otherwise -> streak restarts at 1.
 * Design choice: one completed mission is enough to keep the streak alive, matching
 * "Discipline over Motivation" — showing up counts, even on a light day.
 */
function creditStreak(user) {
  const today = todayKey();
  const yesterday = yesterdayKey();

  if (user.lastStreakDate === today) return; // already credited today

  if (user.lastStreakDate === yesterday) {
    user.streak += 1;
  } else {
    user.streak = 1;
  }
  user.lastStreakDate = today;
  if (user.streak > user.longestStreak) user.longestStreak = user.streak;
}

/**
 * If a user comes back after skipping a day entirely (no mission completed
 * yesterday or today), the streak is broken. Call this before reading streak
 * for display so it never shows a stale, already-broken number.
 */
function syncStreakBreak(user) {
  const today = todayKey();
  const yesterday = yesterdayKey();
  if (
    user.streak > 0 &&
    user.lastStreakDate !== today &&
    user.lastStreakDate !== yesterday
  ) {
    user.streak = 0;
  }
}

module.exports = { awardXp, revokeXp, creditStreak, syncStreakBreak };
