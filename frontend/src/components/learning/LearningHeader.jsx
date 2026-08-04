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
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-50">
          DSA Roadmap
        </h1>
        <span className="select-none text-xs font-medium text-slate-500 dark:text-ink-400">
          {completed} / {total} Done
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-ink-500"
          />
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:border-base-800/40 dark:bg-base-900/40 dark:text-ink-50 dark:placeholder:text-ink-500 dark:focus:border-base-700"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none transition-colors hover:text-slate-900 focus:border-slate-400 dark:border-base-800/40 dark:bg-base-900/40 dark:text-ink-300 dark:hover:text-ink-50 dark:focus:border-base-700 sm:w-auto"
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
            className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none transition-colors hover:text-slate-900 focus:border-slate-400 dark:border-base-800/40 dark:bg-base-900/40 dark:text-ink-300 dark:hover:text-ink-50 dark:focus:border-base-700 sm:w-auto"
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
