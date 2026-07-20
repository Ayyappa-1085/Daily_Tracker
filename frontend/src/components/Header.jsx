import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function Header() {
  const user = useAuthStore((s) => s.user);

  const firstName = (user?.name || "there").split(" ")[0];
  const initial = (user?.name || "A").charAt(0).toUpperCase();
  const streak = user?.streak || 0;

  // Real-time tracking hook
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 12-hour format configuration (e.g., "04:56 PM")
  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Dynamic time-based greeting logic
  const getGreeting = () => {
    const hours = time.getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="pt-5">
      <div className="flex flex-row items-center justify-between gap-5">
        {/* Left Side: Greeting */}
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold text-ink-50 tracking-tight">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            Focus on progress, not perfection.
          </p>
        </div>

        {/* Right Side: Quick Stats & Profile */}
        <div className="flex items-center gap-4">
          {/* Vertical Stack: Streak Badge + Time directly below it */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 rounded-full border border-base-700 bg-base-850/40 px-3 py-1.5 text-xs font-semibold text-ink-200 select-none">
              <span>🔥</span>
              <span>{streak}d</span>
            </div>

            <span className="text-[11px] font-medium tracking-wide text-ink-500 select-none uppercase">
              {formattedTime}
            </span>
          </div>

          {/* Clean Profile Avatar */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User Profile"}
              className="h-10 w-10 rounded-full border border-base-700 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-base-700 bg-base-800 text-sm font-semibold text-ink-200 select-none">
              {initial}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
