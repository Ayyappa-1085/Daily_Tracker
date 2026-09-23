const router = require('express').Router();
const mongoose = require('mongoose');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const localDate = (offset = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

router.use(auth);
router.get('/:date', async (req, res) => {
  if (!datePattern.test(req.params.date)) return res.status(400).json({ message: 'Invalid date.' });
  let tasks = await Task.find({ userId: req.user._id, date: req.params.date }).sort({ createdAt: 1 });
  if (req.params.date === localDate() && tasks.length < 3) {
    const pending = await Task.find({ userId: req.user._id, date: localDate(-1), status: 'pending' }).sort({ createdAt: 1 }).limit(3 - tasks.length);
    for (const task of pending) {
      const alreadyCarried = await Task.exists({ userId: req.user._id, date: localDate(), carriedFrom: task._id });
      if (!alreadyCarried) {
        await Task.create({ userId: req.user._id, date: localDate(), title: task.title, category: task.category, topic: task.topic, estimatedMinutes: task.estimatedMinutes, carriedOver: true, carriedFrom: task._id });
      }
    }
    tasks = await Task.find({ userId: req.user._id, date: req.params.date }).sort({ createdAt: 1 });
  }
  res.json(tasks);
});

router.post('/', async (req, res) => {
  try {
    const { date, title, category, topic, estimatedMinutes, carriedOver } = req.body;
    if (!datePattern.test(date) || !title || !Number.isInteger(estimatedMinutes) || estimatedMinutes < 1) return res.status(400).json({ message: 'Enter a valid date, title, and time.' });
    const localToday = localDate();
    const tomorrow = localDate(1);
    if (date < localToday) return res.status(400).json({ message: 'Tasks must use today or a future date.' });

    if (date === tomorrow) {
      const todayTasks = await Task.find({ userId: req.user._id, date: localToday });
      const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
      const unfinishedCount = todayTasks.filter((t) => t.status === 'pending').length;

      if (completedCount === 0) {
        return res.status(403).json({ message: "Complete today's tasks to unlock tomorrow's planning." });
      }

      const existingTomorrowCount = await Task.countDocuments({ userId: req.user._id, date: tomorrow });
      const maxAllowedNewTomorrow = Math.min(completedCount, 3 - unfinishedCount);

      if (existingTomorrowCount >= maxAllowedNewTomorrow) {
        if (existingTomorrowCount + unfinishedCount >= 3) {
          return res.status(409).json({ message: "Tomorrow's capacity (including carried-over tasks) cannot exceed 3 tasks." });
        }
        return res.status(403).json({ message: "Complete more of today's tasks to unlock more tomorrow slots." });
      }

      if (existingTomorrowCount + unfinishedCount >= 3) {
        return res.status(409).json({ message: "Tomorrow's capacity (including carried-over tasks) cannot exceed 3 tasks." });
      }
    }

    const count = await Task.countDocuments({ userId: req.user._id, date });
    if (count >= 3) return res.status(409).json({ message: 'You can have a maximum of 3 tasks per day.' });
    res.status(201).json(await Task.create({ userId: req.user._id, date, title, category, topic, estimatedMinutes, carriedOver: Boolean(carriedOver) }));
  } catch (error) { console.error('Create task failed:', error); res.status(500).json({ message: 'Unable to save task.' }); }
});

router.patch('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid task id.' });
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return res.status(400).json({ message: 'Invalid task update.' });
  const allowedFields = ['title', 'category', 'topic', 'estimatedMinutes', 'status'];
  if (Object.keys(req.body).some((field) => !allowedFields.includes(field))) {
    return res.status(400).json({ message: 'Only editable task fields can be updated.' });
  }
  const { title, category, topic, estimatedMinutes, status } = req.body;
  if ('title' in req.body && (typeof title !== 'string' || !title.trim() || title.length > 120)) {
    return res.status(400).json({ message: 'Invalid task title.' });
  }
  if ('category' in req.body && !['DSA', 'Study', 'Project', 'Personal', 'Other'].includes(category)) {
    return res.status(400).json({ message: 'Invalid task category.' });
  }
  if ('topic' in req.body && (typeof topic !== 'string' || topic.length > 80)) {
    return res.status(400).json({ message: 'Invalid task topic.' });
  }
  if ('estimatedMinutes' in req.body && (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 1 || estimatedMinutes > 1440)) {
    return res.status(400).json({ message: 'Invalid estimated time.' });
  }
  if ('status' in req.body && !['pending', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid task status.' });
  }
  const updates = {};
  for (const field of allowedFields) {
    if (field in req.body) updates[field] = req.body[field];
  }
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { $set: updates }, { returnDocument: 'after', runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (error) { console.error('Update task failed:', error); res.status(500).json({ message: 'Unable to update task.' }); }
});
router.delete('/:id', async (req, res) => {
  res.status(403).json({ message: 'Tasks cannot be deleted once created.' });
});
module.exports = router;