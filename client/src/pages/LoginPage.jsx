import { ArrowRight, MoonStar, ShieldCheck, SunMedium } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useTheme } from "../hooks/useTheme.js";
import { demoAccounts } from "../utils/constants.js";

const featureHighlights = [
  "Role-based access for Admin, Teacher, Student, and Parent",
  "AI-inspired behaviour score using attendance, marks, and discipline signals",
  "Analytics dashboard with charts, alerts, PDF reports, and dark mode",
];

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    email: demoAccounts[0].email,
    password: demoAccounts[0].password,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate("/");
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const applyDemoAccount = (account) => {
    setForm({
      email: account.email,
      password: account.password,
    });
    setError("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6 lg:flex-row">
        <section className="card-surface subtle-grid flex flex-1 flex-col justify-between overflow-hidden p-8 lg:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex rounded-3xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-white dark:bg-white dark:text-slate-900">
                Final Year Demo
              </div>
              <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-tight text-slate-900 dark:text-white md:text-5xl">
                AI-Based Student Behaviour Analysis and Performance Monitoring System
              </h1>
              <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
                A modern MERN dashboard for colleges to monitor attendance, marks,
                behaviour patterns, risks, and student improvement insights.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featureHighlights.map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/80 bg-white/70 p-5 shadow-lg shadow-slate-200/50 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-300">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-200">
                    {item}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[30px] bg-gradient-to-br from-slate-900 via-slate-800 to-brand-800 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
              Demo Accounts
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.label}
                  type="button"
                  onClick={() => applyDemoAccount(account)}
                  className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-bold">{account.label}</p>
                    <ArrowRight size={16} />
                  </div>
                  <p className="mt-2 text-sm text-white/80">{account.email}</p>
                  <p className="mt-3 text-sm text-white/65">{account.note}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card-surface w-full max-w-xl p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-300">
              Secure Access
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">
              Sign in to the dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Use the seeded credentials for your presentation or classroom demo.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Email Address
              </span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="input-shell"
                placeholder="Enter your email"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Password
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                className="input-shell"
                placeholder="Enter your password"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {submitting ? "Signing in..." : "Login to Dashboard"}
              <ArrowRight size={16} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
