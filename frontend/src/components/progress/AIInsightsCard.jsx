import { memo, useMemo } from "react";
import { Sparkles, TrendingUp, Flame, BookOpen, Target } from "lucide-react";

function AIInsightsCard({ user, stats }) {
  const insights = useMemo(() => [
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
  ], [stats?.completionRate, stats?.learningSolved, user?.level, user?.streak]);

  return (
    <section className="rounded-2xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">AI Insights</h2>

          <p className="mt-1 text-[10px] text-ink-400">
            Personalized recommendations.
          </p>
        </div>

        <Sparkles size={14} className="text-ink-400" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {insights.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-xl border border-base-700/60 bg-base-950/20 p-4 transition-all hover:border-base-600"
          >
            <div className="flex items-start gap-2">
              <Icon size={13} className="mt-0.5 shrink-0 text-ink-300" />

              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-ink-50">{title}</h3>

                <p className="mt-1 text-[10px] leading-4 text-ink-400">{text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-base-700/60 bg-base-950/20 p-3">
        <p className="text-[9px] uppercase tracking-wider text-ink-500">
          Today's Focus
        </p>

        <p className="mt-1 text-[10px] leading-4 text-ink-300">
          Finish today's missions, solve one DSA problem, and maintain
          your streak.
        </p>
      </div>
    </section>
  );
}

export default memo(AIInsightsCard);