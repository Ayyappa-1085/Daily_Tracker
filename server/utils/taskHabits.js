const HabitRecord = require('../models/HabitRecord');
const Task = require('../models/Task');
const { ensureDefaults } = require('./defaults');

const taskHabitKeys = {
  Study: 'study',
  DSA: 'dsa',
};

async function syncTaskHabitRecords(userId, dates) {
  const uniqueDates = [...new Set(dates.filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)))];
  if (!uniqueDates.length) return;

  const habits = (await ensureDefaults(userId)).filter(habit => Object.values(taskHabitKeys).includes(habit.key));

  for (const date of uniqueDates) {
    const completedTasks = await Task.find({
      userId,
      date,
      status: 'completed',
      category: { $in: Object.keys(taskHabitKeys) },
    }).lean();
    const taskTotals = { study: 0, dsa: 0 };
    completedTasks.forEach(task => {
      const key = taskHabitKeys[task.category];
      if (Number.isFinite(task.estimatedMinutes)) taskTotals[key] += task.estimatedMinutes;
    });

    for (const habit of habits) {
      const taskValue = taskTotals[habit.key] || 0;
      const existing = await HabitRecord.findOne({ userId, habitId: habit._id, date }).lean();
      const manualValue = Number.isFinite(Number(existing?.manualValue))
        ? Number(existing.manualValue)
        : Number.isFinite(Number(existing?.actualValue))
          ? Number(existing.actualValue)
          : 0;
      const totalValue = manualValue + taskValue;

      if (totalValue === 0 && !existing) continue;
      if (totalValue === 0 && existing) {
        await HabitRecord.deleteOne({ _id: existing._id, userId });
        continue;
      }

      await HabitRecord.findOneAndUpdate(
        { userId, habitId: habit._id, date },
        {
          $set: {
            actualValue: totalValue,
            value: totalValue,
            manualValue,
            taskValue,
          },
        },
        { upsert: true, setDefaultsOnInsert: true },
      );
    }
  }
}

async function syncAllTaskHabitRecords(userId) {
  const dates = await Task.distinct('date', {
    userId,
    status: 'completed',
    category: { $in: Object.keys(taskHabitKeys) },
  });
  await syncTaskHabitRecords(userId, dates);
}

module.exports = { syncTaskHabitRecords, syncAllTaskHabitRecords };