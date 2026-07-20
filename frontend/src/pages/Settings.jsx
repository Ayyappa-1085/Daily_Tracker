import { useNavigate } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";
import { useAuthStore } from "../store/useAuthStore";

const Settings = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-8 text-slate-900 dark:bg-[#050505] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage your account information.
          </p>
        </header>

        <ProfileCard user={user} onLogout={handleLogout} />
      </div>
    </main>
  );
};

export default Settings;
