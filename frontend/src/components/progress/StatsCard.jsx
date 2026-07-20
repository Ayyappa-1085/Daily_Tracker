import {
  BarChart3,
  CalendarCheck,
  Trophy,
  BookOpen,
} from "lucide-react";

export default function StatsCard({ stats }) {
  const items = [
    {
      title: "Avg XP",
      value: `${stats?.averageXp ?? 0} XP`,
      icon: BarChart3,
    },
    {
      title: "Completion",
      value: `${stats?.completionRate ?? 0}%`,
      icon: CalendarCheck,
    },
    {
      title: "Best Day",
      value: stats?.bestDay?.date || "-",
      icon: Trophy,
    },
    {
      title: "Solved",
      value: stats?.learningSolved ?? 0,
      icon: BookOpen,
    },
  ];

  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            Statistics
          </h2>

          <p className="text-[10px] text-ink-400">
            Overall performance.
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-700 bg-base-800">
          <BarChart3 size={14} className="text-ink-300" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {items.map(({ title, value, icon: Icon }) => (
          <div
            key={title}
            className="rounded-lg border border-base-700 bg-base-800 p-3"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md border border-base-700 bg-base-900">
              <Icon size={13} className="text-ink-300" />
            </div>

            <p className="mt-3 text-[10px] text-ink-500">
              {title}
            </p>

            <h3 className="mt-1 text-lg font-bold leading-none text-ink-50">
              {value}
            </h3>
          </div>
        ))}
      </div>

      {/* Performance */}
      <div className="mt-4 rounded-lg border border-base-700 bg-base-800 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] text-ink-400">
            Performance
          </span>

          <span className="text-xs font-semibold text-ink-50">
            {stats?.completionRate ?? 0}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-base-700">
          <div
            className="h-full rounded-full bg-ink-200 transition-all duration-700"
            style={{
              width: `${stats?.completionRate ?? 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}