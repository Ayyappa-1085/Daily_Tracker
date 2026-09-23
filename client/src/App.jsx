import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Code2,
  Droplets,
  Dumbbell,
  LockKeyhole,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Utensils,
  Zap,
} from "lucide-react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import { clearUserCache, getCache, removeCache, setCache } from "./utils/cache";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TodayPage from "./components/Today";
import PlanPage from "./components/Plan";
import HabitsPage from "./components/Habits";
import AnalyticsPage from "./components/Analytics";
import Meals from "./components/Meals";

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
  if (habit.unit === "meals") return `${habit.target} meals`;
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
  if (habit.unit === "meals")
    return value ? `${value} / 5 completed` : "No data recorded";
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
const DASHBOARD_PATHS = ["/today", "/plan", "/habits", "/analytics", "/meals"];
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
const inflightGetRequests = new Map();

function api(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const token = getToken();
  const dedupKey = method === "GET" ? `${path}::${token || ""}` : null;

  if (dedupKey && inflightGetRequests.has(dedupKey)) {
    return inflightGetRequests.get(dedupKey);
  }

  const reqPromise = fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (
          response.status === 401 &&
          path !== "/auth/login" &&
          path !== "/auth/register"
        ) {
          clearToken();
        }
        const error = new Error(data.message || "Unable to complete request.");
        error.status = response.status;
        throw error;
      }
      return data;
    })
    .finally(() => {
      if (dedupKey) {
        inflightGetRequests.delete(dedupKey);
      }
    });

  if (dedupKey) {
    inflightGetRequests.set(dedupKey, reqPromise);
  }

  return reqPromise;
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
    meals: Utensils,
  };
  const Component = icons[name] || Target;
  return <Component size={size} strokeWidth={2.1} />;
}
function AuthScreen({ onAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setToken(data.token);
      setCache("focusday_auth_user", data.user);
      const nextPath = DASHBOARD_PATHS.includes(location.pathname)
        ? location.pathname
        : "/today";
      navigate(nextPath, { replace: true });
      onAuth(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
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
          <button
            className="primary-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? register
                ? "Creating account..."
                : "Signing in..."
              : register
                ? "Create account"
                : "Sign in"}{" "}
            {!submitting && <ChevronRight size={17} />}
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

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPathRef = useRef(location.pathname);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tomorrowTasks, setTomorrowTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [todayMeals, setTodayMeals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const authRequestRef = useRef(0);

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
    const authRequestId = ++authRequestRef.current;
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }
    const cachedUser = getCache("focusday_auth_user");
    if (cachedUser) {
      setUser(cachedUser);
      setAuthLoading(false);
    }
    api("/auth/me")
      .then((data) => {
        if (authRequestRef.current !== authRequestId) return;
        setUser(data.user);
        setCache("focusday_auth_user", data.user);
        if (initialPathRef.current === "/login") {
          navigate("/today", { replace: true });
        }
      })
      .catch((err) => {
        if (authRequestRef.current !== authRequestId) return;
        if (err?.status === 401) {
          clearToken();
          removeCache("focusday_auth_user");
          setUser(null);
        }
      })
      .finally(() => {
        if (authRequestRef.current === authRequestId) setAuthLoading(false);
      });
  }, [navigate]);

  const isFetchingRef = useRef(false);

  const loadData = async (options = {}) => {
    const { showLoader = true } = options;
    const userId = user?.id || user?._id;
    const today = localDate();
    const tomorrow = localDate(1);

    if (userId) {
      const cachedTodayTasks = getCache(
        `focusday_cache_${userId}_tasks_${today}`,
      );
      const cachedTomorrowTasks = getCache(
        `focusday_cache_${userId}_tasks_${tomorrow}`,
      );
      const cachedHabits = getCache(`focusday_cache_${userId}_habits_${today}`);
      const cachedAnalytics = getCache(
        `focusday_cache_${userId}_analytics_${today}`,
      );
      const cachedTodayMeals = getCache(
        `focusday_cache_${userId}_meals_${today}`,
      );

      let hasCachedData = false;
      if (cachedTodayTasks) {
        setTasks(cachedTodayTasks);
        hasCachedData = true;
      }
      if (cachedTomorrowTasks) {
        setTomorrowTasks(cachedTomorrowTasks);
        hasCachedData = true;
      }
      if (cachedHabits) {
        setHabits(cachedHabits);
        hasCachedData = true;
      }
      if (cachedAnalytics) {
        setAnalytics(cachedAnalytics);
        hasCachedData = true;
      }
      if (cachedTodayMeals) {
        setTodayMeals(cachedTodayMeals);
        hasCachedData = true;
      }

      if (!hasCachedData && showLoader) {
        setLoading(true);
      }
    } else if (showLoader) {
      setLoading(true);
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const [
        todayTasks,
        nextTasks,
        habitDefinitions,
        records,
        analyticsData,
        mealsData,
      ] = await Promise.all([
        api(`/tasks/${today}`),
        api(`/tasks/${tomorrow}`),
        api("/habits"),
        api(`/habits/records/${today}`),
        api("/analytics"),
        api(`/meals?date=${today}`).catch(() => []),
      ]);
      const formattedHabits = sortHabits(habitDefinitions).map((habit) => {
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
      });
      const formattedAnalytics = sortAnalyticsHabits(analyticsData);

      setTasks(todayTasks);
      setTomorrowTasks(nextTasks);
      setHabits(formattedHabits);
      setAnalytics(formattedAnalytics);
      if (Array.isArray(mealsData)) setTodayMeals(mealsData);
      setError("");

      if (userId) {
        setCache(`focusday_cache_${userId}_tasks_${today}`, todayTasks);
        setCache(`focusday_cache_${userId}_tasks_${tomorrow}`, nextTasks);
        setCache(`focusday_cache_${userId}_habits_${today}`, formattedHabits);
        setCache(
          `focusday_cache_${userId}_analytics_${today}`,
          formattedAnalytics,
        );
        if (Array.isArray(mealsData)) {
          setCache(`focusday_cache_${userId}_meals_${today}`, mealsData);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const userId = user.id || user._id;
    const handleStorage = (e) => {
      if (e.key && e.key.startsWith(`focusday_cache_${userId}_`)) {
        loadData({ showLoader: false });
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user]);

  const addTodayTask = (task) => {
    const userId = user?.id || user?._id;
    setTasks((current) => {
      const next = [...current, task];
      if (userId)
        setCache(`focusday_cache_${userId}_tasks_${localDate()}`, next);
      return next;
    });
    if (userId)
      removeCache(`focusday_cache_${userId}_analytics_${localDate()}`);
    setShowForm(false);
    setError("");
  };

  const addTomorrowTask = (task) => {
    const userId = user?.id || user?._id;
    setTomorrowTasks((current) => {
      const next = [...current, task];
      if (userId)
        setCache(`focusday_cache_${userId}_tasks_${localDate(1)}`, next);
      return next;
    });
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
      const userId = user?.id || user?._id;
      setTasks((current) => {
        const next = current.map((item) =>
          item._id === updated._id ? updated : item,
        );
        if (userId)
          setCache(`focusday_cache_${userId}_tasks_${localDate()}`, next);
        return next;
      });
      setTomorrowTasks((current) => {
        const next = current.map((item) =>
          item._id === updated._id ? updated : item,
        );
        if (userId)
          setCache(`focusday_cache_${userId}_tasks_${localDate(1)}`, next);
        return next;
      });
      if (userId)
        removeCache(`focusday_cache_${userId}_analytics_${localDate()}`);
      api("/analytics")
        .then((analyticsData) => {
          const sorted = sortAnalyticsHabits(analyticsData);
          setAnalytics(sorted);
          if (userId)
            setCache(
              `focusday_cache_${userId}_analytics_${localDate()}`,
              sorted,
            );
        })
        .catch(() => {});
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTask = (updated) => {
    const userId = user?.id || user?._id;
    setTasks((current) => {
      const next = current.map((item) =>
        item._id === updated._id ? updated : item,
      );
      if (userId)
        setCache(`focusday_cache_${userId}_tasks_${localDate()}`, next);
      return next;
    });
    setTomorrowTasks((current) => {
      const next = current.map((item) =>
        item._id === updated._id ? updated : item,
      );
      if (userId)
        setCache(`focusday_cache_${userId}_tasks_${localDate(1)}`, next);
      return next;
    });
    if (userId)
      removeCache(`focusday_cache_${userId}_analytics_${localDate()}`);
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
      const userId = user?.id || user?._id;
      setHabits((current) => {
        const next = current.map((item) =>
          item._id === habit._id
            ? {
                ...item,
                value: savedValue,
                display: formatHabitValue(item, savedValue),
              }
            : item,
        );
        if (userId)
          setCache(`focusday_cache_${userId}_habits_${localDate()}`, next);
        return next;
      });
      const freshAnalytics = sortAnalyticsHabits(await api("/analytics"));
      setAnalytics(freshAnalytics);
      if (userId)
        setCache(
          `focusday_cache_${userId}_analytics_${localDate()}`,
          freshAnalytics,
        );
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    const userId = user?.id || user?._id;
    authRequestRef.current += 1;
    clearToken();
    try {
      if (userId) clearUserCache(userId);
    } catch {}
    removeCache("focusday_auth_user");
    setUser(null);
    setAuthLoading(false);
    setTasks([]);
    setTomorrowTasks([]);
    setHabits([]);
    setTodayMeals([]);
    setAnalytics(null);
    navigate("/login", { replace: true });
  };
  if (authLoading)
    return (
      <main className="auth-shell">
        <div className="auth-mark">FocusDay</div>
      </main>
    );
  if (!user) {
    if (location.pathname !== "/login") return <Navigate to="/login" replace />;
    return <AuthScreen onAuth={setUser} />;
  }
  const sharedPageProps = {
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
    user,
    api,
  };
  return (
    <div className="app-shell">
      <Sidebar
        pathname={location.pathname}
        navigate={navigate}
        onNavigate={() => {}}
      />
      <main className="main">
        <Header
          pathname={location.pathname}
          user={user}
          currentDate={currentDate}
          onLogout={logout}
          error={error}
          onClearError={() => setError("")}
        />
        <Routes>
          <Route
            path="/today"
            element={
              <TodayPage
                {...sharedPageProps}
                tasks={tasks}
                tomorrowTasks={tomorrowTasks}
                addTomorrowTask={addTomorrowTask}
                habits={habits}
                analytics={analytics}
                meals={todayMeals}
                user={user}
                api={api}
                loading={loading}
                showForm={showForm}
                setShowForm={setShowForm}
                addTask={addTodayTask}
                toggleTask={toggleTask}
                updateTask={updateTask}
                recordHabit={recordHabit}
              />
            }
          />
          <Route
            path="/plan"
            element={
              <PlanPage
                {...sharedPageProps}
                todayTasks={tasks}
                tasks={tomorrowTasks}
                addTask={addTomorrowTask}
                updateTask={updateTask}
                toggleTask={toggleTask}
              />
            }
          />
          <Route
            path="/habits"
            element={
              <HabitsPage
                habits={habits}
                recordHabit={recordHabit}
                HabitEntryRow={HabitEntryRow}
                meals={todayMeals}
                user={user}
                api={api}
                localDate={localDate}
              />
            }
          />
          <Route
            path="/meals"
            element={
              <Meals
                user={user}
                setError={setError}
                api={api}
                localDate={localDate}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                data={analytics}
                Comparison={Comparison}
                ThisWeekCard={ThisWeekCard}
                WeekComparisonCard={WeekComparisonCard}
                formatMinutes={formatMinutes}
              />
            }
          />
          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </main>
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
export default App;
