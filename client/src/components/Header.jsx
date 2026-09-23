import { useEffect, useRef, useState } from "react";
import { CircleUserRound, LogOut, X } from "lucide-react";

function ProfilePopover({ user, onLogout }) {
  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";
  return (
    <div
      className="profile-popover topbar-popover"
      role="dialog"
      aria-label="User profile details"
    >
      <div className="popover-profile-header">
        <div className="popover-avatar" aria-hidden="true">
          {initial}
        </div>
        <div className="popover-user-details">
          <strong className="popover-name" title={user?.name}>
            {user?.name}
          </strong>
          <span className="popover-email" title={user?.email}>
            {user?.email}
          </span>
        </div>
      </div>
      <div className="popover-divider" />
      <button
        type="button"
        className="popover-logout-btn"
        onClick={(event) => {
          event.stopPropagation();
          onLogout();
        }}
      >
        <LogOut size={14} />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default function Header({
  pathname,
  user,
  currentDate,
  onLogout,
  error,
  onClearError,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target))
        setProfileOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  useEffect(() => setProfileOpen(false), [currentDate, pathname]);

  return (
    <>
      <header className="topbar">
        <div className="topbar-brand">FocusDay</div>
        <div className="topbar-right">
          <span className="topbar-date">
            {new Intl.DateTimeFormat("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
            }).format(currentDate)}
          </span>
          <div className="topbar-profile-container" ref={profileRef}>
            <button
              type="button"
              className={`profile-button ${profileOpen ? "active" : ""}`}
              onClick={() => setProfileOpen((current) => !current)}
              aria-expanded={profileOpen}
              aria-label="User profile"
            >
              <CircleUserRound size={20} />
              <span className="topbar-user-name">{user.name}</span>
            </button>
            {profileOpen && <ProfilePopover user={user} onLogout={onLogout} />}
          </div>
        </div>
      </header>
      {error && (
        <div className="toast">
          {error}
          <button onClick={onClearError}>
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}
