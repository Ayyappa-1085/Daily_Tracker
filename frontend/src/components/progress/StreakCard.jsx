import { Flame } from "lucide-react";

export default function StreakCard({ user }) {
  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-ink-400">
          Current Streak
        </span>

        <div className="flex h-6 w-6 items-center justify-center rounded-md border border-base-700 bg-base-800">
          <Flame size={12} className="text-ink-300" />
        </div>
      </div>

      <h2 className="mt-2 text-2xl font-bold leading-none text-ink-50">
        {user?.streak ?? 0}
      </h2>

      <p className="mt-1 text-[10px] text-ink-500">
        Longest: {user?.longestStreak ?? 0} days
      </p>
    </div>
  );
}