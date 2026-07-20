import { Flame, Star, Trophy, Zap, TrendingUp } from "lucide-react";

function StatCard({ icon: Icon, iconColor, iconBg, value, label, trend }) {
  const last = trend?.length > 1 ? trend[trend.length - 1] : value;

  const previous = trend?.length > 1 ? trend[trend.length - 2] : value;

  const increased = last >= previous;

  return (
    <div className="card flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon size={18} color={iconColor} />
        </span>

        <div>
          <p className="text-xs text-ink-400">{label}</p>

          <h3 className="font-display text-xl font-bold text-ink-50">
            {value}
          </h3>
        </div>
      </div>

      <div
        className={`flex items-center gap-1 text-xs font-semibold ${
          increased ? "text-accent-green" : "text-accent-red"
        }`}
      >
        <TrendingUp size={14} />
        {increased ? "+" : "-"}
      </div>
    </div>
  );
}

export default function StatsRow({ stats, trends }) {
  const completion = trends?.completion || [];
  const xp = trends?.xp || [];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <StatCard
        icon={Flame}
        iconColor="#F97316"
        iconBg="bg-orange-500/15"
        value={stats.streak}
        label="Streak"
        trend={completion}
      />

      <StatCard
        icon={Star}
        iconColor="#3B82F6"
        iconBg="bg-blue-500/15"
        value={stats.level}
        label="Level"
        trend={completion}
      />

      <StatCard
        icon={Trophy}
        iconColor="#3B82F6"
        iconBg="bg-blue-500/15"
        value={stats.totalXp}
        label="Total XP"
        trend={xp}
      />

      <StatCard
        icon={Zap}
        iconColor="#3B82F6"
        iconBg="bg-blue-500/15"
        value={stats.xpToday}
        label="XP Today"
        trend={xp}
      />
    </div>
  );
}
