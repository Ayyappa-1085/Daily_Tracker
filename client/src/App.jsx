import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Code2,
  Droplets,
  Dumbbell,
  Home,
  LockKeyhole,
  LogOut,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

const rawApiUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
const API = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
const HABIT_ORDER = [
  "Wake up",
  "Water",
  "Study",
  "DSA",
  "Gym",
  "Steps",
  "Screen time",
  "Reading",
  "Sleep",
];
const sortHabits = (habits) =>
  [...habits].sort((left, right) => {
    const leftIndex = HABIT_ORDER.indexOf(left.name);
    const rightIndex = HABIT_ORDER.indexOf(right.name);
    return (
      (leftIndex < 0 ? HABIT_ORDER.length : leftIndex) -
      (rightIndex < 0 ? HABIT_ORDER.length : rightIndex)
    );
  });
const sortHabitRecords = (records) =>
  [...records].sort((left, right) => {
    const leftIndex = HABIT_ORDER.indexOf(left.habit?.name);
    const rightIndex = HABIT_ORDER.indexOf(right.habit?.name);
    return (
      (leftIndex < 0 ? HABIT_ORDER.length : leftIndex) -
      (rightIndex < 0 ? HABIT_ORDER.length : rightIndex)
    );
  });
const sortAnalyticsHabits = (data) => ({
  ...data,
  consistency: sortHabits(data.consistency || []),
  today: {
    ...data.today,
    habitRecords: sortHabitRecords(data.today?.habitRecords || []),
  },
  yesterday: {
    ...data.yesterday,
    habitRecords: sortHabitRecords(data.yesterday?.habitRecords || []),
  },
});
const localDate = (offset = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const formatMinutes = (value = 0) =>
  value >= 60
    ? `${Math.floor(value / 60)}h ${value % 60 ? `${value % 60}m` : ""}`.trim()
    : `${value}m`;
const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60) % 24;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes % 60).padStart(2, "0")} ${suffix}`;
};
const normalizeTimeValue = (value) => {
  if (typeof value === "string") {
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (match) return Number(match[1]) * 60 + Number(match[2]);
  }
  return Number(value);
};
const toTimeInput = (value) => {
  if (value === "" || value === null || value === undefined) return "";
  if (typeof value === "string") {
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (match)
      return `${String(Number(match[1])).padStart(2, "0")}:${match[2]}`;
    return "";
  }
  const minutes = Number(value);
  return Number.isFinite(minutes)
    ? `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
    : "";
};
const timeParts = (value) => {
  const normalized = toTimeInput(value);
  if (!normalized) return { hour: "", minute: "" };
  const [rawHour, minute] = normalized.split(":").map(Number);
  return {
    hour: String(rawHour % 12 || 12),
    minute: String(minute).padStart(2, "0"),
  };
};
const composeHabitTime = (habitKey, hour, minute) => {
  if (!hour || minute === "" || minute === undefined) return "";
  const h = Number(hour);
  const m = String(minute).padStart(2, "0");
  if (habitKey === "wake") {
    const normalizedHour = h === 12 ? 12 : h;
    return `${String(normalizedHour).padStart(2, "0")}:${m}`;
  }
  if (habitKey === "sleep") {
    const normalizedHour = h === 12 ? 0 : h + 12;
    return `${String(normalizedHour).padStart(2, "0")}:${m}`;
  }
  return `${String(h).padStart(2, "0")}:${m}`;
};
const formatHabitTarget = (habit) => {
  if (habit.type === "time") return formatTime(habit.target);
  if (habit.type === "range")
    return `${formatMinutes(habit.target)}–${formatMinutes(habit.targetMax)}`;
  if (habit.type === "duration") return formatMinutes(habit.target);
  if (habit.unit === "liters") return `${habit.target} L`;
  if (habit.unit === "steps") return habit.target.toLocaleString();
  if (habit.unit === "pages") return `${habit.target} pages`;
  if (habit.type === "boolean") return "Completed";
  return String(habit.target);
};
const formatHabitValue = (habit, value) => {
  if (value === undefined || value === null || value === "")
    return "No data recorded";
  if (habit.type === "time") return formatTime(normalizeTimeValue(value));
  if (habit.unit === "minutes") return formatMinutes(value);
  if (habit.unit === "liters") return `${value} L`;
  if (habit.unit === "steps") return value.toLocaleString();
  if (habit.unit === "pages") return `${value} pages`;
  if (habit.unit === "boolean") return value ? "Completed" : "Not completed";
  return String(value);
};
const habitStatus = (habit, value) => {
  if (value === undefined || value === null || value === "") return "";
  const numValue = normalizeTimeValue(value);
  if (habit.type === "time") {
    let difference = numValue - habit.target;
    if (
      habit.key === "sleep" &&
      habit.target >= 12 * 60 &&
      numValue < 12 * 60
    ) {
      difference = numValue + 24 * 60 - habit.target;
    }
    if (!difference) return "On target";
    return `${Math.abs(difference)}m ${difference > 0 ? "late" : "early"}`;
  }
  if (habit.type === "range") {
    if (numValue < habit.target) return "Below target";
    if (numValue > habit.targetMax) return "Above target";
    return "Within target";
  }
  return "";
};
const habitSatisfied = (habit) => {
  if (habit.value === undefined || habit.value === null || habit.value === "")
    return false;
  if (habit.type === "boolean") return Boolean(habit.value);
  if (habit.type === "range")
    return habit.value >= habit.target && habit.value <= habit.targetMax;
  if (habit.type === "time") {
    const val = normalizeTimeValue(habit.value);
    if (habit.key === "sleep" && habit.target >= 12 * 60 && val < 12 * 60) {
      return val + 24 * 60 <= habit.target;
    }
    return val <= habit.target;
  }
  return habit.value >= habit.target;
};
const TOKEN_KEY = "focusday-token";
const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {}
};
const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {}
};
function api(path, options = {}) {
  const token = getToken();
  return fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (
        response.status === 401 &&
        path !== "/auth/login" &&
        path !== "/auth/register"
      ) {
        clearToken();
      }
      throw new Error(data.message || "Unable to complete request.");
    }
    return data;
  });
}
function Icon({ name, size = 18 }) {
  const icons = {
    water: Droplets,
    study: BookOpen,
    dsa: Sparkles,
    sleep: Clock3,
    gym: Dumbbell,
    wake: Sparkles,
    reading: BookOpen,
    steps: TrendingUp,
    screen: Target,
  };
  const Component = icons[name] || Target;
  return <Component size={size} strokeWidth={2.1} />;
}
function AuthScreen({ onAuth }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    try {
      const data = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setToken(data.token);
      if (
        typeof window !== "undefined" &&
        window.location.pathname === "/login"
      ) {
        window.history.pushState({}, "", "/");
      }
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <main className="auth-shell">
      <div className="auth-mark">FocusDay</div>
      <section className="auth-card">
        <span className="eyebrow">YOUR DAILY PRACTICE</span>
        <h1>{register ? "Make room for progress." : "Welcome back."}</h1>
        <p>Three important tasks. Measurable habits. A clearer day.</p>
        <form onSubmit={submit}>
          {register && (
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              minLength="8"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              placeholder="8 characters minimum"
            />
          </label>
          {error && <p className="error-message">{error}</p>}
          <button className="primary-button" type="submit">
            {register ? "Create account" : "Sign in"} <ChevronRight size={17} />
          </button>
        </form>
        <button
          className="text-button"
          onClick={() => {
            setRegister(!register);
            setError("");
          }}
        >
          {register
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </section>
    </main>
  );
}
function TaskCategoryIcon({ category, size = 12 }) {
  switch (category) {
    case "Study":
      return <BookOpen size={size} />;
    case "Project":
      return <Code2 size={size} />;
    case "DSA":
      return <Code2 size={size} />;
    case "Personal":
      return <CircleUserRound size={size} />;
    default:
      return <Tag size={size} />;
  }
}
function TaskForm({
  date,
  placeholder = "What matters today?",
  onSaved,
  onCancel,
}) {
  const [form, setForm] = useState({
    title: "",
    category: "Study",
    topic: "",
    amount: 60,
    unit: "minutes",
  });
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    try {
      const task = await api("/tasks", {
        method: "POST",
        body: JSON.stringify({
          date,
          title: form.title,
          category: form.category,
          topic: form.topic,
          estimatedMinutes:
            Number(form.amount) * (form.unit === "hours" ? 60 : 1),
        }),
      });
      onSaved(task);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form className="ref-task-form" onSubmit={submit}>
      <input
        required
        autoFocus
        placeholder={placeholder}
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
      />
      <select
        value={form.category}
        onChange={(event) => setForm({ ...form, category: event.target.value })}
      >
        <option>Study</option>
        <option>DSA</option>
        <option>Project</option>
        <option>Personal</option>
        <option>Other</option>
      </select>
      <div className="inline-fields">
        <input
          type="number"
          min="1"
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
        />
        <select
          value={form.unit}
          onChange={(event) => setForm({ ...form, unit: event.target.value })}
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
        </select>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Add task
        </button>
      </div>
    </form>
  );
}
function TaskEditor({ task, onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: task.title,
    category: task.category,
    topic: task.topic || "",
    amount:
      task.estimatedMinutes >= 60 && task.estimatedMinutes % 60 === 0
        ? task.estimatedMinutes / 60
        : task.estimatedMinutes,
    unit:
      task.estimatedMinutes >= 60 && task.estimatedMinutes % 60 === 0
        ? "hours"
        : "minutes",
  });
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    try {
      const updated = await api(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          topic: form.topic,
          estimatedMinutes:
            Number(form.amount) * (form.unit === "hours" ? 60 : 1),
        }),
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <form className="task-edit-form" onSubmit={submit}>
      <input
        required
        aria-label="Task title"
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
      />
      <select
        aria-label="Task category"
        value={form.category}
        onChange={(event) => setForm({ ...form, category: event.target.value })}
      >
        <option>Study</option>
        <option>DSA</option>
        <option>Project</option>
        <option>Personal</option>
        <option>Other</option>
      </select>
      <input
        aria-label="Task topic"
        placeholder="Topic (optional)"
        value={form.topic}
        onChange={(event) => setForm({ ...form, topic: event.target.value })}
      />
      <div className="inline-fields">
        <input
          required
          aria-label="Estimated time"
          type="number"
          min="1"
          value={form.amount}
          onChange={(event) => setForm({ ...form, amount: event.target.value })}
        />
        <select
          aria-label="Time unit"
          value={form.unit}
          onChange={(event) => setForm({ ...form, unit: event.target.value })}
        >
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
        </select>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Save
        </button>
      </div>
    </form>
  );
}
function TaskRow({ task, onToggle, onSaved, isTomorrow = false }) {
  const [editing, setEditing] = useState(false);
  if (editing)
    return (
      <div className="ref-task-row ref-task-row-editing">
        <TaskEditor
          task={task}
          onSaved={(updated) => {
            onSaved(updated);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  const isDone = task.status === "completed";

  return (
    <div className={`ref-task-row ${isDone ? "done" : ""}`}>
      <button
        type="button"
        className={`ref-task-check ${isDone ? "checked" : ""}`}
        aria-label={`Mark ${task.title}`}
        onClick={() => onToggle(task)}
      >
        {isDone && <Check size={13} strokeWidth={3} />}
      </button>
      <div className="ref-task-content">
        <strong className="ref-task-title">{task.title}</strong>
        <div className="ref-task-meta">
          <span className="ref-task-category">
            <TaskCategoryIcon category={task.category} size={12} />
            {task.category}
          </span>
          {task.topic && (
            <>
              <span className="ref-meta-dot">·</span>
              <span className="ref-task-topic">{task.topic}</span>
            </>
          )}
          <span className="ref-meta-dot">·</span>
          <span className="ref-task-duration">
            {formatMinutes(task.estimatedMinutes)}
          </span>
        </div>
      </div>
      {isDone || isTomorrow ? (
        <button
          type="button"
          className="ref-task-edit-btn"
          aria-label={`Edit ${task.title}`}
          onClick={() => setEditing(true)}
        >
          Edit
        </button>
      ) : (
        <button
          type="button"
          className="ref-task-chevron-btn"
          aria-label={`Edit ${task.title}`}
          onClick={() => setEditing(true)}
        >
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
function TimeSelector({ value, onChange, label, habitKey }) {
  const initial = timeParts(value);
  const [parts, setParts] = useState(initial);
  useEffect(() => setParts(timeParts(value)), [value]);
  const update = (key, nextValue) => {
    const next = { ...parts, [key]: nextValue };
    setParts(next);
    if (next.hour !== "" && next.minute !== "") {
      const composed = composeHabitTime(habitKey, next.hour, next.minute);
      if (composed) onChange(composed);
    }
  };
  return (
    <div className="time-selector" aria-label={label}>
      <select
        aria-label={`${label} hour`}
        value={parts.hour}
        onChange={(event) => update("hour", event.target.value)}
      >
        <option value="">hh</option>
        {Array.from({ length: 12 }, (_, index) => {
          const hour = String(index + 1);
          return (
            <option key={hour} value={hour}>
              {hour}
            </option>
          );
        })}
      </select>
      <span>:</span>
      <select
        aria-label={`${label} minute`}
        value={parts.minute}
        onChange={(event) => update("minute", event.target.value)}
      >
        <option value="">mm</option>
        {Array.from({ length: 60 }, (_, index) => {
          const minute = String(index).padStart(2, "0");
          return (
            <option key={minute} value={minute}>
              {minute}
            </option>
          );
        })}
      </select>
    </div>
  );
}
function HabitRow({ habit, onRecord }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(
    habit.type === "time" && habit.value !== undefined
      ? toTimeInput(habit.value)
      : (habit.value ?? ""),
  );
  const ratio =
    habit.type === "range"
      ? 0
      : Math.min((habit.value || 0) / (habit.target || 1), 1);
  const save = (event) => {
    event.preventDefault();
    onRecord(habit, input);
    setEditing(false);
  };
  return (
    <div className="habit-row measurable-habit">
      <span className="habit-icon" style={{ color: habit.color }}>
        <Icon name={habit.key} />
      </span>
      <div className="habit-name">
        <strong>{habit.name}</strong>
        <small>Target: {formatHabitTarget(habit)}</small>
      </div>
      <div className="habit-measure">
        <span>{habit.display}</span>
        {habit.value !== undefined &&
          habit.value !== null &&
          habitStatus(habit, habit.value) && (
            <small className="habit-status">
              {habitStatus(habit, habit.value)}
            </small>
          )}
        {habit.type !== "time" &&
          habit.type !== "boolean" &&
          habit.type !== "range" && (
            <div className="progress">
              <i
                style={{ width: `${ratio * 100}%`, background: habit.color }}
              />
            </div>
          )}
      </div>
      {habit.type === "boolean" ? (
        <button
          className="habit-action"
          onClick={() => onRecord(habit, habit.value ? false : true)}
        >
          {habit.value ? "Completed" : "Mark completed"}
        </button>
      ) : (
        <button className="habit-action" onClick={() => setEditing(!editing)}>
          {habit.value === undefined ? "Enter value" : "Edit"}
        </button>
      )}
      {editing && (
        <form className="habit-entry" onSubmit={save}>
          {habit.type === "time" ? (
            <TimeSelector
              value={input}
              onChange={setInput}
              label={`${habit.name} actual value`}
              habitKey={habit.key}
            />
          ) : (
            <input
              autoFocus
              type="number"
              min="0"
              step={habit.unit === "liters" ? "0.1" : "1"}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label={`${habit.name} actual value`}
            />
          )}
          <span>{habit.type === "time" ? "" : habit.unit}</span>
          <button className="primary-button" type="submit">
            Save
          </button>
        </form>
      )}
    </div>
  );
}

function HabitSummary({ habit }) {
  const hasValue = habit.display !== "No data recorded";
  const status = hasValue ? habitStatus(habit, habit.value) : "";
  const ratio =
    habit.type === "range" || habit.type === "time"
      ? 0
      : Math.min((habit.value || 0) / (habit.target || 1), 1);
  return (
    <div className="habit-summary-row">
      <span className="habit-icon" style={{ color: habit.color }}>
        <Icon name={habit.key} />
      </span>
      <div className="habit-summary-name">
        <strong>{habit.name}</strong>
        <small>Target: {formatHabitTarget(habit)}</small>
      </div>
      <div className="habit-summary-result">
        <strong>{habit.display}</strong>
        {hasValue && status && (
          <small
            className={
              status.includes("late")
                ? "status-negative"
                : status === "Within target" || status === "On target"
                  ? "status-positive"
                  : ""
            }
          >
            {status}
          </small>
        )}
        {habit.type !== "time" &&
          habit.type !== "boolean" &&
          habit.type !== "range" &&
          habit.value !== undefined && (
            <div className="progress">
              <i
                style={{ width: `${ratio * 100}%`, background: habit.color }}
              />
            </div>
          )}
      </div>
    </div>
  );
}

function HabitEntryRow({ habit, onRecord }) {
  const [input, setInput] = useState(
    habit.type === "time" && habit.value !== undefined
      ? toTimeInput(habit.value)
      : (habit.value ?? ""),
  );
  const [error, setError] = useState("");
  useEffect(() => {
    setInput(
      habit.type === "time" && habit.value !== undefined
        ? toTimeInput(habit.value)
        : (habit.value ?? ""),
    );
  }, [habit.value, habit.type]);
  const submit = async (event) => {
    event.preventDefault();
    if (habit.type !== "boolean" && input === "") {
      setError("Enter a value");
      return;
    }
    if (habit.type === "time") setInput(toTimeInput(input));
    setError("");
    await onRecord(habit, habit.type === "boolean" ? Boolean(input) : input);
  };
  const hasValue = habit.display !== "No data recorded";
  return (
    <form className="habit-entry-row" onSubmit={submit}>
      <span className="habit-icon" style={{ color: habit.color }}>
        <Icon name={habit.key} />
      </span>
      <div className="habit-entry-name">
        <strong>{habit.name}</strong>
        <small>Target: {formatHabitTarget(habit)}</small>
      </div>
      {habit.type === "boolean" ? (
        <label className="boolean-entry">
          <input
            type="checkbox"
            checked={Boolean(input)}
            onChange={(event) => setInput(event.target.checked)}
          />{" "}
          Mark as completed
        </label>
      ) : (
        <div className="habit-input-wrap">
          {habit.type === "time" ? (
            <TimeSelector
              value={input}
              onChange={setInput}
              label={`${habit.name} actual value`}
              habitKey={habit.key}
            />
          ) : (
            <input
              aria-label={`${habit.name} actual value`}
              type="number"
              min="0"
              step={habit.unit === "liters" ? "0.1" : "1"}
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
          )}
          <span>
            {habit.type === "time"
              ? ""
              : habit.unit === "minutes"
                ? "min"
                : habit.unit}
          </span>
        </div>
      )}
      <div className="habit-entry-result">
        <strong>{habit.display}</strong>
        {hasValue && habitStatus(habit, habit.value) && (
          <small
            className={
              habitStatus(habit, habit.value).includes("late")
                ? "status-negative"
                : "status-positive"
            }
          >
            {habitStatus(habit, habit.value)}
          </small>
        )}
        <div className="progress">
          <i
            style={{
              width: `${habit.type === "range" || habit.type === "time" ? 0 : Math.min((habit.value || 0) / (habit.target || 1), 1) * 100}%`,
              background: habit.color,
            }}
          />
        </div>
      </div>
      <button className="primary-button habit-save" type="submit">
        Save
      </button>
      {error && (
        <small className="error-message habit-input-error">{error}</small>
      )}
    </form>
  );
}

function ProfilePopover({ user, onLogout, className = "" }) {
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";
  return (
    <div
      className={`profile-popover ${className}`}
      role="dialog"
      aria-label="User profile details"
    >
      <div className="popover-profile-header">
        <div className="popover-avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="popover-user-details">
          <strong className="popover-name" title={user?.name}>
            {user?.name}
          </strong>
          <span className="popover-email" title={user?.email}>
            {user?.email}
          </span>
        </div>
      </div>
      <div className="popover-divider" />
      <button
        type="button"
        className="popover-logout-btn"
        onClick={(e) => {
          e.stopPropagation();
          onLogout();
        }}
      >
        <LogOut size={14} />
        <span>Logout</span>
      </button>
    </div>
  );
}

function SettingsView({ user }) {
  return (
    <div className="page narrow-page">
      <div className="page-title">
        <span className="eyebrow">PREFERENCES</span>
        <h1>Settings</h1>
        <p>Manage your account settings and preferences.</p>
      </div>
      <div className="panel" style={{ padding: "20px" }}>
        <div className="panel-heading">
          <h2>Account Details</h2>
        </div>
        <div
          style={{
            display: "grid",
            gap: "14px",
            marginTop: "12px",
            fontSize: "13px",
          }}
        >
          <div>
            <span
              style={{
                color: "var(--muted)",
                fontSize: "11px",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Full Name
            </span>
            <strong style={{ color: "var(--ink)", fontSize: "14px" }}>
              {user?.name}
            </strong>
          </div>
          <div style={{ borderTop: "1px solid #eff2f6", paddingTop: "12px" }}>
            <span
              style={{
                color: "var(--muted)",
                fontSize: "11px",
                display: "block",
                marginBottom: "4px",
              }}
            >
              Email Address
            </span>
            <strong style={{ color: "var(--ink)", fontSize: "14px" }}>
              {user?.email}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState("Today");
  const [tasks, setTasks] = useState([]);
  const [tomorrowTasks, setTomorrowTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const topbarProfileRef = useRef(null);

  useEffect(() => {
    let timerId;
    const scheduleMidnightUpdate = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        500,
      );
      const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());
      timerId = setTimeout(() => {
        setCurrentDate(new Date());
        scheduleMidnightUpdate();
      }, delay);
    };
    scheduleMidnightUpdate();
    return () => clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (!profileAnchor) return;
    const handleOutsideClick = (event) => {
      if (
        topbarProfileRef.current &&
        !topbarProfileRef.current.contains(event.target)
      ) {
        setProfileAnchor(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileAnchor(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileAnchor]);

  useEffect(() => {
    setProfileAnchor(null);
  }, [view]);

  useEffect(() => {
    const handlePopState = () => {
      const token = getToken();
      if (!token && user) {
        setUser(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user]);
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    api("/auth/me")
      .then((data) => {
        setUser(data.user);
        if (
          typeof window !== "undefined" &&
          window.location.pathname === "/login"
        ) {
          window.history.replaceState({}, "", "/");
        }
      })
      .catch(() => clearToken())
      .finally(() => setAuthLoading(false));
  }, []);
  const loadData = async () => {
    setLoading(true);
    try {
      const [todayTasks, nextTasks, habitDefinitions, records, analyticsData] =
        await Promise.all([
          api(`/tasks/${localDate()}`),
          api(`/tasks/${localDate(1)}`),
          api("/habits"),
          api(`/habits/records/${localDate()}`),
          api("/analytics"),
        ]);
      setTasks(todayTasks);
      setTomorrowTasks(nextTasks);
      setHabits(
        sortHabits(habitDefinitions).map((habit) => {
          const record = records.find(
            (item) => String(item.habitId) === String(habit._id),
          );
          const actualValue = record?.actualValue ?? record?.value;
          return {
            ...habit,
            value:
              habit.type === "time"
                ? normalizeTimeValue(actualValue)
                : actualValue,
            display: formatHabitValue(habit, actualValue),
          };
        }),
      );
      setAnalytics(sortAnalyticsHabits(analyticsData));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user) loadData();
  }, [user]);
  const addTodayTask = (task) => {
    setTasks((current) => [...current, task]);
    setShowForm(false);
    setError("");
  };
  const addTomorrowTask = (task) => {
    setTomorrowTasks((current) => [...current, task]);
    setError("");
  };
  const toggleTask = async (task) => {
    try {
      const updated = await api(`/tasks/${task._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: task.status === "completed" ? "pending" : "completed",
        }),
      });
      setTasks((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
      setTomorrowTasks((current) =>
        current.map((item) => (item._id === updated._id ? updated : item)),
      );
    } catch (err) {
      setError(err.message);
    }
  };
  const updateTask = (updated) => {
    setTasks((current) =>
      current.map((item) => (item._id === updated._id ? updated : item)),
    );
    setTomorrowTasks((current) =>
      current.map((item) => (item._id === updated._id ? updated : item)),
    );
    setError("");
  };
  const recordHabit = async (habit, input) => {
    const actualValue =
      habit.type === "boolean"
        ? Boolean(input)
        : habit.type === "time"
          ? toTimeInput(input)
          : Number(input);
    if (
      habit.type !== "boolean" &&
      (input === "" ||
        (typeof actualValue === "number" && !Number.isFinite(actualValue)))
    ) {
      setError("Enter a valid habit value.");
      return;
    }
    if (habit.type === "time" && !/^\d{2}:\d{2}$/.test(input)) {
      setError("Enter a valid time in HH:MM format.");
      return;
    }
    try {
      const record = await api("/habits/records", {
        method: "POST",
        body: JSON.stringify({
          habitId: habit._id,
          date: localDate(),
          actualValue,
        }),
      });
      const rawSavedValue = record.actualValue ?? record.value;
      const savedValue =
        habit.type === "time"
          ? normalizeTimeValue(rawSavedValue)
          : rawSavedValue;
      setHabits((current) =>
        current.map((item) =>
          item._id === habit._id
            ? {
                ...item,
                value: savedValue,
                display: formatHabitValue(item, savedValue),
              }
            : item,
        ),
      );
      setAnalytics(sortAnalyticsHabits(await api("/analytics")));
    } catch (err) {
      setError(err.message);
    }
  };
  const logout = () => {
    clearToken();
    setUser(null);
    setTasks([]);
    setTomorrowTasks([]);
    setHabits([]);
    setAnalytics(null);
    setProfileAnchor(null);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/login");
    }
  };
  if (authLoading)
    return (
      <main className="auth-shell">
        <div className="auth-mark">FocusDay</div>
      </main>
    );
  if (!user) return <AuthScreen onAuth={setUser} />;
  const navItems = [
    { label: "Today", icon: Home },
    { label: "Plan", icon: CalendarDays },
    { label: "Habits", icon: Target },
    { label: "Analytics", icon: BarChart3 },
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">FocusDay</div>
        <nav>
          {navItems.map(({ label, icon: NavIcon }) => (
            <button
              key={label}
              className={view === label ? "active" : ""}
              onClick={() => {
                setView(label);
                setProfileAnchor(null);
              }}
            >
              <NavIcon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-brand">FocusDay</div>
          <div className="topbar-right">
            <span className="topbar-date">
              {new Intl.DateTimeFormat("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
              }).format(currentDate)}
            </span>
            <div className="topbar-profile-container" ref={topbarProfileRef}>
              <button
                type="button"
                className={`profile-button ${profileAnchor === "topbar" ? "active" : ""}`}
                onClick={() =>
                  setProfileAnchor((current) =>
                    current === "topbar" ? null : "topbar",
                  )
                }
                aria-expanded={profileAnchor === "topbar"}
                aria-label="User profile"
              >
                <CircleUserRound size={20} />
                <span className="topbar-user-name">{user.name}</span>
              </button>
              {profileAnchor === "topbar" && (
                <ProfilePopover
                  user={user}
                  onLogout={logout}
                  className="topbar-popover"
                />
              )}
            </div>
          </div>
        </header>
        {error && (
          <div className="toast">
            {error}
            <button onClick={() => setError("")}>
              <X size={15} />
            </button>
          </div>
        )}
        {view === "Today" && (
          <Today
            tasks={tasks}
            tomorrowTasks={tomorrowTasks}
            addTomorrowTask={addTomorrowTask}
            habits={habits}
            analytics={analytics}
            loading={loading}
            showForm={showForm}
            setShowForm={setShowForm}
            addTask={addTodayTask}
            toggleTask={toggleTask}
            updateTask={updateTask}
            recordHabit={recordHabit}
          />
        )}
        {view === "Plan" && (
          <Plan
            todayTasks={tasks}
            tasks={tomorrowTasks}
            addTask={addTomorrowTask}
            updateTask={updateTask}
            toggleTask={toggleTask}
          />
        )}
        {view === "Habits" && (
          <Habits habits={habits} recordHabit={recordHabit} />
        )}
        {view === "Analytics" && <Analytics data={analytics} />}
        {view === "Settings" && <SettingsView user={user} />}
      </main>
      <nav className="mobile-nav">
        {navItems.map(({ label, icon: NavIcon }) => (
          <button
            key={label}
            className={view === label ? "active" : ""}
            onClick={() => {
              setView(label);
              setProfileAnchor(null);
            }}
          >
            <NavIcon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
function Comparison({ data }) {
  if (!data)
    return (
      <section className="panel comparison">
        <div className="panel-heading">
          <h2>Today vs Yesterday</h2>
        </div>
        <p className="empty-state">
          Not enough data yet.
          <br />
          Keep tracking to see your progress.
        </p>
      </section>
    );
  const taskComparison = (period) =>
    period.tasks.length
      ? `${period.completed} / ${period.tasks.length}`
      : "No data";
  const rows = [
    [
      "Todo",
      taskComparison(data.yesterday),
      taskComparison(data.today),
      data.today.tasks.length && data.yesterday.tasks.length
        ? data.today.completed >= data.yesterday.completed
          ? "up"
          : "down"
        : "",
    ],
    ...data.today.habitRecords.map((item) => {
      const previous = data.yesterday.habitRecords.find(
        (old) => String(old.habit._id) === String(item.habit._id),
      );
      const currentValue = item.record.actualValue ?? item.record.value;
      const previousValue =
        previous?.record.actualValue ?? previous?.record.value;
      return [
        item.habit.name,
        previous ? formatHabitValue(item.habit, previousValue) : "No data",
        formatHabitValue(item.habit, currentValue),
        currentValue >= (previousValue || 0) ? "up" : "down",
      ];
    }),
  ];
  return (
    <section className="panel comparison">
      <div className="panel-heading">
        <h2>Today vs Yesterday</h2>
        <ChevronRight size={18} />
      </div>
      {rows.length ? (
        rows.map(([name, oldValue, newValue, direction]) => (
          <div className="compare-row" key={name}>
            <span>{name}</span>
            <span>{oldValue}</span>
            <strong>{newValue}</strong>
            <em className={direction}>
              {direction ? (direction === "up" ? "↑" : "↓") : ""}
            </em>
          </div>
        ))
      ) : (
        <p className="empty-state">Not enough data yet.</p>
      )}
    </section>
  );
}
const weekMetricRows = [
  ["Todo", "todo"],
  ["Study", "study"],
  ["DSA", "dsa"],
  ["Water", "water"],
  ["Steps", "steps"],
  ["Reading", "reading"],
  ["Gym", "gym"],
  ["Sleep", "sleep"],
  ["Wake up", "wake"],
  ["Screen time", "screen"],
];
const weekRangeLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return "";
  const format = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  });
  return `${format.format(new Date(`${startDate}T12:00:00`))} – ${format.format(new Date(`${endDate}T12:00:00`))}`;
};
const weekMetricText = (metric) => {
  if (!metric || metric.value === null || metric.value === undefined)
    return "No data";
  if (metric.key === "todo" || metric.total)
    return `${metric.value} / ${metric.total}`;
  if (["study", "dsa"].includes(metric.key))
    return `${formatMinutes(metric.value)} / ${formatMinutes(metric.target)}`;
  if (metric.key === "water")
    return `Avg ${Number(metric.average.toFixed(1))} L`;
  if (metric.key === "steps")
    return `Avg ${Math.round(metric.average).toLocaleString()}`;
  if (metric.key === "reading") return `${metric.value} pages`;
  if (metric.key === "screen")
    return `Avg ${formatMinutes(Math.round(metric.average))}`;
  return `${metric.value} / ${metric.total}`;
};
const weekMetricPercent = (metric) => {
  if (!metric || metric.value === null || metric.value === undefined)
    return null;
  if (metric.key === "todo" || metric.total)
    return Math.round((metric.value / metric.total) * 100);
  if (metric.target)
    return Math.round(
      ((metric.key === "water" ||
      metric.key === "steps" ||
      metric.key === "screen"
        ? metric.average
        : metric.value) /
        metric.target) *
        100,
    );
  return null;
};
const weekComparableValue = (metric) => {
  if (!metric || metric.value === null || metric.value === undefined)
    return null;
  return metric.key === "water" ||
    metric.key === "steps" ||
    metric.key === "screen"
    ? metric.average
    : metric.value;
};
function ThisWeekCard({ summary }) {
  return (
    <section className="panel week-card">
      <div className="panel-heading">
        <h2>This Week</h2>
        <span>{weekRangeLabel(summary?.startDate, summary?.endDate)}</span>
      </div>
      {summary ? (
        weekMetricRows.map(([label, key]) => {
          const metric = { ...summary[key], key };
          const percent = weekMetricPercent(metric);
          return (
            <div className="week-metric-row" key={key}>
              <span>{label}</span>
              <strong>{weekMetricText(metric)}</strong>
              {percent !== null ? (
                <>
                  <div className="progress">
                    <i style={{ width: `${Math.min(percent, 100)}%` }} />
                  </div>
                  <small>{percent}%</small>
                </>
              ) : (
                <small />
              )}
            </div>
          );
        })
      ) : (
        <p className="empty-state">No data</p>
      )}
    </section>
  );
}
function WeekComparisonCard({ current, previous }) {
  return (
    <section className="panel week-comparison-card">
      <div className="panel-heading">
        <h2>Last Week vs This Week</h2>
        <ChevronRight size={18} />
      </div>
      <div className="week-comparison-head">
        <span>Metric</span>
        <span>Last Week</span>
        <span>This Week</span>
        <span>Change</span>
      </div>
      {weekMetricRows
        .filter(([, key]) =>
          [
            "todo",
            "study",
            "dsa",
            "water",
            "steps",
            "reading",
            "gym",
            "screen",
          ].includes(key),
        )
        .map(([label, key]) => {
          const previousMetric = previous ? { ...previous[key], key } : null;
          const currentMetric = current ? { ...current[key], key } : null;
          const oldValue = weekComparableValue(previousMetric);
          const newValue = weekComparableValue(currentMetric);
          const direction =
            oldValue === null || newValue === null
              ? ""
              : newValue > oldValue
                ? "↑"
                : newValue < oldValue
                  ? "↓"
                  : "→";
          const isNegative =
            direction === "" || direction === "→"
              ? false
              : key === "screen"
                ? direction === "↑"
                : direction === "↓";
          return (
            <div className="week-comparison-row" key={key}>
              <span>{label}</span>
              <strong>{weekMetricText(previousMetric)}</strong>
              <strong>{weekMetricText(currentMetric)}</strong>
              <em className={isNegative ? "down" : ""}>{direction}</em>
            </div>
          );
        })}
    </section>
  );
}
function Today({
  tasks,
  tomorrowTasks = [],
  addTomorrowTask,
  habits,
  analytics,
  loading,
  showForm,
  setShowForm,
  addTask,
  toggleTask,
  updateTask,
  recordHabit,
}) {
  const completed = tasks.filter((task) => task.status === "completed").length;
  const unfinished = tasks.filter((task) => task.status === "pending").length;
  const maxTomorrowSlots = Math.min(completed, 3 - unfinished);
  const availableTomorrowSlots = Math.max(
    0,
    maxTomorrowSlots - tomorrowTasks.length,
  );
  const [showTomorrowForm, setShowTomorrowForm] = useState(false);

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
              {habits.filter(habitSatisfied).length} / {habits.length}
            </span>
          </div>
          {habits.length ? (
            habits.map((habit) => (
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
function Plan({
  todayTasks = [],
  tasks = [],
  addTask,
  updateTask,
  toggleTask,
}) {
  const [showForm, setShowForm] = useState(false);
  const todayCompleted = todayTasks.filter(
    (t) => t.status === "completed",
  ).length;
  const todayUnfinished = todayTasks.filter(
    (t) => t.status === "pending",
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
function Habits({ habits, recordHabit }) {
  return (
    <div className="page habits-page">
      <div className="page-title">
        <span className="eyebrow">MEASURE WHAT MATTERS</span>
        <h1>Habits</h1>
        <p>Small records add up to a useful picture of your day.</p>
      </div>
      <section className="panel habits-list">
        {habits.length ? (
          habits.map((habit) => (
            <HabitEntryRow
              key={habit._id}
              habit={habit}
              onRecord={recordHabit}
            />
          ))
        ) : (
          <p className="empty-state">No habits available.</p>
        )}
      </section>
    </div>
  );
}
function Analytics({ data }) {
  if (!data)
    return (
      <div className="page narrow-page">
        <div className="page-title">
          <span className="eyebrow">A CLEARER PICTURE</span>
          <h1>Analytics</h1>
          <p>Notice what improved, what slipped, and where your time went.</p>
        </div>
        <section className="panel empty-panel">
          Not enough data yet.
          <br />
          Keep tracking to see your progress.
        </section>
      </div>
    );
  const categories = Object.entries(data.categories);
  const consistency = data.consistency || [];
  const time = Object.entries(data.time);
  return (
    <div className="page">
      <div className="page-title">
        <span className="eyebrow">A CLEARER PICTURE</span>
        <h1>Analytics</h1>
        <p>Notice what improved, what slipped, and where your time went.</p>
      </div>
      <div className="analytics-grid">
        <Comparison data={data} />
        <ThisWeekCard summary={data.currentWeek} />
        <WeekComparisonCard
          current={data.currentWeek}
          previous={data.previousWeek}
        />
        <section className="panel analytics-card">
          <div className="panel-heading">
            <h2>Task categories</h2>
          </div>
          {categories.length ? (
            categories.map(([label, value]) => (
              <div className="category-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <div className="category-bar">
                  <i style={{ width: `${Math.min(value * 25, 100)}%` }} />
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No completed tasks yet.</p>
          )}
          <div className="carried">
            <strong>Carried over</strong>
            <span>{data.carried} tasks</span>
          </div>
        </section>
        <section className="panel analytics-card">
          <div className="panel-heading">
            <h2>Habit consistency</h2>
          </div>
          {consistency.length ? (
            consistency.map((item) => (
              <div className="consistency-row" key={item.key}>
                <span>{item.name}</span>
                <strong>{item.days} / 7</strong>
                <div className="progress">
                  <i style={{ width: `${(item.days / 7) * 100}%` }} />
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No habit records yet.</p>
          )}
        </section>
        <section className="panel analytics-card">
          <div className="panel-heading">
            <h2>Recorded time</h2>
          </div>
          {time.length ? (
            time.map(([label, value]) => (
              <div className="time-row" key={label}>
                <span>{label}</span>
                <strong>{formatMinutes(value)}</strong>
              </div>
            ))
          ) : (
            <p className="empty-state">No completed task time yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
export default App;
