import { useNavigate } from "react-router-dom";
import { Grid, Search, PlayCircle, CheckCircle2, Circle, ChevronRight } from "lucide-react";

export default function LearningRow({ question, mobile = false }) {
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

  const renderStatus = () => {
    if (question.current) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
          <PlayCircle size={12} className="fill-transparent" />
          In Progress
        </span>
      );
    }

    if (question.completed) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 size={12} />
          Completed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-base-800 dark:text-slate-300">
        <Circle size={12} className="text-slate-400" />
        Not Started
      </span>
    );
  };

  if (mobile) {
    return (
      <button
        type="button"
        onClick={() => navigate(`/learning/${question._id}`)}
        className="flex w-full items-start justify-between rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors duration-150 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-base-900/30 dark:hover:bg-base-900/50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-base-800 dark:bg-base-900/60">
              {isSearchRelated ? (
                <Search size={14} className="text-slate-500 dark:text-ink-300" />
              ) : (
                <Grid size={14} className="text-slate-500 dark:text-ink-300" />
              )}
            </div>
            <p className="text-sm font-semibold leading-5 text-slate-900 dark:text-ink-50">
              {question.problemName}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getDifficultyStyles(question.difficulty)}`}
            >
              {question.difficulty}
            </span>
            {renderStatus()}
          </div>
        </div>

        <ChevronRight size={16} className="ml-2 mt-1 shrink-0 text-slate-400" />
      </button>
    );
  }

  return (
    <tr
      onClick={() => navigate(`/learning/${question._id}`)}
      className="cursor-pointer border-b border-slate-100 transition-colors duration-150 hover:bg-slate-50/60 dark:border-slate-800/40 dark:hover:bg-base-900/20"
    >
      <td className="px-3 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-base-800 dark:bg-base-900/60">
            {isSearchRelated ? (
              <Search size={16} className="text-slate-500 dark:text-ink-300" />
            ) : (
              <Grid size={16} className="text-slate-500 dark:text-ink-300" />
            )}
          </div>
          <span className="text-xs font-semibold tracking-tight text-slate-600 dark:text-ink-400">
            {question.topic}
          </span>
        </div>
      </td>

      <td className="px-3 py-4 text-xs font-medium text-slate-500 dark:text-ink-400 sm:px-6">
        #{question.leetcodeNumber}
      </td>

      <td className="px-3 py-4 sm:px-6">
        <p className="max-w-full text-sm font-bold leading-6 tracking-tight text-slate-900 dark:text-ink-50">
          {question.problemName}
        </p>
      </td>

      <td className="px-3 py-4 sm:px-6">
        <span
          className={`inline-block rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${getDifficultyStyles(question.difficulty)}`}
        >
          {question.difficulty}
        </span>
      </td>

      <td className="px-3 py-4 text-xs font-medium text-slate-600 dark:text-ink-300 sm:px-6">
        {question.pattern}
      </td>

      <td className="px-3 py-4 sm:px-6">
        {question.current ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-ink-50">
            <PlayCircle
              size={14}
              className="fill-transparent text-blue-600 dark:text-ink-200"
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
