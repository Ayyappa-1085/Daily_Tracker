import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressRing from "./ProgressRing";

export default function TodaysMissionCard({ missions = [] }) {
  const total = missions.length;
  const completed = missions.filter((m) => m.completed).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink-50">
          Today's Mission
        </h2>

        <Link
          to="/today"
          className="focus-ring flex items-center gap-1 text-sm text-ink-400 transition hover:text-ink-50"
        >
          View all
          <ChevronRight size={15} />
        </Link>
      </div>

      <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
        <div className="flex items-center gap-5 text-ink-50">
          <ProgressRing
            progress={pct}
            size={100}
            strokeWidth={7}
            color="currentColor"
            trackColor="rgba(140,138,131,0.18)"
          >
            <span className="text-xl font-bold">
              {completed}
              <span className="text-ink-500">/{total}</span>
            </span>
          </ProgressRing>

          <p className="text-sm text-ink-400">Completed</p>
        </div>

        <ul className="flex w-full flex-col gap-3">
          {missions.map((m) => (
            <li key={m._id} className="flex items-center gap-3">
              {m.completed ? (
                <CheckCircle2 size={18} className="shrink-0 text-ink-50" />
              ) : (
                <Circle size={18} className="shrink-0 text-base-600" />
              )}

              <span
                className={
                  m.completed ? "text-sm text-ink-50" : "text-sm text-ink-400"
                }
              >
                {m.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
