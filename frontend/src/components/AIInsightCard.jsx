import { Bot, Sparkles, BrainCircuit, ArrowRight, Target } from "lucide-react";

export default function AIInsightCard({ insight }) {
  const headline = insight?.headline || "Daily AI Insight";

  const body =
    insight?.body ||
    "Complete your most valuable mission first. Maintaining consistency today increases your weekly discipline score and overall progress.";

  return (
    <section className="card flex min-h-[280px] flex-col p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-base-700 bg-base-800">
            <Bot size={20} color="#7E8796" />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-ink-50">
              AI Assistant
            </h2>

            <p className="text-sm text-ink-400">Smart recommendations</p>
          </div>
        </div>

        <span className="rounded-full border border-base-700 bg-base-800 px-3 py-1 text-xs font-medium text-ink-200">
          Online
        </span>
      </div>

      <div className="mt-5 flex-1 rounded-2xl border border-base-700 bg-base-800/60 p-5">
        <div className="flex items-start gap-4">
          <BrainCircuit size={20} color="#8A847C" className="mt-1 shrink-0" />

          <div className="min-w-0">
            <h3 className="font-semibold text-ink-50">{headline}</h3>

            <p className="mt-3 line-clamp-4 text-sm leading-7 text-ink-400">
              {body}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-base-700 bg-base-800/60 p-4 transition-all duration-200 hover:bg-base-800">
          <Target size={15} color="#8F9581" />

          <p className="mt-2 text-xs text-ink-500">Priority</p>

          <h4 className="font-semibold text-ink-50">High</h4>
        </div>

        <div className="rounded-xl border border-base-700 bg-base-800/60 p-4 transition-all duration-200 hover:bg-base-800">
          <Sparkles size={15} color="#8C7A69" />

          <p className="mt-2 text-xs text-ink-500">Confidence</p>

          <h4 className="font-semibold text-ink-50">92%</h4>
        </div>
      </div>

      <button
        type="button"
        className="focus-ring mt-5 flex items-center justify-center gap-2 rounded-full border border-base-700 bg-base-800 py-3 font-semibold text-ink-200 transition-all duration-200 hover:bg-base-700 hover:text-ink-50"
      >
        View Full Analysis
        <ArrowRight size={16} />
      </button>
    </section>
  );
}
