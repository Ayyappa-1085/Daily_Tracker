import LearningRow from "./LearningRow";

export default function LearningTable({ questions }) {
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50/50 p-10 dark:border-base-800 dark:bg-base-900/20">
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
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-base-900/20 dark:shadow-none">
      <div className="block sm:hidden">
        <div className="flex flex-col gap-2 p-2">
          {questions.map((question) => (
            <LearningRow key={question._id} question={question} mobile />
          ))}
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] table-auto border-collapse">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/50 dark:border-slate-800/70 dark:bg-base-900/25">
                <th className="w-[8%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-ink-500 sm:px-5">
                  LC#
                </th>

                <th className="w-[54%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-ink-500 sm:px-5">
                  Problem Name
                </th>

                <th className="w-[14%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-ink-500 sm:px-5">
                  Difficulty
                </th>

                <th className="w-[12%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-ink-500 sm:px-5">
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
    </div>
  );
}
