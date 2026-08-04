import { Suspense, lazy, useEffect, useState, useMemo } from "react";

import { useProgressStore } from "../store/useProgressStore";

import ProgressHeader from "../components/progress/ProgressHeader";
import LevelCard from "../components/progress/LevelCard";
import XPCard from "../components/progress/XPCard";
import StreakCard from "../components/progress/StreakCard";
import ConsistencySection from "../components/progress/ConsistencySection";
import StatsCard from "../components/progress/StatsCard";
import ProgressSkeleton from "../components/progress/ProgressSkeleton";

const MilestonesSection = lazy(() =>
  import("../components/progress/MilestonesSection")
);

const AIInsightsCard = lazy(() =>
  import("../components/progress/AIInsightsCard")
);

function SectionFallback() {
  return (
    <div className="rounded-2xl border border-base-700/70 bg-base-900/30 p-4 sm:p-5">
      <div className="h-4 w-32 rounded bg-base-700" />
      <div className="mt-2 h-3 w-56 rounded bg-base-800" />
      <div className="mt-5 h-36 rounded-2xl bg-base-800/60" />
    </div>
  );
}

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

  const [view, setView] = useState("weekly");

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const summaryCards = useMemo(() => (
    [
      <LevelCard key="level" user={user} />,
      <XPCard key="xp" user={user} />,
      <StreakCard key="streak" user={user} />,
    ]
  ), [user]);

  if (loading) {
    return <ProgressSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-base-700 bg-base-900 p-4 text-center sm:p-6">
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
    <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <ProgressHeader />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            How I&apos;ve been doing
          </h2>

          <p className="mt-1 text-[10px] text-ink-400">
            Your consistency and performance over time.
          </p>
        </div>

        <ConsistencySection
          view={view}
          setView={setView}
          weekly={weekly}
          monthly={monthly}
        />

        <StatsCard stats={stats} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-50">
            What&apos;s next
          </h2>

          <p className="mt-1 text-[10px] text-ink-400">
            Milestones to unlock and where to focus next.
          </p>
        </div>

        <Suspense fallback={<SectionFallback />}>
          <MilestonesSection user={user} stats={stats} />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <AIInsightsCard user={user} stats={stats} />
        </Suspense>
      </section>
    </div>
  );
}