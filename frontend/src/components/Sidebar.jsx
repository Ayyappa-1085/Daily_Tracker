import { useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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

function isNavItemActive(pathname, item) {
  if (item.to === "/") {
    return pathname === "/";
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

export default function Sidebar({ theme, isOpen, onClose, onToggleTheme }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({
    transform: "translateY(0px)",
    width: "0px",
    height: "0px",
    opacity: 0,
  });

  const level = user?.level ?? 1;
  const xpIntoLevel = user?.xpIntoLevel ?? 0;
  const xpForNextLevel = user?.xpForNextLevel ?? 800;
  const xpPct = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));
  const activeIndex = NAV_ITEMS.findIndex((item) => isNavItemActive(location.pathname, item));

  useLayoutEffect(() => {
    const activeItem = itemRefs.current[activeIndex];
    const container = navRef.current;

    if (!activeItem || !container) {
      return;
    }

    const activeRect = activeItem.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setIndicatorStyle({
      transform: `translateY(${activeRect.top - containerRect.top}px)`,
      width: `${activeRect.width}px`,
      height: `${activeRect.height}px`,
      opacity: 1,
    });
  }, [activeIndex, location.pathname]);

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

        <nav ref={navRef} className="relative mt-8 flex flex-col gap-1.5">
          <div
            className="pointer-events-none absolute left-0 top-0 rounded-xl border border-base-600 bg-base-800/95 shadow-sm transition-[transform,opacity,width,height] duration-300 ease-out"
            style={indicatorStyle}
          />

          {NAV_ITEMS.map(({ to, label, icon: Icon, end }, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={to}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                className="relative"
              >
                <NavLink
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={`focus-ring relative z-10 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "border border-base-600 bg-transparent text-ink-50"
                      : "text-ink-400 hover:bg-base-800/70 hover:text-ink-50"
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  {label}
                </NavLink>
              </div>
            );
          })}
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
