import {
  Code2,
  Laptop2,
  Dumbbell,
  BookOpen,
  Droplet,
  Check,
  Play,
  Clock,
} from "lucide-react";

import ProgressRing from "./ProgressRing";

const TYPE_META = {
  dsa: {
    icon: Code2,
    color: "#4B5563",
  },
  development: {
    icon: Laptop2,
    color: "#4B5563",
  },
  workout: {
    icon: Dumbbell,
    color: "#4B5563",
  },
  reading: {
    icon: BookOpen,
    color: "#4B5563",
  },
  water: {
    icon: Droplet,
    color: "#4B5563",
  },
};

function statusMeta(mission) {
  if (mission.completed)
    return {
      Icon: Check,
      bg: "bg-gray-800",
    };

  if (mission.progress > 0)
    return {
      Icon: Play,
      bg: "bg-gray-600",
    };

  return {
    Icon: Clock,
    bg: "bg-gray-300",
  };
}

export default function MissionTile({ mission, onToggle, busy }) {
  const meta = TYPE_META[mission.type] || TYPE_META.dsa;

  const Icon = meta.icon;

  const status = statusMeta(mission);

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onToggle(mission._id)}
      className="focus-ring group flex h-[125px] flex-col rounded-xl border border-base-700 bg-base-800/60 px-3 py-2 transition hover:border-base-600 hover:bg-base-800"
    >
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-50">
          {mission.type}
        </span>

        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full ${status.bg}`}
        >
          <status.Icon size={10} className="text-white" />
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center py-1">
        <ProgressRing
          progress={mission.progress}
          size={56}
          strokeWidth={4}
          color={meta.color}
        >
          <Icon size={20} strokeWidth={2.2} color={meta.color} />
        </ProgressRing>
      </div>

      <p className="truncate text-center text-sm font-semibold text-ink-50">
        {mission.title}
      </p>

      <div className="mt-1 flex items-center justify-between text-[10px]">
        <span className="text-ink-400">{mission.progress}%</span>

        <span className="font-medium text-gray-700 dark:text-gray-300">
          +{mission.xpReward ?? 20} XP
        </span>
      </div>
    </button>
  );
}
