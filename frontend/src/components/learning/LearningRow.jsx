import { useNavigate } from "react-router-dom";
import { Grid, Search, PlayCircle, CheckCircle2, Circle, ChevronRight } from "lucide-react";

export default function LearningRow({ question, mobile = false }) {
  const navigate = useNavigate();
  const isSearchRelated = question.topic?.toLowerCase().includes("search");

  // Dynamic pill formatting optimized for light/dark clarity
  const getDifficultyStyles = (diff) => {
    switch (diff) {
      case "Easy":
        return "border-slate-200 text-slate-600 dark:border-base-700 dark:text-ink-300";
      case "Medium":
        return "border-slate-300 text-slate-600 dark:border-base-600 dark:text-ink-200";
      case "Hard":
        return "border-slate-400 text-slate-700 dark:border-base-500 dark:text-ink-100";
      default:
        return "border-slate-200 text-slate-600 dark:border-base-700 dark:text-ink-300";
    }
  };

  const renderStatus = () => {
    if (question.current) {
      return (
        <span
          title="Current"
          aria-label="Current"
          className="status-glow-current inline-flex h-2.5 w-2.5 rounded-full bg-[rgb(var(--status-current)/0.95)]"
        />
      );
    }

    if (question.completed) {
      return (
        <span
          title="Completed"
          aria-label="Completed"
          className="status-glow-completed inline-flex h-2.5 w-2.5 rounded-full bg-[rgb(var(--status-completed)/0.95)]"
        />
      );
    }

    return (
      <span
        title="Pending"
        aria-label="Pending"
        className="status-glow-not-started inline-flex h-2.5 w-2.5 rounded-full bg-[rgb(var(--status-not-started)/0.45)]"
      />
    );
  };

  const renderDesktopStatus = () => {
    if (question.current) {
      return (
        <span className="inline-flex items-center gap-2 text-[11px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
          <span className="status-glow-current inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[rgb(var(--status-current))]" />
          Current
        </span>
      );
    }

    if (question.completed) {
      return (
        <span className="inline-flex items-center gap-2 text-[11px] font-medium text-[rgb(var(--status-completed))]">
          <span className="status-glow-completed inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[rgb(var(--status-completed))]" />
          Completed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 text-[11px] font-medium text-[rgb(var(--status-not-started))]">
        <span className="status-glow-not-started inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[rgb(var(--status-not-started))]" />
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
      className="cursor-pointer border-b border-slate-100/70 transition-colors duration-150 hover:bg-slate-50/40 dark:border-slate-800/30 dark:hover:bg-base-900/15"
    >
      <td className="px-3 py-5 align-top text-xs font-medium text-slate-500 dark:text-ink-400 sm:px-5">
        #{question.leetcodeNumber}
      </td>

      <td className="px-3 py-5 align-top sm:px-5">
        <div className="min-w-0">
          <p className="max-w-full text-sm font-semibold leading-6 tracking-tight text-slate-900 dark:text-ink-50">
            {question.problemName}
          </p>

          <p className="mt-0.5 max-w-full truncate text-[11px] leading-5 text-slate-500 dark:text-ink-500">
            {question.pattern}
          </p>
        </div>
      </td>

      <td className="px-3 py-5 align-top sm:px-5">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-normal ${getDifficultyStyles(question.difficulty)}`}
        >
          {question.difficulty}
        </span>
      </td>

      <td className="px-3 py-5 align-middle text-xs font-medium text-slate-500 dark:text-ink-400 sm:px-5">
        <div className="flex h-full items-center">
          {renderDesktopStatus()}
        </div>
      </td>
    </tr>
  );
}
