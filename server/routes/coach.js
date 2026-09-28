const router = require('express').Router();
const Task = require('../models/Task');
const Habit = require('../models/Habit');
const HabitRecord = require('../models/HabitRecord');
const MealRecord = require('../models/MealRecord');
const WeightRecord = require('../models/WeightRecord');
const auth = require('../middleware/auth');

const GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
];

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

const mealDefaults = [
  { key: 'early-morning-oats', name: 'Early Morning Oats', scheduledTime: '6:00 AM' },
  { key: 'morning-tiffin', name: 'Morning Tiffin', scheduledTime: '8:30 AM' },
  { key: 'lunch', name: 'Lunch', scheduledTime: '1:00 PM' },
  { key: 'high-protein-meal', name: 'High Protein Meal', scheduledTime: '4:30 PM' },
  { key: 'dinner', name: 'Dinner', scheduledTime: '8:00 PM' },
];

const formatMinutes = (mins) => {
  if (!mins) return '0 min';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

router.use(auth);

// POST /api/coach/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ message: 'Coach AI service is temporarily unavailable.' });
    }

    const today = localDate();
    const yesterday = localDate(-1);
    const tomorrow = localDate(1);
    const currentWeekStart = localDate(weekOffset());
    const currentWeekEnd = localDate(weekOffset() + 6);

    // Fetch authenticated user's FocusDay data
    const [tasks, habits, records, mealRecords, weightRecords] = await Promise.all([
      Task.find({ userId: req.user._id, date: { $gte: currentWeekStart, $lte: tomorrow } }).lean(),
      Habit.find({ userId: req.user._id }).sort({ _id: 1 }).lean(),
      HabitRecord.find({ userId: req.user._id, date: { $gte: currentWeekStart, $lte: today } }).lean(),
      MealRecord.find({ userId: req.user._id, date: today }).lean(),
      WeightRecord.find({ userId: req.user._id }).sort({ date: -1 }).limit(7).lean(),
    ]);

    // Compute Today's Tasks
    const todayTasks = tasks.filter((t) => t.date === today);
    const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
    const pendingTodayTasks = todayTasks.filter((t) => t.status === 'pending');
    const tomorrowTasks = tasks.filter((t) => t.date === tomorrow);

    // Compute Today's Meals
    const mealMap = new Map(mealRecords.map((m) => [m.mealKey, m]));
    const mealsStatus = mealDefaults.map((m) => ({
      name: m.name,
      time: m.scheduledTime,
      completed: Boolean(mealMap.get(m.key)?.completed),
    }));
    const completedMealsCount = mealsStatus.filter((m) => m.completed).length;

    // Compute Today's Habits
    const todayRecordsMap = new Map(
      records.filter((r) => r.date === today).map((r) => [String(r.habitId), r])
    );

    const habitsSummary = habits.map((h) => {
      const rec = todayRecordsMap.get(String(h._id));
      const val = rec?.actualValue ?? rec?.value ?? null;
      let isCompleted = false;
      if (h.type === 'boolean') isCompleted = Boolean(val);
      else if (h.type === 'time') isCompleted = val !== null && val !== '';
      else if (h.type === 'range') isCompleted = val >= h.target && val <= h.targetMax;
      else isCompleted = val !== null && Number(val) >= h.target;

      let displayValue = 'Not recorded yet';
      if (val !== null && val !== '') {
        if (h.type === 'boolean') displayValue = val ? 'Completed' : 'Not completed';
        else if (h.unit === 'minutes') displayValue = formatMinutes(Number(val));
        else displayValue = `${val} ${h.unit || ''}`.trim();
      }

      return {
        name: h.name,
        target: `${h.target} ${h.unit || ''}`.trim(),
        loggedToday: displayValue,
        isCompleted,
      };
    });

    // Also include Meals as 10th habit in summary
    habitsSummary.push({
      name: 'Meals',
      target: '5 meals',
      loggedToday: `${completedMealsCount} of 5 eaten`,
      isCompleted: completedMealsCount === 5,
    });

    const completedHabitsCount = habitsSummary.filter((h) => h.isCompleted).length;

    // Weekly habit consistency
    const weekDates = [];
    const d = new Date(`${currentWeekStart}T12:00:00`);
    const endD = new Date(`${today}T12:00:00`);
    while (d <= endD) {
      weekDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
      d.setDate(d.getDate() + 1);
    }

    const habitConsistency = habits.map((h) => {
      const loggedDays = new Set(
        records
          .filter((r) => String(r.habitId) === String(h._id) && r.actualValue !== undefined && r.actualValue !== null && r.actualValue !== '')
          .map((r) => r.date)
      ).size;
      return {
        name: h.name,
        daysLogged: loggedDays,
        daysElapsed: weekDates.length,
        rate: weekDates.length ? Math.round((loggedDays / weekDates.length) * 100) : 0,
      };
    });

    // Weekly study / DSA totals
    const weekCompletedTasks = tasks.filter((t) => t.date >= currentWeekStart && t.date <= today && t.status === 'completed');
    const studyMinutes = weekCompletedTasks
      .filter((t) => t.category === 'Study')
      .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);
    const dsaMinutes = weekCompletedTasks
      .filter((t) => t.category === 'DSA')
      .reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0);

    const latestWeight = weightRecords[0]?.weight ? `${weightRecords[0].weight} kg on ${weightRecords[0].date}` : 'Not recorded';

    // Construct grounded system prompt
    const systemPrompt = `You are FocusDay Coach, a personal, focused productivity assistant built directly into the FocusDay application.
User's Name: ${req.user.name || 'Dude'}
Current Date: ${today} (${new Date().toLocaleDateString('en-US', { weekday: 'long' })})

REAL-TIME FOCUSDAY USER DATA:
- Today's Tasks: ${todayTasks.length} planned total. Completed: ${completedTodayTasks.length}. Remaining: ${pendingTodayTasks.length}.
  Completed Tasks: ${completedTodayTasks.map((t) => `"${t.title}" (${t.category}, ${t.estimatedMinutes}m)`).join(', ') || 'None yet'}
  Pending Tasks: ${pendingTodayTasks.map((t) => `"${t.title}" (${t.category}, ${t.estimatedMinutes}m)`).join(', ') || 'None'}
- Tomorrow's Tasks: ${tomorrowTasks.length} planned. (${tomorrowTasks.map((t) => `"${t.title}"`).join(', ') || 'None'})
- Today's Habits: ${completedHabitsCount} of ${habitsSummary.length} fulfilled.
  Details:
  ${habitsSummary.map((h) => `• ${h.name} (Target: ${h.target}) → Logged: ${h.loggedToday} [${h.isCompleted ? 'Done' : 'Pending'}]`).join('\n  ')}
- Today's Meals Schedule:
  ${mealsStatus.map((m) => `• ${m.name} (${m.time}): ${m.completed ? 'Eaten' : 'Pending'}`).join('\n  ')}
  Total eaten today: ${completedMealsCount} / 5
- Weekly Performance (${currentWeekStart} to ${today}):
  • Tasks completed this week: ${weekCompletedTasks.length}
  • Focused Study time: ${formatMinutes(studyMinutes)}
  • Focused DSA time: ${formatMinutes(dsaMinutes)}
  • Habit consistency rates:
    ${habitConsistency.map((c) => `• ${c.name}: ${c.daysLogged}/${c.daysElapsed} days (${c.rate}%)`).join('\n    ')}
- Latest Weight: ${latestWeight}

COACH RULES & TONE:
1. Be concise, direct, practical, and factual.
2. Ground all numbers and statements strictly in the real user data provided above. Never invent or hallucinate data.
3. If data is not yet recorded, state that clearly without guessing.
4. Tone: Encouraging, calm, and grounded. Not overly dramatic or filled with generic motivational fluff.
5. Format: Use clean formatting with short paragraphs, clear bullet points, or bold headers where helpful for quick scanning.
6. When responding to:
   - "How am I doing today?": Summarize tasks (${completedTodayTasks.length}/${todayTasks.length}), habits (${completedHabitsCount}/10), meals (${completedMealsCount}/5), and give one practical next priority.
   - "Which habits am I missing most?": Point out the specific habits with lowest weekly consistency or pending today, and give a simple suggestion.
   - "What should I focus on now?": Recommend the highest-priority pending task or next habit due.
   - "How was my week?": Highlight weekly task completions, study/DSA hours, and consistency trends.
7. Do NOT give medical or clinical advice. Do NOT discuss unrelated general topics. Keep answers under 150 words whenever possible unless the user explicitly requests deep analysis.`;

    // Format chat history for Gemini
    const contents = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role && item.content) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content }],
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    let reply = null;
    let lastError = null;

    // Try available models in order with fallback
    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            },
          }),
        });

        const data = await response.json();
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          reply = data.candidates[0].content.parts[0].text.trim();
          break;
        } else {
          lastError = data.error?.message || `Model ${model} returned HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    if (!reply) {
      return res.status(503).json({
        message: 'Coach is taking a brief moment. Please ask again in a few seconds.',
        detail: lastError,
      });
    }

    res.json({ reply });
  } catch (err) {
    console.error('Coach chat error:', err);
    res.status(500).json({ message: 'Unable to process Coach message.' });
  }
});

module.exports = router;
