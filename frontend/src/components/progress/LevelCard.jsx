import { memo } from "react";

function LevelCard({ user }) {
  return (
    <div className="rounded-xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
      <p className="text-[10px] text-ink-400">Level</p>

      <h2 className="mt-3 text-3xl font-bold leading-none text-ink-50">
        {user?.level ?? 0}
      </h2>

      <p className="mt-2 text-[10px] text-ink-500">
        Earn XP to level up.
      </p>
    </div>
  );
}

export default memo(LevelCard);