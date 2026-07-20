import {
  Sunrise,
  Code2,
  Laptop2,
  Dumbbell,
  ClipboardList,
  Clock,
  Check,
  CalendarClock,
} from "lucide-react";

const ICONS = {
  sunrise: Sunrise,
  code: Code2,
  laptop: Laptop2,
  dumbbell: Dumbbell,
  journal: ClipboardList,
  clock: Clock,
};

const ICON_COLORS = {
  sunrise: "#8A847C",
  code: "#7E8796",
  laptop: "#8C7A69",
  dumbbell: "#8F9581",
  journal: "#8C7A69",
  clock: "#9C9892",
};

function nodeStyles(status) {
  if (status === "done") {
    return {
      ring: "ring-base-600 text-ink-50",
      badge: "bg-ink-200",
    };
  }

  if (status === "active") {
    return {
      ring: "ring-base-600 text-ink-50",
      badge: "bg-ink-400",
    };
  }

  return {
    ring: "ring-base-600 text-ink-400",
    badge: "bg-base-600",
  };
}

export default function TimelineCard({ events = [], onToggle }) {
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock size={18} color="#8A847C" />

          <h2 className="font-display text-lg font-semibold text-ink-50">
            Today's Timeline
          </h2>
        </div>

        <span className="text-xs text-ink-400">{events.length} Events</span>
      </div>

      {events.length === 0 ? (
        <div className="flex h-28 items-center justify-center">
          <p className="text-sm text-ink-400">No timeline events available.</p>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <div className="mx-auto flex min-w-max items-center justify-center py-2">
            {events.map((event, index) => {
              const Icon = ICONS[event.icon] || Clock;

              const iconColor = ICON_COLORS[event.icon] || "#9C9892";

              const styles = nodeStyles(event.status);

              const last = index === events.length - 1;

              return (
                <div key={event._id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => onToggle(event._id, event.status)}
                    className="focus-ring flex w-24 flex-col items-center transition-all duration-200"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border border-base-700 bg-base-800 ring-2 transition-all duration-200 ${styles.ring}`}
                    >
                      {event.status === "done" ? (
                        <Check size={16} />
                      ) : (
                        <Icon size={16} color={iconColor} />
                      )}
                    </div>

                    <span
                      className={`mt-2 h-2 w-2 rounded-full ${styles.badge}`}
                    />

                    <span className="mt-2 text-xs font-semibold text-ink-50">
                      {event.time}
                    </span>

                    <span className="mt-1 px-1 text-center text-[11px] leading-4 text-ink-400">
                      {event.label}
                    </span>
                  </button>

                  {!last && <div className="mx-2 h-[2px] w-12 bg-base-700" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
