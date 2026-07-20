import { useState } from "react";
import ProgressChart from "../components/ProgressChart";

export default function Progress() {
  const [view, setView] = useState("weekly");

  const weeklyData = [45, 80, 65, 95, 55, 100, 75];
  const weeklyLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const monthlyData = [120, 180, 210, 250];
  const monthlyLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const data = view === "weekly" ? weeklyData : monthlyData;
  const labels = view === "weekly" ? weeklyLabels : monthlyLabels;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink-50">Progress</h1>
          <p className="text-sm text-ink-400">
            Track your long-term growth and consistency.
          </p>
        </div>

        <div className="flex rounded-xl border border-base-700 bg-base-900 p-1">
          <button
            onClick={() => setView("weekly")}
            className={`rounded-lg px-4 py-2 ${
              view === "weekly"
                ? "bg-base-700 text-ink-50"
                : "text-ink-400"
            }`}
          >
            Weekly
          </button>

          <button
            onClick={() => setView("monthly")}
            className={`rounded-lg px-4 py-2 ${
              view === "monthly"
                ? "bg-base-700 text-ink-50"
                : "text-ink-400"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-base-700 bg-base-900 p-5">
          <p className="text-sm text-ink-400">Level</p>
          <h2 className="mt-3 text-3xl font-bold text-ink-50">8</h2>
        </div>

        <div className="rounded-2xl border border-base-700 bg-base-900 p-5">
          <p className="text-sm text-ink-400">Total XP</p>
          <h2 className="mt-3 text-3xl font-bold text-ink-50">3420</h2>
        </div>

        <div className="rounded-2xl border border-base-700 bg-base-900 p-5">
          <p className="text-sm text-ink-400">Current Streak</p>
          <h2 className="mt-3 text-3xl font-bold text-ink-50">18 Days 🔥</h2>
        </div>
      </div>

      <ProgressChart
        title={view === "weekly" ? "Weekly Progress" : "Monthly Progress"}
        data={data}
        labels={labels}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-base-700 bg-base-900 p-6">
          <h2 className="mb-5 text-lg font-semibold text-ink-50">
            Rewards
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>🏅 First Login</span>
              <span>Unlocked</span>
            </div>

            <div className="flex justify-between">
              <span>🥈 7 Day Streak</span>
              <span>Unlocked</span>
            </div>

            <div className="flex justify-between">
              <span>🔒 30 Day Streak</span>
              <span>Locked</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-base-700 bg-base-900 p-6">
          <h2 className="mb-5 text-lg font-semibold text-ink-50">
            Insights
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Best Day</span>
              <span>Monday</span>
            </div>

            <div className="flex justify-between">
              <span>Most Productive Week</span>
              <span>Week 3</span>
            </div>

            <div className="flex justify-between">
              <span>Average XP / Day</span>
              <span>126 XP</span>
            </div>

            <div className="flex justify-between">
              <span>Completion Rate</span>
              <span>91%</span>
            </div>

            <div className="flex justify-between">
              <span>Current Rank</span>
              <span>Top 18%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}