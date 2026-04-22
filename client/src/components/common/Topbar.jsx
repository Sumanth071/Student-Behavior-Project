import { Bell, LogOut, Menu, MoonStar, SunMedium } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useTheme } from "../../hooks/useTheme.js";
import { getPageCopyForRole, isManagerRole } from "../../utils/roles.js";

const Topbar = ({ onMenuClick, notificationCount }) => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const currentPage = getPageCopyForRole(pathname, user?.role);

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
            {isManagerRole(user?.role)
              ? "AI-Based Student Behaviour Analysis and Performance Monitoring System"
              : "Role-based student monitoring portal"}
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
