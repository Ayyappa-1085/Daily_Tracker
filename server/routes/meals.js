const router = require('express').Router();
const MealRecord = require('../models/MealRecord');
const auth = require('../middleware/auth');

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const mealDefaults = [
  { key: 'early-morning-oats', name: 'Early Morning Oats', scheduledTime: '6:00 AM', imageKey: 'oats' },
  { key: 'morning-tiffin', name: 'Morning Tiffin', scheduledTime: '8:30 AM', imageKey: 'tiffin' },
  { key: 'lunch', name: 'Lunch', scheduledTime: '1:00 PM', imageKey: 'lunch' },
  { key: 'high-protein-meal', name: 'High Protein Meal', scheduledTime: '4:30 PM', imageKey: 'protein' },
  { key: 'dinner', name: 'Dinner', scheduledTime: '8:00 PM', imageKey: 'dinner' },
];
const localDate = (offset = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const dateFrom = value => {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};
const rangeDates = (start, end) => {
  const dates = [];
  const cursor = dateFrom(start);
  const last = dateFrom(end);
  while (cursor && last && cursor <= last) {
    dates.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};
const completedCount = records => records.filter(record => record.completed).length;

router.use(auth);
router.get('/', async (req, res) => {
  const date = req.query.date || localDate();
  if (!datePattern.test(date) || !dateFrom(date)) return res.status(400).json({ message: 'Invalid date.' });
  const records = await MealRecord.find({ userId: req.user._id, date }).lean();
  const byKey = new Map(records.map(record => [record.mealKey, record]));
  res.json(mealDefaults.map(meal => ({ ...meal, date, completed: Boolean(byKey.get(meal.key)?.completed), completedAt: byKey.get(meal.key)?.completedAt || null, recordId: byKey.get(meal.key)?._id || null })));
});

router.patch('/:mealKey', async (req, res) => {
  const date = req.body.date || localDate();
  const meal = mealDefaults.find(item => item.key === req.params.mealKey);
  if (!meal || !datePattern.test(date) || !dateFrom(date) || typeof req.body.completed !== 'boolean') return res.status(400).json({ message: 'Enter a valid meal and completion state.' });
  const today = localDate();
  if (date < today) {
    return res.status(403).json({ message: 'Historical meals cannot be modified.' });
  }
  if (date > today) {
    return res.status(403).json({ message: 'Cannot mark future meals as completed.' });
  }
  const record = await MealRecord.findOneAndUpdate(
    { userId: req.user._id, date, mealKey: meal.key },
    { $set: { mealName: meal.name, scheduledTime: meal.scheduledTime, completed: req.body.completed, completedAt: req.body.completed ? new Date() : null } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
  );
  res.json({ ...meal, date, completed: record.completed, completedAt: record.completedAt, recordId: record._id });
});

router.get('/analytics/summary', async (req, res) => {
  const today = localDate();
  const yesterday = localDate(-1);
  const currentWeekStart = localDate(-(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1));
  const currentWeekEnd = localDate(6 - (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1));
  const previousWeekStart = localDate(-(new Date().getDay() === 0 ? 13 : new Date().getDay() + 6));
  const previousWeekEnd = localDate(-(new Date().getDay() === 0 ? 7 : new Date().getDay()));
  const dates = rangeDates(previousWeekStart, currentWeekEnd);
  const records = await MealRecord.find({ userId: req.user._id, date: { $in: dates }, completed: true }).lean();
  const byDate = dates.reduce((result, date) => { result[date] = 0; return result; }, {});
  records.forEach(record => { byDate[record.date] = (byDate[record.date] || 0) + 1; });
  const week = rangeDates(currentWeekStart, currentWeekEnd);
  const previousWeek = rangeDates(previousWeekStart, previousWeekEnd);
  const total = range => range.reduce((sum, date) => sum + (byDate[date] || 0), 0);
  const metric = (completed, expected) => ({ completed, expected, percentage: expected ? Math.round((completed / expected) * 100) : 0 });
  res.json({
    today: metric(byDate[today] || 0, 5),
    yesterday: metric(byDate[yesterday] || 0, 5),
    thisWeek: metric(total(week), week.length * 5),
    lastWeek: metric(total(previousWeek), previousWeek.length * 5),
    consistency: week.map(date => ({ date, completed: byDate[date] || 0, expected: 5 })),
  });
});

module.exports = router;
