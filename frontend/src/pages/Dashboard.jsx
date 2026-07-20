import { useEffect } from "react";
import Header from "../components/Header";
import TodaysMissionCard from "../components/TodaysMissionCard";
import OverallProgressCard from "../components/OverallProgressCard";
import ContinueLearningCard from "../components/ContinueLearningCard";
import QuoteFooter from "../components/QuoteFooter";
import RecentActivityCard from "../components/RecentActivityCard";
import { useDashboardStore } from "../store/useDashboardStore";

export default function Dashboard() {
  const { data, status, error, fetchDashboard, lastLevelUp, clearLevelUp } =
    useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (status === "loading" && !data) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        Loading...
      </div>
    );
  }

  if (status === "error" && !data) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="px-3 lg:px-4 xl:px-5 pb-8">
      <Header />

      {lastLevelUp && (
        <div className="mt-4 rounded-xl border border-base-700 bg-base-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-ink-50">Level {lastLevelUp} unlocked</span>

            <button
              onClick={clearLevelUp}
              className="text-ink-400 hover:text-ink-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-5">
        {/* Today's Mission — ring + checklist */}

        <TodaysMissionCard missions={data.missions} />

        {/* Overall Progress + Continue Learning, side by side */}

        <div className="grid gap-5 lg:grid-cols-2">
          <OverallProgressCard progress={data.overallProgress} />

          <ContinueLearningCard question={data.continueLearning} />
        </div>

        {/* Quote */}

        <QuoteFooter quote={data.quote} />

        {/* Recent Activity — derived from missions already in data */}

        <RecentActivityCard missions={data.missions} />
      </div>
    </div>
  );
}
