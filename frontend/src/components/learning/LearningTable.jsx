import LearningRow from "./LearningRow";

export default function LearningTable({ questions }) {
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[260px] items-center justify-center p-10 border border-slate-200 bg-slate-50/50 dark:border-base-800 dark:bg-base-900/20 rounded-xl">
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700 dark:text-ink-200">
            No questions found
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-ink-500">
            Try adjusting your filters or search terms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white dark:border-slate-800/80 dark:bg-base-900/20 overflow-hidden shadow-sm dark:shadow-none">
      <div className="w-full">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800/80 dark:bg-base-900/40">
              <th className="w-[18%] px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-ink-500">
                Topic
              </th>

              <th className="w-[7%] px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-ink-500">
                LC#
              </th>

              <th className="w-[28%] px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-ink-500">
                Problem Name
              </th>

              <th className="w-[12%] px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-ink-500">
                Difficulty
              </th>

              <th className="w-[18%] px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-ink-300">
                Pattern
              </th>

              <th className="w-[17%] px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-ink-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <LearningRow key={question._id} question={question} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
