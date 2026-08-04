import { NavLink } from "react-router-dom";
import {
  ChevronUp,
  Home,
  CalendarCheck,
  BookOpenText,
  LineChart,
  NotebookPen,
  Settings,
  Moon,
  Sun,
  X,
} from "lucide-react";
import ProgressRing from "./ProgressRing";
import { useAuthStore } from "../store/useAuthStore";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/today", label: "Today", icon: CalendarCheck },
  { to: "/learning", label: "Learning", icon: BookOpenText },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/journal", label: "Journal", icon: NotebookPen },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ theme, isOpen, onClose, onToggleTheme }) {
  const user = useAuthStore((s) => s.user);

  const level = user?.level ?? 1;
  const xpIntoLevel = user?.xpIntoLevel ?? 0;
  const xpForNextLevel = user?.xpForNextLevel ?? 800;
  const xpPct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <aside className="flex h-screen w-full flex-col justify-between border-r border-base-700 bg-base-900/95 px-4 py-6 backdrop-blur-xl">
      <div>
        <div className="flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-base-700 bg-base-800 text-ink-50">
              <ChevronUp size={20} strokeWidth={2.8} />
            </span>

            <span className="font-display text-lg font-semibold tracking-tight text-ink-50">
              Ascend
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-base-700 bg-base-800/70 text-ink-400 transition hover:bg-base-800 hover:text-ink-50 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-1.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-base-600 bg-base-800 text-ink-50"
                    : "text-ink-400 hover:bg-base-800/70 hover:text-ink-50"
                }`
              }
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-3 pb-2 pt-2 sm:pb-0 lg:pb-0">
        <div className="card flex items-center gap-3 p-3">
          <ProgressRing
            progress={xpPct}
            size={44}
            strokeWidth={4}
            color="rgb(var(--ink-400))"
          >
            <img
              src={
                user?.avatar ||
                `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
                  user?.name || "Ascend"
                )}`
              }
              alt={user?.name || "User"}
              className="h-8 w-8 rounded-full object-cover"
            />
          </ProgressRing>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-50">
              {user?.name || "Guest"}
            </p>

            <p className="text-xs font-medium text-ink-200">Level {level}</p>

            <p className="text-[11px] text-ink-500">
              {xpIntoLevel} / {xpForNextLevel} XP
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="focus-ring mt-1 flex items-center gap-3 rounded-xl border border-base-700 px-3 py-2.5 text-sm font-medium text-ink-400 transition-all duration-200 hover:bg-base-800 hover:text-ink-50 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
        >
          {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}

          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>
    </aside>
  );
}
