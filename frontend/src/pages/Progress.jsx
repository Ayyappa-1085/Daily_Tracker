import { useEffect } from "react";

import { useProgressStore } from "../store/useProgressStore";

import ProgressHeader from "../components/progress/ProgressHeader";
import LevelCard from "../components/progress/LevelCard";
import XPCard from "../components/progress/XPCard";
import StreakCard from "../components/progress/StreakCard";
import WeeklyActivity from "../components/progress/WeeklyActivity";
import MonthlyHeatmap from "../components/progress/MonthlyHeatmap";
import StatsCard from "../components/progress/StatsCard";
import RewardsCard from "../components/progress/RewardsCard";
import AchievementsCard from "../components/progress/AchievementsCard";
import AIInsightsCard from "../components/progress/AIInsightsCard";
import ProgressSkeleton from "../components/progress/ProgressSkeleton";

export default function Progress() {
  const {
    user,
    weekly,
    monthly,
    stats,
    loading,
    error,
    fetchProgress,
  } = useProgressStore();

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return <ProgressSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-base-700 bg-base-900 p-6 text-center">
        <h2 className="text-lg font-semibold text-ink-50">
          Unable to load progress
        </h2>

        <p className="mt-2 text-ink-400">
          {error}
        </p>

        <button
          onClick={fetchProgress}
          className="mt-4 rounded-xl border border-base-700 bg-base-800 px-4 py-2 text-sm font-medium text-ink-50 transition hover:bg-base-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProgressHeader />

      <div className="grid gap-4 lg:grid-cols-3">
        <LevelCard user={user} />
        <XPCard user={user} />
        <StreakCard user={user} />
      </div>

      <WeeklyActivity weekly={weekly} />

      <MonthlyHeatmap monthly={monthly} />

      <div className="grid gap-4 xl:grid-cols-2">
        <StatsCard stats={stats} />
        <RewardsCard user={user} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AchievementsCard
          user={user}
          stats={stats}
        />

        <AIInsightsCard
          user={user}
          stats={stats}
        />
      </div>
    </div>
  );
}