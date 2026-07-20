import ProgressRing from "./ProgressRing";
import Sparkline from "./Sparkline";
import { TrendingUp } from "lucide-react";

export default function OverallProgressCard({ progress = 0, trend = [] }) {
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            Overall
          </p>

          <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink-50">
            Progress Overview
          </h2>
        </div>

        <div className="rounded-full border border-base-700 bg-base-800 px-3 py-1 text-sm font-medium text-ink-200">
          {progress}% Complete
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
        <div className="flex items-center justify-center shrink-0">
          <ProgressRing
            progress={progress}
            size={120}
            strokeWidth={10}
            color="rgb(var(--ink-400))"
          >
            <div className="text-center">
              <p className="font-display text-3xl font-semibold text-ink-50">
                {progress}%
              </p>

              <p className="text-xs text-ink-500">Complete</p>
            </div>
          </ProgressRing>
        </div>

        <div className="w-full rounded-xl border border-base-700 bg-base-800/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[rgb(var(--ink-400))]" />

              <span className="font-medium text-ink-50">Weekly Progress</span>
            </div>

            <span className="text-sm font-medium text-ink-200">+8%</span>
          </div>

          <Sparkline
            values={trend}
            color="rgb(var(--ink-400))"
            width={420}
            height={60}
          />
        </div>
      </div>
    </section>
  );
}
