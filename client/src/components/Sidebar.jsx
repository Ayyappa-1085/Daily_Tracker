import { BarChart3, Home, Target, Utensils } from "lucide-react";

const navItems = [
  { label: "Today", path: "/today", icon: Home },
  { label: "Habits", path: "/habits", icon: Target },
  { label: "Meals", path: "/meals", icon: Utensils },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
];

export default function Sidebar({ pathname, navigate, onNavigate }) {
  const handleNavigate = (path) => {
    navigate(path);
    onNavigate();
  };

  return (
    <>
      <aside className="sidebar">
        <div className="brand">FocusDay</div>
        <nav>
          {navItems.map(({ label, path, icon: NavIcon }) => (
            <button
              key={label}
              className={pathname === path ? "active" : ""}
              onClick={() => handleNavigate(path)}
            >
              <NavIcon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <nav className="mobile-nav">
        {navItems.map(({ label, path, icon: NavIcon }) => (
          <button
            key={label}
            className={pathname === path ? "active" : ""}
            onClick={() => handleNavigate(path)}
          >
            <NavIcon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
