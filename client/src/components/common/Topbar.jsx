import { Bell, LogOut, Menu, MoonStar, SunMedium } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useTheme } from "../../hooks/useTheme.js";

const pageTitles = {
  "/": {
    title: "AI Behaviour Dashboard",
    description: "Monitor behaviour score, risk trends, and academic health in one place.",
  },
  "/students": {
    title: "Student Management",
    description: "Manage student profiles, sections, and behaviour insights.",
  },
  "/attendance": {
    title: "Attendance Management",
    description: "Track attendance patterns that influence behavioural risk.",
  },
  "/marks": {
    title: "Marks Management",
    description: "Record academic performance and compare subject-level progress.",
  },
  "/behaviour": {
    title: "Behaviour Tracking",
    description: "Review participation, discipline, and assignment behaviour logs.",
  },
  "/reports": {
    title: "Reports and Analytics",
    description: "Export professional student reports and presentation-ready analytics.",
  },
  "/notifications": {
    title: "Notifications and Alerts",
    description: "Surface urgent student updates and targeted dashboard alerts.",
  },
};

const Topbar = ({ onMenuClick, notificationCount }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const currentPage = pageTitles[pathname] || pageTitles["/"];

  return (
    <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/80 px-5 py-4 shadow-soft backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-300">
            AI-Based Student Behaviour Analysis and Performance Monitoring System
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white">
            {currentPage.title}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {currentPage.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end md:self-auto">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} />}
        </button>
        <div className="relative rounded-2xl border border-slate-200 p-3 text-slate-600 dark:border-slate-700 dark:text-slate-200">
          <Bell size={18} />
          {notificationCount ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              {notificationCount}
            </span>
          ) : null}
        </div>
        <div className="hidden rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/60 md:block">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-2xl border border-slate-200 p-3 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
