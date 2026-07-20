import { Quote } from "lucide-react";

export default function QuoteFooter({ quote }) {
  return (
    <section className="card flex items-start gap-3 px-6 py-5">
      <Quote size={18} className="mt-1 shrink-0 text-ink-400" />

      <p className="text-sm italic leading-6 text-ink-200">{quote}</p>
    </section>
  );
}
