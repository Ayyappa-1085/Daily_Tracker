import { CircleUserRound } from "lucide-react";

const ProfileRow = ({ label, value, isEmail = false }) => {
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>

      {isEmail ? (
        <a
          href={`mailto:${value}`}
          className="mt-2 inline-block break-all text-sm font-medium text-slate-900 transition-colors hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
        >
          {value}
        </a>
      ) : (
        <p className="mt-2 break-words text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-[15px]">
          {value}
        </p>
      )}
    </div>
  );
};

const ProfileCard = ({ user, onLogout }) => {
  return (
    <section className="mx-auto w-full max-w-[500px] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-[#0a0a0b] dark:shadow-none">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200">
          <CircleUserRound className="h-12 w-12 stroke-[1.75]" />
        </div>

        <h2 className="mt-6 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Your Profile
        </h2>
      </div>

      <div className="mt-8 divide-y divide-slate-200 dark:divide-white/5">
        <ProfileRow label="Full Name" value={user?.name || "Not available"} />
        <ProfileRow
          label="Email Address"
          value={user?.email || "Not available"}
          isEmail
        />
      </div>
      <div className="mt-8 border-t border-slate-200 pt-6 dark:border-white/5">
        <button
          onClick={onLogout}
          className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Logout
        </button>
      </div>
    </section>
  );
};

export default ProfileCard;
