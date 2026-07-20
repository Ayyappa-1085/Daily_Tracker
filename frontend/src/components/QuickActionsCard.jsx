import { useState } from "react";
import {
  Code2,
  Laptop2,
  Dumbbell,
  BookOpen,
  Droplet,
  Plus,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const ACTIONS = [
  { type: "dsa", label: "DSA", icon: Code2, color: "#7E8796" },
  {
    type: "development",
    label: "Development",
    icon: Laptop2,
    color: "#8A847C",
  },
  { type: "workout", label: "Workout", icon: Dumbbell, color: "#8F9581" },
  { type: "reading", label: "Reading", icon: BookOpen, color: "#8C7A69" },
  { type: "water", label: "Water", icon: Droplet, color: "#87929A" },
];

export default function QuickActionsCard({
  missions = [],
  onToggle,
  onCreate,
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("dsa");
  const [submitting, setSubmitting] = useState(false);

  const missionByType = Object.fromEntries(missions.map((m) => [m.type, m]));

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    await onCreate({ type, title: title.trim(), subtitle: "Custom mission" });
    setSubmitting(false);
    setTitle("");
    setAdding(false);
  }

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-base-700 bg-base-800">
            <Sparkles size={18} color="#8A847C" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-50">
              Quick Actions
            </h2>
            <p className="text-sm text-ink-400">
              Create or update today's missions.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-base-700 bg-base-800 hover:bg-base-700"
        >
          {adding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="mt-5 space-y-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="focus-ring w-full rounded-xl border border-base-700 bg-base-800 px-3 py-2.5 text-sm"
          >
            <option value="dsa">DSA</option>
            <option value="development">Development</option>
            <option value="workout">Workout</option>
            <option value="reading">Reading</option>
            <option value="water">Water</option>
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mission..."
            className="focus-ring w-full rounded-xl border border-base-700 bg-base-800 px-3 py-2.5 text-sm"
          />
          <button
            disabled={submitting}
            className="focus-ring w-full rounded-full bg-ink-50 py-3 font-semibold text-base-950 hover:opacity-90"
          >
            {submitting ? "Creating..." : "Create Mission"}
          </button>
        </form>
      )}

      <div className="mt-6 grid grid-cols-5 gap-3">
        {ACTIONS.map(({ type, label, icon: Icon, color }) => {
          const mission = missionByType[type];
          const completed = mission?.completed;
          return (
            <button
              key={type}
              type="button"
              disabled={!mission}
              onClick={() => mission && onToggle(mission._id)}
              className="focus-ring rounded-2xl border border-base-700 bg-base-800/60 p-4 text-left transition-all hover:bg-base-800 disabled:opacity-40"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-base-700 bg-base-800">
                  <Icon size={20} color={color} />
                </div>
                {completed && (
                  <CheckCircle2 size={18} className="text-ink-200" />
                )}
              </div>
              <p className="mt-5 text-sm font-semibold text-ink-50">{label}</p>
              <p className="mt-1 text-[11px] text-ink-400">
                {completed ? "Completed" : "Tap to update"}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
