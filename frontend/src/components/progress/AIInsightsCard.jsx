import {
  Sparkles,
  TrendingUp,
  Flame,
  BookOpen,
  Target,
} from "lucide-react";

export default function AIInsightsCard({ user, stats }) {
  const insights = [
    {
      icon: TrendingUp,
      title: "Performance",
      text:
        stats?.completionRate >= 80
          ? "Excellent consistency! Keep it up."
          : "Complete more daily missions.",
    },
    {
      icon: Flame,
      title: "Streak",
      text:
        (user?.streak ?? 0) >= 7
          ? `${user.streak}-day streak. Keep going!`
          : "Complete one mission daily.",
    },
    {
      icon: BookOpen,
      title: "Learning",
      text:
        (stats?.learningSolved ?? 0) >= 20
          ? `${stats.learningSolved} problems solved.`
          : "Solve DSA problems consistently.",
    },
    {
      icon: Target,
      title: "Next Goal",
      text:
        user?.level >= 10
          ? "Reach 5000 XP."
          : `Reach Level ${(user?.level ?? 0) + 1}.`,
    },
  ];

  return (
    <div className="rounded-xl border border-base-700 bg-base-900 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            AI Insights
          </h2>

          <p className="text-[10px] text-ink-400">
            Personalized recommendations.
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-700 bg-base-800">
          <Sparkles size={14} className="text-ink-300" />
        </div>
      </div>

      {/* Compact Cards */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {insights.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="h-24 rounded-lg border border-base-700 bg-base-800 p-3 transition-all hover:border-base-600"
          >
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-base-700 bg-base-900">
                <Icon size={13} className="text-ink-300" />
              </div>

              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-ink-50">
                  {title}
                </h3>

                <p className="mt-1 text-[10px] leading-4 text-ink-400">
                  {text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Focus */}
      <div className="mt-3 rounded-lg border border-base-700 bg-base-800 p-3">
        <p className="text-[9px] uppercase tracking-wider text-ink-500">
          Today's Focus
        </p>

        <p className="mt-1 text-[10px] leading-4 text-ink-300">
          Finish today's missions, solve one DSA problem, and maintain
          your streak.
        </p>
      </div>
    </div>
  );
}