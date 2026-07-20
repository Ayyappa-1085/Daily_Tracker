import { Code2, Laptop2, Dumbbell, BookOpen, Droplet } from "lucide-react";

const TYPE_ICON = {
  dsa: Code2,
  development: Laptop2,
  workout: Dumbbell,
  reading: BookOpen,
  water: Droplet,
};

function timeAgo(dateStr) {
  const then = new Date(dateStr).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function RecentActivityCard({ missions = [] }) {
  const recent = missions
    .filter((m) => m.completed && m.completedAt)
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 5);

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-ink-50">
          Recent Activity
        </h2>
        <span className="text-xs text-ink-500">View all</span>
      </div>

      {recent.length === 0 ? (
        <p className="mt-6 text-sm text-ink-400">
          Nothing completed yet today — get started!
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-base-700">
          {recent.map((m) => {
            const Icon = TYPE_ICON[m.type] || Code2;
            return (
              <li
                key={m._id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-700 text-ink-50">
                  <Icon size={16} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-50">
                    {m.title} completed
                  </p>
                  <p className="text-xs text-ink-500 capitalize">{m.type}</p>
                </div>

                <span className="shrink-0 text-xs text-ink-500">
                  {timeAgo(m.completedAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
