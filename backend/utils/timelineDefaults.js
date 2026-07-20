const TimelineEvent = require("../models/TimelineEvent");

// Mirrors the timeline row in the UI: time, label, icon, and which mission type (if any)
// auto-completes this stop when that mission is marked done.
const DEFAULT_TIMELINE = [
  {
    time: "6:00 AM",
    sortKey: 360,
    label: "Wake Up",
    icon: "sunrise",
    linkedType: null,
  },
  {
    time: "7:00 AM",
    sortKey: 420,
    label: "DSA",
    icon: "code",
    linkedType: "dsa",
  },
  {
    time: "10:00 AM",
    sortKey: 600,
    label: "Development",
    icon: "laptop",
    linkedType: "development",
  },
  {
    time: "5:00 PM",
    sortKey: 1020,
    label: "Workout",
    icon: "dumbbell",
    linkedType: "workout",
  },
  {
    time: "9:30 PM",
    sortKey: 1290,
    label: "Journal",
    icon: "journal",
    linkedType: null,
  },
];

async function ensureTodayTimeline(userId, date) {
  const existing = await TimelineEvent.find({ user: userId, date }).lean();
  const existingLabels = new Set(existing.map((e) => e.label));

  const toCreate = DEFAULT_TIMELINE.filter(
    (e) => !existingLabels.has(e.label),
  ).map((e) => ({
    ...e,
    user: userId,
    date,
    status: "pending",
  }));

  if (toCreate.length > 0) {
    await TimelineEvent.insertMany(toCreate, { ordered: false }).catch(
      () => {},
    );
  }

  return TimelineEvent.find({ user: userId, date }).sort({ sortKey: 1 });
}

/** Derive a display status without mutating stored 'pending' rows into 'active'. */
function computeDisplayStatus(event, nowMinutes) {
  if (event.status === "done") return "done";
  if (nowMinutes >= event.sortKey - 30 && nowMinutes <= event.sortKey + 90)
    return "active";
  return "pending";
}

function nowMinutesOfDay() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

/** Called by missionController when a linked mission's completion state changes. */
async function syncTimelineForMission(userId, date, missionType, completed) {
  await TimelineEvent.updateMany(
    { user: userId, date, linkedType: missionType },
    { $set: { status: completed ? "done" : "pending" } },
  );
}

module.exports = {
  ensureTodayTimeline,
  computeDisplayStatus,
  nowMinutesOfDay,
  syncTimelineForMission,
  DEFAULT_TIMELINE,
};
