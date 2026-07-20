import { Trophy, Lock, CheckCircle2 } from "lucide-react";

export default function RewardsCard({ user }) {
  const rewards = [
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
  ];

  const unlockedCount = rewards.filter((r) => r.unlocked).length;

  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            Rewards
          </h2>

          <p className="text-[10px] text-ink-400">
            Unlock milestones.
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-700 bg-base-800">
          <Trophy size={14} className="text-ink-300" />
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <div
            key={reward.title}
            className="h-24 rounded-lg border border-base-700 bg-base-800 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              {reward.unlocked ? (
                <CheckCircle2
                  size={15}
                  className="text-ink-200"
                />
              ) : (
                <Lock
                  size={15}
                  className="text-ink-500"
                />
              )}

              <span
                className={`text-[9px] font-medium ${
                  reward.unlocked
                    ? "text-ink-200"
                    : "text-ink-500"
                }`}
              >
                {reward.unlocked ? "Done" : "Locked"}
              </span>
            </div>

            <h3
              className={`text-xs font-semibold ${
                reward.unlocked
                  ? "text-ink-50"
                  : "text-ink-500"
              }`}
            >
              {reward.title}
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-ink-500">
              {reward.description}
            </p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4 rounded-lg border border-base-700 bg-base-800 p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] text-ink-400">
            Progress
          </span>

          <span className="text-xs font-semibold text-ink-50">
            {unlockedCount}/{rewards.length}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-base-700">
          <div
            className="h-full rounded-full bg-ink-200 transition-all duration-700"
            style={{
              width: `${(unlockedCount / rewards.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}