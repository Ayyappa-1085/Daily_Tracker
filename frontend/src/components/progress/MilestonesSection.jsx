import { memo, useMemo, useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";

function MilestoneCard({ title, description, unlocked }) {
  return (
    <div className="rounded-xl border border-base-700/60 bg-base-900/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className={`text-xs font-semibold ${unlocked ? "text-ink-50" : "text-ink-400"}`}>
          {title}
        </h3>

        <span
          className={`text-[9px] font-medium ${
            unlocked ? "text-ink-200" : "text-ink-500"
          }`}
        >
          {unlocked ? "Done" : "Locked"}
        </span>
      </div>

      <p className="mt-2 text-[10px] leading-4 text-ink-500">
        {description}
      </p>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-ink-400">
        {unlocked ? (
          <CheckCircle2 size={12} className="text-ink-200" />
        ) : (
          <Lock size={12} className="text-ink-500" />
        )}

        <span>{unlocked ? "Unlocked" : "Locked"}</span>
      </div>
    </div>
  );
}

function MilestonesSection({ user, stats }) {
  const [showAll, setShowAll] = useState(false);

  const milestones = useMemo(() => {
    const source = [
      {
        title: "First Mission",
        description: "Complete your first mission",
        unlocked: (user?.totalXp ?? 0) >= 20,
      },
      {
        title: "100 XP",
        description: "Earn 100 XP",
        unlocked: (user?.totalXp ?? 0) >= 100,
      },
      {
        title: "Level 5",
        description: "Reach Level 5",
        unlocked: (user?.level ?? 0) >= 5,
      },
      {
        title: "7-Day Streak",
        description: "Maintain a 7-day streak",
        unlocked: (user?.longestStreak ?? 0) >= 7,
      },
      {
        title: "1000 XP",
        description: "Earn 1000 XP",
        unlocked: (user?.totalXp ?? 0) >= 1000,
      },
      {
        title: "30-Day Streak",
        description: "Maintain a 30-day streak",
        unlocked: (user?.longestStreak ?? 0) >= 30,
      },
      {
        title: "First Step",
        description: "Earn your first XP",
        unlocked: (user?.totalXp ?? 0) >= 1,
      },
      {
        title: "XP Collector",
        description: "Earn 500 XP",
        unlocked: (user?.totalXp ?? 0) >= 500,
      },
      {
        title: "Master Learner",
        description: "Solve 50 Problems",
        unlocked: (stats?.learningSolved ?? 0) >= 50,
      },
      {
        title: "Consistent",
        description: "7-Day Streak",
        unlocked: (user?.longestStreak ?? 0) >= 7,
      },
      {
        title: "Dedicated",
        description: "30-Day Streak",
        unlocked: (user?.longestStreak ?? 0) >= 30,
      },
      {
        title: "Legend",
        description: "Reach Level 10",
        unlocked: (user?.level ?? 0) >= 10,
      },
    ];

    const seen = new Set();

    return source.filter((item) => {
      const key = item.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [stats?.learningSolved, user?.level, user?.longestStreak, user?.totalXp]);

  const unlockedCount = milestones.filter((milestone) => milestone.unlocked).length;

  const visibleMilestones = useMemo(() => {
    if (showAll) return milestones;

    const lockedMilestones = milestones.filter((milestone) => !milestone.unlocked);

    if (lockedMilestones.length > 0) {
      return lockedMilestones.slice(0, 3);
    }

    return milestones.slice(0, 3);
  }, [milestones, showAll]);

  return (
    <section className="rounded-2xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">Milestones</h2>

          <p className="mt-1 text-[10px] text-ink-400">
            Rewards and achievements combined into one grid.
          </p>
        </div>

        <span className="text-[10px] text-ink-400">
          {unlockedCount}/{milestones.length} done
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {visibleMilestones.map((milestone) => (
          <MilestoneCard key={milestone.title} {...milestone} />
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          className="text-[10px] font-medium text-ink-400 transition-colors hover:text-ink-50"
        >
          {showAll ? "Show less" : "View all milestones"}
        </button>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-base-700">
        <div
          className="h-full rounded-full bg-ink-200 transition-all duration-700"
          style={{
            width: `${(unlockedCount / milestones.length) * 100}%`,
          }}
        />
      </div>
    </section>
  );
}

export default memo(MilestonesSection);