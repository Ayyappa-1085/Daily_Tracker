import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("ascend_theme") || "dark",
  );

  useEffect(() => {
    localStorage.setItem("ascend_theme", theme);

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light-theme", theme === "light");
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-base-950 text-ink-50 transition-colors duration-300">
      <Sidebar
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1600px] px-8 py-8 lg:px-10 xl:px-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
