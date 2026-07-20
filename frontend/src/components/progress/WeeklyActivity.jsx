import { CalendarDays } from "lucide-react";

export default function WeeklyActivity({ weekly = [] }) {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const chart =
    weekly.length > 0
      ? weekly
      : labels.map(() => ({
          completed: 0,
          total: 0,
          xp: 0,
        }));

  const maxValue = Math.max(
    ...chart.map((day) => day.completed),
    1
  );

  const completed = chart.reduce(
    (sum, day) => sum + day.completed,
    0
  );

  const total = chart.reduce(
    (sum, day) => sum + day.total,
    0
  );

  const xp = chart.reduce(
    (sum, day) => sum + day.xp,
    0
  );

  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            Weekly Activity
          </h2>

          <p className="text-[10px] text-ink-400">
            Mission completion this week.
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-700 bg-base-800">
          <CalendarDays size={14} className="text-ink-300" />
        </div>
      </div>

      {/* Chart */}
      <div className="flex h-40 items-end justify-between gap-2">
        {chart.map((day, index) => {
          const height = (day.completed / maxValue) * 100;

          return (
            <div
              key={index}
              className="group flex flex-1 flex-col items-center"
            >
              {/* Tooltip */}
              <div className="mb-2 hidden rounded-md border border-base-700 bg-base-950 px-2 py-1 text-[10px] shadow-lg group-hover:block">
                <p className="text-ink-50">{day.day}</p>

                <p className="text-ink-300">
                  {day.completed}/{day.total}
                </p>

                <p className="text-ink-400">
                  {day.xp} XP
                </p>
              </div>

              {/* Bar */}
              <div className="flex h-32 w-full items-end rounded-md bg-base-800">
                <div
                  className="w-full rounded-md bg-ink-200 transition-all duration-500"
                  style={{
                    height: `${Math.max(height, 5)}%`,
                  }}
                />
              </div>

              <span className="mt-2 text-[10px] text-ink-500">
                {day.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-base-700 pt-3">
        <div className="rounded-lg border border-base-700 bg-base-800 p-2 text-center">
          <p className="text-[10px] text-ink-500">
            Completed
          </p>

          <h3 className="mt-1 text-lg font-semibold text-ink-50">
            {completed}
          </h3>
        </div>

        <div className="rounded-lg border border-base-700 bg-base-800 p-2 text-center">
          <p className="text-[10px] text-ink-500">
            XP
          </p>

          <h3 className="mt-1 text-lg font-semibold text-ink-50">
            {xp}
          </h3>
        </div>

        <div className="rounded-lg border border-base-700 bg-base-800 p-2 text-center">
          <p className="text-[10px] text-ink-500">
            Success
          </p>

          <h3 className="mt-1 text-lg font-semibold text-ink-50">
            {total === 0
              ? "0%"
              : `${Math.round((completed / total) * 100)}%`}
          </h3>
        </div>
      </div>
    </div>
  );
}