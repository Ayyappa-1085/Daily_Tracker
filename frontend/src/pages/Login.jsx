import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const [email, setEmail] = useState("dude@ascend.app");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const res = await login(email, password);
    if (res.ok) navigate("/");
    else setFormError(res.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-gold to-accent-amber text-base-950">
            <ChevronUp size={20} strokeWidth={3} />
          </span>
          <span className="font-display text-xl font-bold">Ascend</span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink-50">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-ink-400">
          Discipline over motivation. Let's pick up where you left off.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-ink-300">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring rounded-lg border border-base-700 bg-base-800 px-3 py-2.5 text-ink-50"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-ink-300">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring rounded-lg border border-base-700 bg-base-800 px-3 py-2.5 text-ink-50"
            />
          </label>

          {formError && <p className="text-sm text-accent-red">{formError}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="focus-ring mt-2 rounded-lg bg-accent-gold py-2.5 text-sm font-semibold text-base-950 transition hover:brightness-105 disabled:opacity-60"
          >
            {status === "loading" ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-500">
          Demo account is pre-filled — run{" "}
          <code className="text-ink-300">npm run seed</code> in the backend,
          then use password <code className="text-ink-300">password123</code>.
        </p>
        <p className="mt-3 text-center text-sm text-ink-400">
          New here?{" "}
          <Link to="/register" className="font-medium text-accent-gold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
