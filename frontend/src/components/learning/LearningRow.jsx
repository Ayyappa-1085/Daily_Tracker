import { useNavigate } from "react-router-dom";
import { Grid, Search, PlayCircle, CheckCircle2, Circle } from "lucide-react";

export default function LearningRow({ question }) {
  const navigate = useNavigate();
  const isSearchRelated = question.topic?.toLowerCase().includes("search");

  // Dynamic pill formatting optimized for light/dark clarity
  const getDifficultyStyles = (diff) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50";
      case "Medium":
        return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50";
      case "Hard":
        return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50";
      default:
        return "bg-slate-50 text-slate-600 border border-slate-200 dark:bg-base-950 dark:text-ink-300 dark:border-base-800";
    }
  };

  return (
    <tr
      onClick={() => navigate(`/learning/${question._id}`)}
      className="cursor-pointer transition-colors duration-150 border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50/60 dark:hover:bg-base-900/20"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-base-800 dark:bg-base-900/60">
            {isSearchRelated ? (
              <Search size={16} className="text-slate-500 dark:text-ink-300" />
            ) : (
              <Grid size={16} className="text-slate-500 dark:text-ink-300" />
            )}
          </div>
          <span className="text-xs font-semibold text-slate-600 dark:text-ink-400 tracking-tight">
            {question.topic}
          </span>
        </div>
      </td>

      <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-ink-400">
        #{question.leetcodeNumber}
      </td>

      <td className="px-6 py-4">
        <p className="text-sm font-bold text-slate-900 dark:text-ink-50 tracking-tight max-w-[260px] leading-6">
          {question.problemName}
        </p>
      </td>

      <td className="px-6 py-4">
        <span
          className={`inline-block rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${getDifficultyStyles(question.difficulty)}`}
        >
          {question.difficulty}
        </span>
      </td>

      <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-ink-300">
        {question.pattern}
      </td>

      <td className="px-6 py-4">
        {question.current ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-ink-50">
            <PlayCircle
              size={14}
              className="text-blue-600 dark:text-ink-200 fill-transparent"
            />
            Current
          </span>
        ) : question.completed ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-ink-400 dark:opacity-60">
            <CheckCircle2
              size={14}
              className="text-emerald-500 dark:text-ink-400"
            />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-ink-500">
            <Circle size={14} className="text-slate-300 dark:text-base-700" />
            Pending
          </span>
        )}
      </td>
    </tr>
  );
}
