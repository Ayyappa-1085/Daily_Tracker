import {
  Award,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function AchievementsCard({ user, stats }) {
  const achievements = [
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

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            Achievements
          </h2>

          <p className="text-[10px] text-ink-400">
            Milestones unlocked.
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-700 bg-base-800">
          <Award size={14} className="text-ink-300" />
        </div>
      </div>

      {/* 2 Rows × 3 Columns */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.title}
            className="h-24 rounded-lg border border-base-700 bg-base-800 p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              {achievement.unlocked ? (
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
                  achievement.unlocked
                    ? "text-ink-200"
                    : "text-ink-500"
                }`}
              >
                {achievement.unlocked
                  ? "Done"
                  : "Locked"}
              </span>
            </div>

            <h3
              className={`text-xs font-semibold ${
                achievement.unlocked
                  ? "text-ink-50"
                  : "text-ink-500"
              }`}
            >
              {achievement.title}
            </h3>

            <p className="mt-1 text-[10px] leading-4 text-ink-500">
              {achievement.description}
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
            {unlocked}/{achievements.length}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-base-700">
          <div
            className="h-full rounded-full bg-ink-200 transition-all duration-700"
            style={{
              width: `${(unlocked / achievements.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}