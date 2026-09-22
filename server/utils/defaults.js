const Habit = require('../models/Habit');

const defaults = [
  ['water', 'Water', 'liters', 'volume', 3, null, '#2498f3'],
  ['study', 'Study', 'minutes', 'duration', 120, null, '#24b978'],
  ['dsa', 'DSA', 'minutes', 'duration', 60, null, '#9564ef'],
  ['sleep', 'Sleep', 'time', 'time', 22 * 60, null, '#7b68d8'],
  ['gym', 'Gym', 'completed', 'boolean', 1, null, '#667085'],
  ['wake', 'Wake up', 'time', 'time', 5 * 60, null, '#f3a921'],
  ['reading', 'Reading', 'pages', 'count', 10, null, '#4581db'],
  ['steps', 'Steps', 'steps', 'count', 8000, null, '#f08a18'],
  ['screen', 'Screen time', 'minutes', 'range', 120, 180, '#2c83ce'],
];

async function ensureDefaults(userId) {
  await Habit.bulkWrite(defaults.map(([key, name, unit, type, target, targetMax, color]) => ({
    updateOne: {
      filter: { userId, key },
      update: {
        $set: { name, unit, type, active: true, color },
        $setOnInsert: { target, targetMax },
      },
      upsert: true,
    },
  })));
  return Habit.find({ userId }).sort({ _id: 1 });
}

module.exports = { ensureDefaults };