const Mission = require("../models/Mission");

// The five mission cards shown on Home. Order matters — it drives card order in the UI.
const DEFAULT_MISSIONS = [
  {
    type: "dsa",
    title: "DSA",
    topic: "Sliding Window",
    subtitle: "DSA • Arrays",
    remainingMinutes: 18,
    xpReward: 30,
  },
  {
    type: "development",
    title: "Development",
    subtitle: "Project work",
    xpReward: 30,
  },
  {
    type: "workout",
    title: "Workout",
    subtitle: "Strength / cardio",
    xpReward: 25,
  },
  { type: "reading", title: "Reading", subtitle: "10+ pages", xpReward: 20 },
  { type: "water", title: "Water", subtitle: "8 glasses", xpReward: 10 },
];

/**
 * Ensures the user has a Mission document for every default type on `date`.
 * Safe to call on every request — only inserts the ones that are missing,
 * so a partially-completed day is never overwritten.
 */
async function ensureTodayMissions(userId, date) {
  const existing = await Mission.find({ user: userId, date }).lean();
  const existingTypes = new Set(existing.map((m) => m.type));

  const toCreate = DEFAULT_MISSIONS.filter(
    (m) => !existingTypes.has(m.type),
  ).map((m) => ({
    ...m,
    user: userId,
    date,
  }));

  if (toCreate.length > 0) {
    await Mission.insertMany(toCreate, { ordered: false }).catch(() => {
      // Ignore duplicate-key races (e.g. two simultaneous requests on day rollover).
    });
  }

  return Mission.find({ user: userId, date }).sort({ createdAt: 1 });
}

module.exports = { ensureTodayMissions, DEFAULT_MISSIONS };
