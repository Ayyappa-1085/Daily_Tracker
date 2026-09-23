import { useEffect, useState } from "react";
import { getCache, setCache } from "../utils/cache";

export default function Today({
  tasks,
  tomorrowTasks = [],
  addTomorrowTask,
  habits,
  meals = [],
  user,
  api,
  analytics,
  loading,
  showForm,
  setShowForm,
  addTask,
  toggleTask,
  updateTask,
  TaskRow,
  TaskForm,
  HabitSummary,
  Comparison,
  ThisWeekCard,
  WeekComparisonCard,
  localDate,
  habitSatisfied,
  CalendarDays,
  Zap,
  LockKeyhole,
}) {
  const completed = tasks.filter((task) => task.status === "completed").length;
  const unfinished = tasks.filter((task) => task.status === "pending").length;
  const maxTomorrowSlots = Math.min(completed, 3 - unfinished);
  const availableTomorrowSlots = Math.max(
    0,
    maxTomorrowSlots - tomorrowTasks.length,
  );
  const [showTomorrowForm, setShowTomorrowForm] = useState(false);

  const today = localDate ? localDate() : new Date().toISOString().slice(0, 10);
  const userId = user?.id || user?._id;
  const cachedMeals = userId
    ? getCache(`focusday_cache_${userId}_meals_${today}`)
    : null;
  const [fetchedMeals, setFetchedMeals] = useState([]);

  useEffect(() => {
    if (!cachedMeals && !meals.length && api) {
      api(`/meals?date=${today}`)
        .then((fresh) => {
          if (Array.isArray(fresh)) {
            setFetchedMeals(fresh);
            if (userId)
              setCache(`focusday_cache_${userId}_meals_${today}`, fresh);
          }
        })
        .catch(() => {});
    }
  }, [today, userId, api, cachedMeals, meals.length]);

  const activeMeals = cachedMeals || (meals.length ? meals : fetchedMeals);

  const completedMealsCount = Array.isArray(activeMeals)
    ? activeMeals.filter((m) => m.completed).length
    : 0;

  const mealsHabit = {
    _id: "habit-meals-today",
    key: "meals",
    name: "Meals",
    type: "count",
    unit: "meals",
    target: 5,
    color: "#e25545",
    value: completedMealsCount,
    display:
      completedMealsCount === 0
        ? "No data recorded"
        : `${completedMealsCount} / 5 completed`,
  };

  const displayedHabits = habits.length ? [...habits] : [];
  if (habits.length) {
    const stepsIndex = habits.findIndex(
      (h) => h.name === "Steps" || h.key === "steps",
    );
    if (stepsIndex !== -1) {
      displayedHabits.splice(stepsIndex + 1, 0, mealsHabit);
    } else {
      displayedHabits.push(mealsHabit);
    }
  }

  return (
    <div className="page">
      <div className="welcome">
        <div>
          <p className="eyebrow">TODAY</p>
          <h1>Good morning!</h1>
          <p>Stay consistent. Small steps make a big difference.</p>
        </div>
        <div className="quote">“Discipline today, a better tomorrow.”</div>
      </div>
      <div className="dashboard-grid">
        <section className="panel ref-card tasks-panel">
          <div className="ref-card-header">
            <h2 className="ref-card-title">Today's Tasks</h2>
            <span className="ref-card-counter">{completed} / 3 completed</span>
          </div>
          <div className="ref-card-body">
            {loading ? (
              <p className="empty-state">Loading today's tasks...</p>
            ) : tasks.length ? (
              <div className="ref-task-list">
                {tasks.map((task) => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    onToggle={toggleTask}
                    onSaved={updateTask}
                    isTomorrow={false}
                  />
                ))}
              </div>
            ) : (
              <div className="ref-empty-box">
                <p>No tasks planned for today.</p>
                <small>Add up to 3 tasks to get started.</small>
              </div>
            )}
            {tasks.length < 3 &&
              (showForm ? (
                <TaskForm
                  date={localDate()}
                  placeholder="What matters today?"
                  onSaved={addTask}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <button
                  type="button"
                  className="btn-add-task-dark"
                  onClick={() => setShowForm(true)}
                >
                  + Add a task (max {3 - tasks.length})
                </button>
              ))}
          </div>
          <div className="task-progress-card">
            <div className="progress-ring-wrap">
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                className="progress-ring"
              >
                <g transform="rotate(-90 20 20)">
                  <circle
                    className="progress-ring-track"
                    cx="20"
                    cy="20"
                    r={15}
                  />
                  <circle
                    className="progress-ring-fill"
                    cx="20"
                    cy="20"
                    r={15}
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={
                      2 * Math.PI * 15 * (1 - Math.min(completed, 3) / 3)
                    }
                  />
                </g>
                <text
                  x="20"
                  y="24"
                  textAnchor="middle"
                  className="progress-ring-text"
                >
                  {completed}/3
                </text>
              </svg>
            </div>
            <div className="task-progress-info">
              <strong>
                {3 - completed === 0
                  ? "All tasks completed!"
                  : `${3 - completed} task${3 - completed === 1 ? "" : "s"} remaining`}
              </strong>
              <div className="task-progress-bar-track">
                <div
                  className="task-progress-bar-fill"
                  style={{ width: `${(Math.min(completed, 3) / 3) * 100}%` }}
                />
              </div>
            </div>
            <div className="task-progress-right-icon">
              <CalendarDays size={20} color="#334155" strokeWidth={1.7} />
            </div>
          </div>
        </section>
        <section className="panel ref-card tomorrow-panel">
          <div className="ref-card-header">
            <h2 className="ref-card-title">Tomorrow</h2>
            <span className="ref-card-counter">
              {availableTomorrowSlots} / 3 slots available
            </span>
          </div>
          <div className="tomorrow-unlock-header">
            <div className="tomorrow-unlock-title-row">
              <span className="tomorrow-unlock-count">
                {completed} tomorrow slot{completed === 1 ? "" : "s"} unlocked.
              </span>
              <span className="tomorrow-slot-pill">
                <Zap size={11} fill="#2563eb" color="#2563eb" />
                <span>{availableTomorrowSlots} / 3 slots available</span>
              </span>
            </div>
            <div className="tomorrow-segments">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`tomorrow-segment ${idx < completed ? "filled" : ""}`}
                />
              ))}
            </div>
          </div>
          {completed === 0 ? (
            <div className="ref-tomorrow-locked">
              <LockKeyhole size={28} color="#64748b" strokeWidth={1.8} />
              <strong>Tomorrow is locked</strong>
              <span>Complete today's tasks to unlock tomorrow's planning.</span>
            </div>
          ) : (
            <div className="ref-card-body">
              {tomorrowTasks.length > 0 ? (
                <div className="ref-task-list">
                  {tomorrowTasks.map((task) => (
                    <TaskRow
                      key={task._id}
                      task={task}
                      onToggle={toggleTask}
                      onSaved={updateTask}
                      isTomorrow={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="ref-empty-box">
                  <p>No tasks planned for tomorrow yet.</p>
                </div>
              )}
              {availableTomorrowSlots > 0 &&
                (showTomorrowForm ? (
                  <TaskForm
                    date={localDate(1)}
                    placeholder="What do you want to do tomorrow?"
                    onSaved={(task) => {
                      addTomorrowTask(task);
                      setShowTomorrowForm(false);
                    }}
                    onCancel={() => setShowTomorrowForm(false)}
                  />
                ) : (
                  <button
                    type="button"
                    className="btn-add-task-dashed"
                    onClick={() => setShowTomorrowForm(true)}
                  >
                    + Add a task (max {availableTomorrowSlots})
                  </button>
                ))}
            </div>
          )}
          <div className="tomorrow-carryover-notice">
            <div className="carryover-icon-box">
              <CalendarDays size={20} color="#334155" strokeWidth={1.7} />
            </div>
            <div className="carryover-text">
              <strong>Tomorrow's tasks will never exceed 3 tasks</strong>
              <span>
                Unfinished tasks from today will carry over automatically.
              </span>
            </div>
          </div>
        </section>
        <section className="panel habits-panel">
          <div className="panel-heading">
            <h2>Today's Habits</h2>
            <span>
              {displayedHabits.filter(habitSatisfied).length} /{" "}
              {displayedHabits.length}
            </span>
          </div>
          {displayedHabits.length ? (
            displayedHabits.map((habit) => (
              <HabitSummary key={habit._id} habit={habit} />
            ))
          ) : (
            <p className="empty-state">No habits available.</p>
          )}
        </section>
      </div>
      <div className="dashboard-analytics-grid">
        <Comparison data={analytics} />
        <ThisWeekCard summary={analytics?.currentWeek} />
        <WeekComparisonCard
          current={analytics?.currentWeek}
          previous={analytics?.previousWeek}
        />
      </div>
    </div>
  );
}
