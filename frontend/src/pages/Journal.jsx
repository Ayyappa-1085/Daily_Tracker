import { useEffect, useState } from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import api from "../api/axios";

const MOODS = [
  { value: "great", emoji: "🤩", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "rough", emoji: "😞", label: "Rough" },
];

export default function Journal() {
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("okay");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [{ data: all }, { data: today }] = await Promise.all([
        api.get("/journal"),
        api.get("/journal/today"),
      ]);
      setEntries(all.entries);
      if (today.entry) {
        setContent(today.entry.content);
        setMood(today.entry.mood);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load your journal.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/journal", { content, mood });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this entry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/journal/${id}`);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete this entry.");
    }
  }

  return (
    <div className="flex flex-col gap-6 px-8 pt-8">
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold text-ink-50">
          <NotebookPen size={26} className="text-accent-gold" />
          Journal
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Reflect on today — one honest paragraph beats a perfect one.
        </p>
      </div>

      <section className="card p-6">
        <h2 className="font-display text-lg font-semibold text-ink-50">
          Today's reflection
        </h2>

        <div className="mt-4 flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`focus-ring flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                mood === m.value
                  ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                  : "border-base-700 text-ink-400 hover:text-ink-50"
              }`}
            >
              <span aria-hidden>{m.emoji}</span> {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="What went well today? What will you do differently tomorrow?"
            className="focus-ring resize-none rounded-lg border border-base-700 bg-base-800 px-4 py-3 text-sm leading-relaxed text-ink-50 placeholder:text-ink-500"
          />
          {error && <p className="text-sm text-accent-red">{error}</p>}
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="focus-ring self-start rounded-lg bg-accent-gold px-5 py-2.5 text-sm font-semibold text-base-950 transition hover:brightness-105 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Entry"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-50">
          Past entries
        </h2>
        {loading ? (
          <p className="text-sm text-ink-400">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-ink-400">
            No entries yet — today's is a great place to start.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map((entry) => {
              const moodMeta = MOODS.find((m) => m.value === entry.mood);
              return (
                <div
                  key={entry._id}
                  className="card flex items-start justify-between gap-4 p-4"
                >
                  <div>
                    <p className="text-xs font-medium text-ink-500">
                      {entry.date} <span aria-hidden>{moodMeta?.emoji}</span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-200">
                      {entry.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry._id)}
                    aria-label="Delete entry"
                    className="focus-ring shrink-0 rounded-lg p-2 text-ink-500 hover:bg-base-700 hover:text-accent-red"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
