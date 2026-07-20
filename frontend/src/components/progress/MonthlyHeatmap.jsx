import { Calendar } from "lucide-react";

export default function MonthlyHeatmap({ monthly = [] }) {
  const cells = Array.from({ length: 35 }, (_, index) => {
    return (
      monthly[index] || {
        date: "",
        completed: 0,
        total: 0,
        xp: 0,
      }
    );
  });

  const intensity = (day) => {
    if (!day.total) return "bg-base-800";

    const rate = day.completed / day.total;

    if (rate === 0) return "bg-base-800";
    if (rate < 0.4) return "bg-base-700";
    if (rate < 0.7) return "bg-base-600";
    if (rate < 1) return "bg-base-500";

    return "bg-ink-200";
  };

  const completed = monthly.reduce(
    (sum, day) => sum + day.completed,
    0
  );

  const total = monthly.reduce(
    (sum, day) => sum + day.total,
    0
  );

  const xp = monthly.reduce(
    (sum, day) => sum + day.xp,
    0
  );

  return (
    <div className="rounded-2xl border border-base-700 bg-base-900 p-4">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-700 bg-base-800">
          <Calendar size={14} className="text-ink-300" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            Monthly Heatmap
          </h2>

          <p className="text-[11px] text-ink-400">
            Daily consistency
          </p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="flex justify-center">
        <div className="grid w-fit grid-cols-7 gap-1">
          {cells.map((day, index) => (
            <div
              key={index}
              className={`group relative h-3 w-3 rounded-sm border border-base-700 transition-colors ${intensity(
                day
              )}`}
            >
              {day.date && (
                <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 rounded-md border border-base-700 bg-base-950 px-2 py-1 text-[10px] shadow-xl whitespace-nowrap group-hover:block">
                  <p className="font-medium text-ink-50">
                    {day.date}
                  </p>

                  <p className="text-ink-300">
                    {day.completed}/{day.total} Missions
                  </p>

                  <p className="text-ink-400">
                    {day.xp} XP
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-base-700 pt-4 text-center">
        <div>
          <p className="text-[10px] text-ink-500">
            Completed
          </p>

          <h3 className="mt-1 text-lg font-semibold text-ink-50">
            {completed}
          </h3>
        </div>

        <div>
          <p className="text-[10px] text-ink-500">
            XP Earned
          </p>

          <h3 className="mt-1 text-lg font-semibold text-ink-50">
            {xp}
          </h3>
        </div>

        <div>
          <p className="text-[10px] text-ink-500">
            Completion
          </p>

          <h3 className="mt-1 text-lg font-semibold text-ink-50">
            {total === 0
              ? "0%"
              : `${Math.round((completed / total) * 100)}%`}
          </h3>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-ink-500">
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
  );
}