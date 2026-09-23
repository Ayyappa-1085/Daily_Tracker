const router = require('express').Router();
const WeightRecord = require('../models/WeightRecord');
const auth = require('../middleware/auth');

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
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

router.use(auth);
router.get('/', async (req, res) => {
  const start = req.query.start;
  const end = req.query.end;
  const filter = { userId: req.user._id };
  if (start || end) filter.date = { ...(start ? { $gte: start } : {}), ...(end ? { $lte: end } : {}) };
  res.json(await WeightRecord.find(filter).sort({ date: 1 }).lean());
});
router.post('/', async (req, res) => {
  const { date, weight } = req.body;
  const numericWeight = Number(weight);
  if (!datePattern.test(date || '') || !dateFrom(date) || !Number.isFinite(numericWeight) || numericWeight <= 0 || numericWeight > 500) {
    return res.status(400).json({ message: 'Enter a valid date and weight.' });
  }
  const today = localDate();
  if (date < today) {
    return res.status(403).json({ message: 'Historical weight records cannot be modified.' });
  }
  if (date > today) {
    return res.status(403).json({ message: 'Future weight records cannot be created or modified.' });
  }
  const record = await WeightRecord.findOneAndUpdate(
    { userId: req.user._id, date },
    { $set: { weight: numericWeight } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
  );
  res.json(record);
});
module.exports = router;

