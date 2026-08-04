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
    <main className="min-h-screen w-full overflow-x-hidden bg-[#fafafa] px-3 py-5 text-slate-900 dark:bg-[#050505] dark:text-slate-100 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Settings
          </h1>

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