import { memo, useMemo } from "react";

function StatsCard({ stats }) {
  const items = useMemo(
    () => [
      {
        title: "Completion",
        value: `${stats?.completionRate ?? 0}%`,
      },
      {
        title: "Avg XP",
        value: `${stats?.averageXp ?? 0} XP`,
      },
      {
        title: "Best Day",
        value: stats?.bestDay?.date || "-",
      },
      {
        title: "Solved",
        value: stats?.learningSolved ?? 0,
      },
    ],
    [stats]
  );

  return (
    <section className="rounded-2xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">Statistics</h2>

          <p className="mt-1 text-[10px] text-ink-400">Overall performance.</p>
        </div>

        <span className="text-[10px] text-ink-400">
          {stats?.completionRate ?? 0}% complete
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map(({ title, value }) => (
          <div key={title} className="rounded-xl border border-base-700/60 bg-base-950/20 p-4">
            <p className="text-[10px] text-ink-500">{title}</p>

            <h3 className="mt-2 text-lg font-bold leading-none text-ink-50">
              {value}
            </h3>
          </div>
        ))}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-base-700">
        <div
          className="h-full rounded-full bg-ink-200 transition-all duration-700"
          style={{
            width: `${stats?.completionRate ?? 0}%`,
          }}
        />
      </div>
    </section>
  );
}

export default memo(StatsCard);