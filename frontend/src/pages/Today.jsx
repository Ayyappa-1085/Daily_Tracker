import { useEffect } from "react";
import {
  Code2,
  Laptop2,
  Dumbbell,
  BookOpen,
  Droplet,
  Check,
} from "lucide-react";
import { useDashboardStore } from "../store/useDashboardStore";

const TYPE_ICON = {
  dsa: Code2,
  development: Laptop2,
  workout: Dumbbell,
  reading: BookOpen,
  water: Droplet,
};
const TYPE_COLOR = {
  dsa: "#3B82F6",
  development: "#3B82F6",
  workout: "#3B82F6",
  reading: "#3B82F6",
  water: "#38BDF8",
};

export default function Today() {
  const { data, status, fetchDashboard, toggleMission, updateMissionProgress } =
    useDashboardStore();

  useEffect(() => {
    if (!data) fetchDashboard();
  }, [data, fetchDashboard]);

  if (status === "loading" && !data) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-[1.5px] border-black/10 border-t-black dark:border-white/20 dark:border-t-white"></div>
        <p className="text-[10px] font-medium tracking-widest text-black/40 dark:text-white/40 uppercase">
          Syncing
        </p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-20 pt-8 sm:px-6 md:gap-8 md:pt-12">
      {/* Compact Header */}
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="relative flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60"></span>
            <span className="relative inline-flex h-1 w-1 rounded-full bg-green-400"></span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-black/40 dark:text-white/40 uppercase">
            Today
          </span>
        </div>

        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white sm:text-3xl">
            Active Directives
          </h1>
          <span className="text-sm font-medium text-black/40 dark:text-white/30">
            Day {data.streakDay}
          </span>
        </div>
      </header>

      {/* Dense List Layout */}
      <div className="flex flex-col gap-2">
        {data.missions.map((mission) => {
          const Icon = TYPE_ICON[mission.type] || Code2;
          const color = TYPE_COLOR[mission.type] || "#3B82F6";

          return (
            <div
              key={mission._id}
              className={`group relative flex flex-col gap-3 overflow-hidden rounded-xl border transition-colors duration-150 ${
                mission.completed
                  ? "border-black/5 bg-transparent opacity-50 hover:bg-black/5 dark:border-white/[0.02] dark:hover:bg-white/[0.02]"
                  : "border-black/10 bg-white hover:border-black/20 hover:bg-black/[0.02] dark:border-white/[0.04] dark:bg-[#09090b] dark:hover:border-white/[0.08] dark:hover:bg-[#0f0f11]"
              }`}
            >
              <div className="flex flex-col gap-4 p-3 md:flex-row md:items-center md:gap-6 md:p-4">
                {/* Left: Compact Icon & Text */}
                <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
                      mission.completed
                        ? "border-transparent bg-black/5 dark:bg-white/[0.02]"
                        : "border-black/5 bg-black/5 dark:border-white/[0.05] dark:bg-white/[0.02]"
                    }`}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      style={{ color: mission.completed ? color : color }}
                      className={mission.completed ? "opacity-50" : ""}
                    />
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <h3
                      className={`truncate text-sm font-medium tracking-tight ${
                        mission.completed
                          ? "text-black/50 line-through dark:text-white/50"
                          : "text-black dark:text-white/90"
                      }`}
                    >
                      {mission.title}
                    </h3>
                    {mission.subtitle && (
                      <p className="truncate text-[11px] text-black/50 dark:text-white/40">
                        {mission.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Middle: Inline Slider (Desktop) */}
                <div className="flex w-full items-center gap-4 md:w-[200px] lg:w-[280px]">
                  <span className="w-7 text-right text-[10px] font-mono text-black/50 dark:text-white/40">
                    {mission.progress}%
                  </span>
                  <div className="group/slider relative flex h-3 flex-1 items-center">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={mission.progress}
                      onChange={(e) =>
                        updateMissionProgress(
                          mission._id,
                          Number(e.target.value),
                        )
                      }
                      className="absolute z-10 w-full appearance-none bg-transparent cursor-pointer
                        [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/10 dark:[&::-webkit-slider-runnable-track]:bg-white/[0.04]
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-all hover:[&::-webkit-slider-thumb]:scale-150 active:[&::-webkit-slider-thumb]:scale-125"
                      style={{
                        background: `linear-gradient(to right, ${color} ${mission.progress}%, transparent ${mission.progress}%)`,
                        backgroundSize: "100% 2px",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        transition: "background 0.2s ease",
                      }}
                      aria-label={`${mission.title} progress`}
                    />
                  </div>
                </div>

                {/* Right: Small Action Button */}
                <div className="flex shrink-0 justify-end md:w-[100px]">
                  <button
                    type="button"
                    onClick={() => toggleMission(mission._id)}
                    className={`flex h-7 w-full items-center justify-center gap-1.5 rounded-md px-3 text-[11px] font-medium transition-all duration-150 active:scale-95 md:w-auto ${
                      mission.completed
                        ? "bg-black/5 text-black/50 hover:bg-black/10 hover:text-black dark:bg-white/5 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
                        : "bg-black text-white hover:bg-black/80 dark:bg-white/10 dark:text-white dark:hover:bg-white dark:hover:text-black"
                    }`}
                  >
                    {mission.completed ? (
                      <>
                        <Check size={12} strokeWidth={2.5} />
                        <span>Done</span>
                      </>
                    ) : (
                      <span>Complete</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
