import { useEffect, useState } from "react";
import { NotebookPen, PencilLine, Trash2, X } from "lucide-react";
import api from "../api/axios";
import { recordActivity } from "../utils/activityFeed.mjs";

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
  const [editingEntryId, setEditingEntryId] = useState(null);
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
      const payload = { content: content.trim(), mood };

      if (editingEntryId) {
        const { data } = await api.patch(`/journal/${editingEntryId}`, payload);

        setEntries((prev) =>
          prev.map((entry) =>
            entry._id === editingEntryId ? data.entry : entry,
          ),
        );

        recordActivity({
          title: "Journal entry updated",
          description: "Refined an existing reflection",
          category: "journal",
          dedupKey: `journal:update:${editingEntryId}`,
        });
      } else {
        const { data } = await api.post("/journal", payload);

        setEntries((prev) => {
          const index = prev.findIndex((entry) => entry._id === data.entry._id);
          if (index === -1) {
            return [data.entry, ...prev];
          }

          const next = [...prev];
          next[index] = data.entry;
          return next;
        });

        recordActivity({
          title: "Journal entry created",
          description: "Added today's reflection",
          category: "journal",
          dedupKey: "journal:create",
        });
      }

      setContent("");
      setMood("okay");
      setEditingEntryId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save this entry.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(entry) {
    setEditingEntryId(entry._id);
    setContent(entry.content);
    setMood(entry.mood);
    setError("");
  }

  function handleCancelEdit() {
    setEditingEntryId(null);
    setContent("");
    setMood("okay");
    setError("");
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/journal/${id}`);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      if (editingEntryId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete this entry.");
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-50 sm:text-3xl">
          <NotebookPen size={26} className="text-accent-gold" />
          Journal
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Reflect on today — one honest paragraph beats a perfect one.
        </p>
      </div>

      <section className="card p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink-50">
          Today's reflection
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`focus-ring flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs transition sm:px-3 sm:py-1.5 sm:text-sm ${
                mood === m.value
                  ? "border-accent-gold bg-accent-gold/10 text-accent-gold"
                  : "border-base-700 text-ink-400 hover:text-ink-50"
              }`}
            >
              <span aria-hidden>{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="What went well today? What will you do differently tomorrow?"
            className="focus-ring min-h-[140px] resize-none rounded-lg border border-base-700 bg-base-800 px-4 py-3 text-sm leading-relaxed text-ink-50 placeholder:text-ink-500 sm:min-h-[160px]"
          />

          {error && <p className="text-sm text-accent-red">{error}</p>}

          {editingEntryId && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-400">Editing saved entry</span>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="focus-ring inline-flex items-center gap-1 rounded-lg border border-base-700 px-3 py-2 text-xs text-ink-400 transition hover:bg-base-700 hover:text-ink-50"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="focus-ring w-full rounded-lg bg-accent-gold px-5 py-2.5 text-sm font-semibold text-base-950 transition hover:brightness-105 disabled:opacity-50 sm:w-fit"
          >
            {saving ? "Saving…" : editingEntryId ? "Update Entry" : "Save Entry"}
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
                  className="group card flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-ink-500">
                      {entry.date} <span aria-hidden>{moodMeta?.emoji}</span>
                    </p>

                    <p className="mt-1 break-words text-sm leading-relaxed text-ink-200">
                      {entry.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      aria-label="Edit entry"
                      className="focus-ring rounded-lg p-2 text-ink-500 transition hover:bg-base-700 hover:text-accent-gold sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                    >
                      <PencilLine size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(entry._id)}
                      aria-label="Delete entry"
                      className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-base-700 hover:text-accent-red"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}