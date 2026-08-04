import { Search } from "lucide-react";

export default function LearningHeader({
  progress,
  search,
  setSearch,
  topic,
  setTopic,
  difficulty,
  setDifficulty,
  topics,
}) {
  const completed = progress?.completed || 0;
  const total = progress?.total || 0;

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-end sm:gap-3">
        <h1 className="font-display text-[1.55rem] font-medium tracking-tight text-slate-900 dark:text-ink-50 sm:text-2xl">
          DSA Roadmap
        </h1>
        <span className="select-none text-[11px] font-medium tracking-wide text-slate-500 dark:text-ink-500 sm:mb-[0.1rem] sm:text-xs">
          {completed} / {total} Done
        </span>
      </div>

      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur-sm dark:border-base-800/50 dark:bg-base-900/20 dark:shadow-none sm:flex-row sm:items-stretch">
        <div className="relative flex-1 min-w-0">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-ink-500"
          />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full border-0 bg-transparent py-0 pl-9 pr-3 text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:ring-0 dark:text-ink-50 dark:placeholder:text-ink-500 sm:h-12 sm:min-w-[240px]"
          />
        </div>

        <div className="h-px bg-slate-200/70 dark:bg-base-800/50 sm:h-auto sm:w-px" />

        <div className="grid gap-px bg-slate-200/70 dark:bg-base-800/50 sm:flex sm:bg-transparent">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="h-11 w-full cursor-pointer border-0 bg-white/80 px-3 text-xs text-slate-700 outline-none transition-colors hover:text-slate-900 focus:ring-0 dark:bg-base-900/20 dark:text-ink-300 dark:hover:text-ink-50 sm:h-12 sm:w-auto sm:min-w-[150px]"
          >
            <option value="">All Topics</option>
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className="h-px bg-slate-200/70 dark:bg-base-800/50 sm:h-auto sm:w-px" />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-11 w-full cursor-pointer border-0 bg-white/80 px-3 text-xs text-slate-700 outline-none transition-colors hover:text-slate-900 focus:ring-0 dark:bg-base-900/20 dark:text-ink-300 dark:hover:text-ink-50 sm:h-12 sm:w-auto sm:min-w-[160px]"
          >
            <option value="">All Difficulties</option>
            <option value="Easy">All Easy</option>
            <option value="Medium">All Medium</option>
            <option value="Hard">All Hard</option>
          </select>
        </div>
      </div>
    </div>
  );
}
