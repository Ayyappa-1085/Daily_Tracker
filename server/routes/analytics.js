const router = require('express').Router();
const Task = require('../models/Task');
const Habit = require('../models/Habit');
const HabitRecord = require('../models/HabitRecord');
const auth = require('../middleware/auth');

const localDate = (offset = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const weekOffset = () => {
  const day = new Date().getDay();
  return day === 0 ? -6 : 1 - day;
};
const sum = values => values.reduce((total, value) => total + value, 0);
const average = values => values.length ? sum(values) / values.length : null;
const habitRecordValue = record => {
  const value = record.actualValue ?? record.value;
  if (typeof value === 'string') {
    const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match) return Number(match[1]) * 60 + Number(match[2]);
  }
  return Number(value);
};
const normalizeSleepValue = (val, target = 22 * 60) => (target >= 12 * 60 && val < 12 * 60 ? val + 24 * 60 : val);
const habitRecorded = (habit, record) => {
  if (habit.type === 'time') {
    return record.actualValue !== undefined && record.actualValue !== null && record.actualValue !== '';
  }
  return habitRecordValue(record) > 0;
};

const buildWeekSummary = (tasks, records, habits, startDate, endDate) => {
  const weekTasks = tasks.filter(task => task.date >= startDate && task.date <= endDate);
  const completedTasks = weekTasks.filter(task => task.status === 'completed');
  const weekRecords = records.filter(record => record.date >= startDate && record.date <= endDate);
  const habit = key => habits.find(item => item.key === key);
  const valuesFor = key => {
    const definition = habit(key);
    return definition ? weekRecords.filter(record => String(record.habitId) === String(definition._id)).map(habitRecordValue) : [];
  };
  const metric = (key, values, target, targetMax = null) => ({ key, values, value: values.length ? sum(values) : null, average: average(values), target, targetMax });
  const water = habit('water');
  const study = habit('study');
  const dsa = habit('dsa');
  const reading = habit('reading');
  const steps = habit('steps');
  const gym = habit('gym');
  const sleep = habit('sleep');
  const wake = habit('wake');
  const screen = habit('screen');
  const sleepValues = valuesFor('sleep');
  const wakeValues = valuesFor('wake');
  return {
    startDate,
    endDate,
    todo: { value: weekTasks.length ? completedTasks.length : null, total: 21 },
    study: metric('study', valuesFor('study'), study?.target ? study.target * 7 : null),
    dsa: metric('dsa', valuesFor('dsa'), dsa?.target ? dsa.target * 7 : null),
    water: metric('water', valuesFor('water'), water?.target ?? null),
    steps: metric('steps', valuesFor('steps'), steps?.target ?? null),
    reading: metric('reading', valuesFor('reading'), reading?.target ? reading.target * 7 : null),
    gym: { key: 'gym', value: valuesFor('gym').length ? valuesFor('gym').filter(value => value > 0).length : null, total: 7 },
    sleep: { key: 'sleep', value: sleepValues.length ? sleepValues.filter(value => normalizeSleepValue(value, sleep.target) <= sleep.target).length : null, total: 7 },
    wake: { key: 'wake', value: wakeValues.length ? wakeValues.filter(value => value <= wake.target).length : null, total: 7 },
    screen: metric('screen', valuesFor('screen'), screen?.target ?? null, screen?.targetMax ?? null),
  };
};

router.use(auth);
router.get('/', async (req, res) => {
  try {
    const today = localDate();
    const yesterday = localDate(-1);
    const currentWeekStart = localDate(weekOffset());
    const currentWeekEnd = localDate(weekOffset() + 6);
    const previousWeekStart = localDate(weekOffset() - 7);
    const previousWeekEnd = localDate(weekOffset() - 1);
    const [tasks, habits, records] = await Promise.all([
      Task.find({ userId: req.user._id }).lean(),
      Habit.find({ userId: req.user._id }).lean(),
      HabitRecord.find({ userId: req.user._id }).lean(),
    ]);
    const tasksFor = date => tasks.filter(task => task.date === date);
    const completed = list => list.filter(task => task.status === 'completed');
    const categories = completed(tasks).reduce((result, task) => { result[task.category] = (result[task.category] || 0) + 1; return result; }, {});
    const topics = completed(tasks.filter(task => task.category === 'DSA')).reduce((result, task) => { const topic = task.topic || 'Other'; result[topic] = (result[topic] || 0) + 1; return result; }, {});
    const recordFor = (habitId, date) => records.find(record => String(record.habitId) === String(habitId) && record.date === date);
    const dateRecordValues = date => habits.map(habit => ({ habit, record: recordFor(habit._id, date) })).filter(item => item.record);
    const weekRecords = records.filter(record => record.date >= currentWeekStart && record.date <= currentWeekEnd);
    const consistency = habits.map(habit => ({ name: habit.name, key: habit.key, days: new Set(weekRecords.filter(record => String(record.habitId) === String(habit._id) && habitRecorded(habit, record)).map(record => record.date)).size }));
    const time = completed(tasks).reduce((result, task) => { if (task.category === 'Study' || task.category === 'DSA') result[task.category] = (result[task.category] || 0) + task.estimatedMinutes; return result; }, {});
    res.json({
      today: { tasks: tasksFor(today), completed: completed(tasksFor(today)).length, habitRecords: dateRecordValues(today) },
      yesterday: { tasks: tasksFor(yesterday), completed: completed(tasksFor(yesterday)).length, habitRecords: dateRecordValues(yesterday) },
      week: { tasks: tasks.filter(task => task.date >= currentWeekStart && task.date <= currentWeekEnd), habitRecords: weekRecords },
      currentWeek: buildWeekSummary(tasks, records, habits, currentWeekStart, currentWeekEnd),
      previousWeek: buildWeekSummary(tasks, records, habits, previousWeekStart, previousWeekEnd),
      categories,
      topics,
      carried: tasks.filter(task => task.carriedOver).length,
      consistency,
      time,
    });
  } catch (error) {
    console.error('Analytics failed:', error);
    res.status(500).json({ message: 'Unable to load analytics.' });
  }
});
module.exports = router;
