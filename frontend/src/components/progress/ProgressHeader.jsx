import { CalendarDays } from "lucide-react";

export default function ProgressHeader({ view, setView }) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
      {/* Title */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-700 bg-base-900">
          <CalendarDays
            size={14}
            className="text-ink-300"
          />
        </div>

        <div>
          <h1 className="text-xl font-semibold leading-none text-ink-50">
            Progress
          </h1>

          <p className="mt-1 text-[10px] text-ink-400">
            Track your growth and consistency.
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex w-fit rounded-lg border border-base-700 bg-base-900 p-0.5">
        {["weekly", "monthly"].map((item) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors ${
              view === item
                ? "bg-base-700 text-ink-50"
                : "text-ink-400 hover:text-ink-50"
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}