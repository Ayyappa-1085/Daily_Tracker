import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [theme, setTheme] =useState(
    () => localStorage.getItem("ascend_theme") || "dark"
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("ascend_theme", theme);

    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle(
      "light-theme",
      theme === "light"
    );
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-base-950 text-ink-50 transition-colors duration-300">
      <Sidebar
        theme={theme}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggleTheme={() =>
          setTheme((t) => (t === "dark" ? "light" : "dark"))
        }
      />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <Outlet
            context={{
              openSidebar: () => setIsSidebarOpen(true),
            }}
          />
        </div>
      </main>
    </div>
  );
}