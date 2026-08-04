import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
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

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/today":
        return "Today";
      case "/learning":
        return "Learning";
      case "/progress":
        return "Progress";
      case "/journal":
        return "Journal";
      case "/settings":
        return "Settings";
      case "/health":
        return "Health";
      default:
        if (location.pathname.startsWith("/learning/")) return "Learning Details";
        return "Ascend";
    }
  };

  const showBackButton = location.pathname !== "/";

  const handleBack = () => {
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-base-950 text-ink-50 transition-colors duration-300">
      <div
        aria-hidden={!isSidebarOpen}
        className={`fixed inset-0 z-40 bg-base-950/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[84vw] max-w-[320px] transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-64 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar
          theme={theme}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onToggleTheme={() =>
            setTheme((t) => (t === "dark" ? "light" : "dark"))
          }
        />
      </div>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-base-700/70 bg-base-950/95 px-3 pb-3 pt-[max(0.65rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-ink-50 transition hover:bg-base-800"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            {showBackButton ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-base-700 bg-base-900 text-ink-50 transition hover:bg-base-800"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            ) : null}
          </div>

          <h2 className="flex-1 truncate text-center text-[15px] font-semibold tracking-tight text-ink-50">
            {getPageTitle()}
          </h2>

          <div className="h-10 w-10 shrink-0" aria-hidden="true" />
        </div>
      </header>

      <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
        <div className="mx-auto w-full max-w-[1600px] px-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-20 sm:px-4 sm:py-6 sm:pt-24 lg:px-6 lg:pt-0 xl:px-8">
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