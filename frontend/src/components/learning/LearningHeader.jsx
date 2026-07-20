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
    <div className="w-full flex flex-col gap-4">
      {/* Title & Counters Row */}
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-50">
          DSA Roadmap
        </h1>
        <span className="text-xs font-medium text-slate-500 dark:text-ink-400 select-none">
          {completed} / {total} Done
        </span>
      </div>

      {/* Control Actions Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search Input Box */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-ink-500"
          />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 dark:border-base-800/40 dark:bg-base-900/40 dark:text-ink-50 dark:placeholder:text-ink-500 py-1.5 pl-9 pr-3 text-xs outline-none focus:border-slate-400 dark:focus:border-base-700 transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-3">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-base-800/40 dark:bg-base-900/40 dark:text-ink-300 py-1.5 px-3 text-xs outline-none hover:text-slate-900 dark:hover:text-ink-50 focus:border-slate-400 dark:focus:border-base-700 transition-colors"
          >
            <option value="">All Topics</option>
            {topics.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-base-800/40 dark:bg-base-900/40 dark:text-ink-300 py-1.5 px-3 text-xs outline-none hover:text-slate-900 dark:hover:text-ink-50 focus:border-slate-400 dark:focus:border-base-700 transition-colors"
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
