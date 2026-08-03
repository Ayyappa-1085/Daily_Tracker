import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const status = useAuthStore((s) => s.status);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const res = await register(name, email, password);
    if (res.ok) navigate("/");
    else setFormError(res.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 px-4 py-6 sm:py-8">
      <div className="card w-full max-w-sm p-5 sm:p-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent-gold to-accent-amber text-base-950">
            <ChevronUp size={20} strokeWidth={3} />
          </span>

          <span className="font-display text-xl font-bold">Ascend</span>
        </div>

        <h1 className="mt-6 font-display text-xl font-bold text-ink-50 sm:text-2xl">
          Start your streak
        </h1>

        <p className="mt-1 text-sm text-ink-400">
          Day 1 starts the moment you create your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-ink-300">
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus-ring rounded-lg border border-base-700 bg-base-800 px-3 py-2.5 text-sm text-ink-50"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-ink-300">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring rounded-lg border border-base-700 bg-base-800 px-3 py-2.5 text-sm text-ink-50"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm text-ink-300">
            Password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring rounded-lg border border-base-700 bg-base-800 px-3 py-2.5 text-sm text-ink-50"
            />
          </label>

          {formError && <p className="text-sm text-accent-red">{formError}</p>}

          <button
            type="submit"
            disabled={status === "loading"}
            className="focus-ring mt-2 w-full rounded-lg bg-accent-gold py-2.5 text-sm font-semibold text-base-950 transition hover:brightness-105 disabled:opacity-60"
          >
            {status === "loading" ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-accent-gold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}