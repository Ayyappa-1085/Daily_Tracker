const router = require('express').Router();
const mongoose = require('mongoose');
const Habit = require('../models/Habit');
const HabitRecord = require('../models/HabitRecord');
const auth = require('../middleware/auth');
const { ensureDefaults } = require('../utils/defaults');
const { syncTaskHabitRecords, syncAllTaskHabitRecords } = require('../utils/taskHabits');

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isValidDate = value => {
  if (typeof value !== 'string' || !datePattern.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

router.use(auth);
router.get('/', async (req, res) => {
  await syncAllTaskHabitRecords(req.user._id);
  const habits = await Habit.find({ userId: req.user._id }).sort({ _id: 1 });
  if (habits.length > 0) return res.json(habits);
  return res.json(await ensureDefaults(req.user._id));
});
const normalizeStoredTime = value => {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match) return `${String(Number(match[1])).padStart(2, '0')}:${match[2]}`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return `${String(Math.floor(value / 60) % 24).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  return value;
};
router.get('/records/:date', async (req, res) => {
  if (!isValidDate(req.params.date)) return res.status(400).json({ message: 'Invalid date.' });
  await syncTaskHabitRecords(req.user._id, [req.params.date]);
  const [records, habits] = await Promise.all([
    HabitRecord.find({ userId: req.user._id, date: req.params.date }).lean(),
    Habit.find({ userId: req.user._id, type: 'time' }).select('_id').lean(),
  ]);
  const timeIds = new Set(habits.map(habit => String(habit._id)));
  res.json(records.map(record => timeIds.has(String(record.habitId)) ? { ...record, actualValue: normalizeStoredTime(record.actualValue ?? record.value) } : record));
});
router.post('/records', async (req, res) => {
  const { habitId, date, actualValue, value, secondaryValue } = req.body;
  const submittedValue = actualValue ?? value;
  if (!habitId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || submittedValue === undefined || submittedValue === null) return res.status(400).json({ message: 'Enter an actual habit value.' });
  if (!mongoose.isValidObjectId(habitId)) return res.status(400).json({ message: 'Invalid habit id.' });
  const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
  if (!habit) return res.status(404).json({ message: 'Habit not found.' });
  let normalizedValue = submittedValue;
  if (habit.type === 'boolean') {
    if (typeof submittedValue !== 'boolean') return res.status(400).json({ message: 'Gym must be marked completed or not completed.' });
    normalizedValue = submittedValue ? 1 : 0;
  } else if (habit.type === 'time') {
    if (typeof submittedValue !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(submittedValue)) return res.status(400).json({ message: 'Enter a valid time.' });
    normalizedValue = submittedValue;
  } else {
    normalizedValue = Number(submittedValue);
    if (!Number.isFinite(normalizedValue) || normalizedValue < 0) return res.status(400).json({ message: 'Enter a valid non-negative number.' });
  }
  const update = { actualValue: normalizedValue, secondaryValue };
  if (typeof normalizedValue === 'number') {
    update.value = normalizedValue;
    if (habit.key === 'study' || habit.key === 'dsa') {
      const existing = await HabitRecord.findOne({ userId: req.user._id, habitId, date }).lean();
      const taskValue = Number.isFinite(Number(existing?.taskValue)) ? Number(existing.taskValue) : 0;
      update.manualValue = Math.max(0, normalizedValue - taskValue);
      update.taskValue = taskValue;
    }
  }
  res.json(await HabitRecord.findOneAndUpdate({ userId: req.user._id, habitId, date }, update, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }));
});
router.patch('/:id', async (req, res) => {
  const habit = await Habit.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: { target: req.body.target, targetMax: req.body.targetMax } }, { returnDocument: 'after', runValidators: true });
  if (!habit) return res.status(404).json({ message: 'Habit not found.' });
  res.json(habit);
});
module.exports = router;