import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function Header() {
  const user = useAuthStore((s) => s.user);

  const firstName = (user?.name || "there").split(" ")[0];
  const initial = (user?.name || "A").charAt(0).toUpperCase();
  const streak = user?.streak || 0;

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const getGreeting = () => {
    const hours = time.getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="pt-2 sm:pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-50 sm:text-3xl">
              {getGreeting()}, {firstName}.
            </h1>

            <p className="mt-1 text-xs text-ink-400 sm:text-sm">
              Focus on progress, not perfection.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-3 sm:gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 rounded-full border border-base-700 bg-base-850/40 px-3 py-1.5 text-xs font-semibold text-ink-200 select-none">
              <span>🔥</span>
              <span>{streak}d</span>
            </div>

            <span className="text-[10px] font-medium uppercase tracking-wide text-ink-500 sm:text-[11px]">
              {formattedTime}
            </span>
          </div>

          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User Profile"}
              className="h-9 w-9 rounded-full border border-base-700 object-cover sm:h-10 sm:w-10"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-base-700 bg-base-800 text-sm font-semibold text-ink-200 select-none sm:h-10 sm:w-10">
              {initial}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
