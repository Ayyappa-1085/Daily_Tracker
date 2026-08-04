import { memo, useMemo } from "react";

function ToggleButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-[10px] font-medium transition-colors ${
        active
          ? "bg-base-700 text-ink-50"
          : "text-ink-400 hover:text-ink-50"
      }`}
    >
      {children}
    </button>
  );
}

function ConsistencySection({ view, setView, weekly = [], monthly = [] }) {
  const weeklyChart = useMemo(() => {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return labels.map((dayLabel, index) => {
      const source = weekly[index] || { completed: 0, total: 0, xp: 0 };

      return {
        day: source.day || dayLabel,
        completed: source.completed || 0,
        total: source.total || 0,
        xp: source.xp || 0,
      };
    });
  }, [weekly]);

  const monthlyCells = useMemo(() => {
    return Array.from({ length: 35 }, (_, index) => {
      return (
        monthly[index] || {
          date: "",
          completed: 0,
          total: 0,
          xp: 0,
        }
      );
    });
  }, [monthly]);

  const summary = useMemo(() => {
    const data = view === "weekly" ? weeklyChart : monthly;

    const totals = data.reduce(
      (accumulator, day) => {
        accumulator.completed += day.completed || 0;
        accumulator.total += day.total || 0;
        accumulator.xp += day.xp || 0;
        return accumulator;
      },
      { completed: 0, total: 0, xp: 0 }
    );

    const success =
      totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100);

    return {
      completed: totals.completed,
      total: totals.total,
      xp: totals.xp,
      success,
    };
  }, [view, weeklyChart, monthly]);

  const maxCompleted = useMemo(() => {
    return Math.max(
      ...weeklyChart.map((day) => day.completed || 0),
      1
    );
  }, [weeklyChart]);

  const heatmapIntensity = (day) => {
    if (!day.total) return "bg-base-800";

    const rate = day.completed / day.total;

    if (rate === 0) return "bg-base-800";
    if (rate < 0.4) return "bg-base-700";
    if (rate < 0.7) return "bg-base-600";
    if (rate < 1) return "bg-base-500";

    return "bg-ink-200";
  };

  return (
    <section className="rounded-2xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            Consistency
          </h2>

          <p className="mt-1 text-[10px] text-ink-400">
            One view for weekly bars or the monthly heatmap.
          </p>
        </div>

        <div className="flex w-fit rounded-lg border border-base-700 bg-base-900 p-0.5">
          <ToggleButton active={view === "weekly"} onClick={() => setView("weekly")}>
            Weekly
          </ToggleButton>

          <ToggleButton active={view === "monthly"} onClick={() => setView("monthly")}>
            Monthly
          </ToggleButton>
        </div>
      </div>

      {view === "weekly" ? (
        <div className="mt-5">
          <div className="flex h-40 items-end justify-between gap-2">
            {weeklyChart.map((day, index) => {
              const height = (day.completed / maxCompleted) * 100;

              return (
                <div key={index} className="group flex flex-1 flex-col items-center">
                  <div className="mb-2 hidden rounded-md border border-base-700 bg-base-950 px-2 py-1 text-[10px] shadow-lg group-hover:block">
                    <p className="text-ink-50">{day.day}</p>
                    <p className="text-ink-300">
                      {day.completed}/{day.total}
                    </p>
                    <p className="text-ink-400">{day.xp} XP</p>
                  </div>

                  <div className="flex h-32 w-full items-end rounded-md bg-base-800/80">
                    <div
                      className="w-full rounded-md bg-ink-200 transition-all duration-500"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  </div>

                  <span className="mt-2 text-[10px] text-ink-500">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex justify-center">
            <div className="grid w-fit grid-cols-7 gap-1">
              {monthlyCells.map((day, index) => (
                <div
                  key={index}
                  className={`group relative h-3 w-3 rounded-sm border border-base-700 transition-colors ${heatmapIntensity(
                    day
                  )}`}
                >
                  {day.date && (
                    <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md border border-base-700 bg-base-950 px-2 py-1 text-[10px] shadow-xl group-hover:block">
                      <p className="font-medium text-ink-50">{day.date}</p>

                      <p className="text-ink-300">
                        {day.completed}/{day.total} Missions
                      </p>

                      <p className="text-ink-400">{day.xp} XP</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-ink-500">
            <span>Less</span>

            <div className="flex gap-1">
              <div className="h-2.5 w-2.5 rounded-sm bg-base-800" />
              <div className="h-2.5 w-2.5 rounded-sm bg-base-700" />
              <div className="h-2.5 w-2.5 rounded-sm bg-base-600" />
              <div className="h-2.5 w-2.5 rounded-sm bg-base-500" />
              <div className="h-2.5 w-2.5 rounded-sm bg-ink-200" />
            </div>

            <span>More</span>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-base-700/60 bg-base-950/20 p-3">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] text-ink-500">Completed</p>
            <h3 className="mt-1 text-lg font-semibold text-ink-50">
              {summary.completed}
            </h3>
          </div>

          <div>
            <p className="text-[10px] text-ink-500">XP Earned</p>
            <h3 className="mt-1 text-lg font-semibold text-ink-50">
              {summary.xp}
            </h3>
          </div>

          <div>
            <p className="text-[10px] text-ink-500">Completion</p>
            <h3 className="mt-1 text-lg font-semibold text-ink-50">
              {summary.total === 0 ? "0%" : `${summary.success}%`}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ConsistencySection);