import { useState } from "react";

export default function Plan({
  todayTasks = [],
  tasks = [],
  addTask,
  updateTask,
  toggleTask,
  TaskRow,
  TaskForm,
  localDate,
  CalendarDays,
  Zap,
  LockKeyhole,
}) {
  const [showForm, setShowForm] = useState(false);
  const todayCompleted = todayTasks.filter(
    (task) => task.status === "completed",
  ).length;
  const todayUnfinished = todayTasks.filter(
    (task) => task.status === "pending",
  ).length;
  const maxTomorrowSlots = Math.min(todayCompleted, 3 - todayUnfinished);
  const availableSlots = Math.max(0, maxTomorrowSlots - tasks.length);
  return (
    <div className="page narrow-page">
      <div className="page-title">
        <span className="eyebrow">PLANNING</span>
        <h1>Plan tomorrow</h1>
        <p>Choose the few things that deserve your attention next.</p>
      </div>
      <section className="panel ref-card plan-panel">
        <div className="ref-card-header">
          <h2 className="ref-card-title">Tomorrow</h2>
          <span className="ref-card-counter">
            {availableSlots} / 3 slots available
          </span>
        </div>
        <div className="tomorrow-unlock-header">
          <div className="tomorrow-unlock-title-row">
            <span className="tomorrow-unlock-count">
              {todayCompleted} tomorrow slot{todayCompleted === 1 ? "" : "s"}{" "}
              unlocked.
            </span>
            <span className="tomorrow-slot-pill">
              <Zap size={11} fill="#2563eb" color="#2563eb" />
              <span>{availableSlots} / 3 slots available</span>
            </span>
          </div>
          <div className="tomorrow-segments">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`tomorrow-segment ${idx < todayCompleted ? "filled" : ""}`}
              />
            ))}
          </div>
        </div>
        {todayCompleted === 0 ? (
          <div className="ref-tomorrow-locked">
            <LockKeyhole size={28} color="#64748b" strokeWidth={1.8} />
            <strong>Tomorrow is locked</strong>
            <span>Complete today's tasks to unlock tomorrow's planning.</span>
          </div>
        ) : (
          <div className="ref-card-body">
            {tasks.length > 0 ? (
              <div className="ref-task-list">
                {tasks.map((task) => (
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
            {availableSlots > 0 &&
              (showForm ? (
                <TaskForm
                  date={localDate(1)}
                  placeholder="What do you want to do tomorrow?"
                  onSaved={(task) => {
                    addTask(task);
                    setShowForm(false);
                  }}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <button
                  type="button"
                  className="btn-add-task-dashed"
                  onClick={() => setShowForm(true)}
                >
                  + Add a task (max {availableSlots})
                </button>
              ))}
          </div>
        )}
        <div className="tomorrow-carryover-notice">
          <div className="carryover-icon-box">
            <CalendarDays size={20} color="#334155" strokeWidth={1.7} />
          </div>
          <div className="carryover-text">
            <strong>Tomorrow's total will never exceed 3 tasks</strong>
            <span>
              Unfinished tasks from today will carry over automatically.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
