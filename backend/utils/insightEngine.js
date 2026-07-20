const Mission = require("../models/Mission");
const { yesterdayKey, dateKeyDaysAgo } = require("./date");

const TIPS = {
  dsa: "Try just one problem today — momentum matters more than volume.",
  development:
    "Even 20 focused minutes on your project keeps the thread alive.",
  workout:
    "A short 15-minute session still counts. Don't let perfect beat done.",
  reading: "Try reading at least 10 pages today to keep your streak alive!",
  water: "Keep a bottle at your desk — it's the easiest one to win today.",
};

const LABELS = {
  dsa: "DSA",
  development: "Development",
  workout: "Workout",
  reading: "reading",
  water: "water intake",
};

/**
 * Generates a short, rule-based coaching message (no external LLM call, so it
 * works with zero config). Priority:
 *  1. Call out anything skipped yesterday.
 *  2. Otherwise, surface the weakest category over the last 7 days.
 *  3. Otherwise, positive reinforcement.
 */
async function generateInsight(userId) {
  const yesterday = yesterdayKey();

  const missedYesterday = await Mission.find({
    user: userId,
    date: yesterday,
    completed: false,
  }).lean();

  if (missedYesterday.length > 0) {
    const missed = missedYesterday[0];
    const label = LABELS[missed.type] || missed.type;
    const tip =
      TIPS[missed.type] || "Small consistent effort beats a big burst.";
    return {
      headline: `You skipped ${label} yesterday.`,
      body: tip,
    };
  }

  const weekAgo = dateKeyDaysAgo(7);
  const recent = await Mission.find({
    user: userId,
    date: { $gte: weekAgo },
  }).lean();

  if (recent.length > 0) {
    const byType = {};
    for (const m of recent) {
      if (!byType[m.type]) byType[m.type] = { total: 0, done: 0 };
      byType[m.type].total += 1;
      if (m.completed) byType[m.type].done += 1;
    }

    let weakest = null;
    let weakestRate = 1;
    for (const [type, stats] of Object.entries(byType)) {
      const rate = stats.done / stats.total;
      if (rate < weakestRate) {
        weakestRate = rate;
        weakest = type;
      }
    }

    if (weakest && weakestRate < 0.6) {
      const label = LABELS[weakest] || weakest;
      const tip =
        TIPS[weakest] || "A little consistency here will compound fast.";
      return {
        headline: `Your ${label} completion is at ${Math.round(weakestRate * 100)}% this week.`,
        body: tip,
      };
    }
  }

  return {
    headline: "You're on track — no missed missions yesterday.",
    body: "Keep stacking days like this; consistency is what turns into a streak.",
  };
}

module.exports = { generateInsight };
