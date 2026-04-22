import {
  BarChart3,
  BellRing,
  BookCheck,
  BrainCircuit,
  GraduationCap,
  LayoutDashboard,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

const navigation = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/attendance", label: "Attendance", icon: BookCheck },
  { to: "/marks", label: "Marks", icon: GraduationCap },
  { to: "/behaviour", label: "Behaviour", icon: BrainCircuit },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: BellRing },
];

const Sidebar = ({ open, onClose, notificationCount }) => {
  const { user } = useAuth();

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm transition lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 transform border-r border-white/30 bg-white/85 p-6 shadow-soft backdrop-blur-xl transition duration-300 dark:border-slate-800/80 dark:bg-slate-950/85 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-start justify-between gap-3">
          <div className="space-y-3">
            <div className="inline-flex rounded-3xl bg-gradient-to-r from-brand-500 to-sky-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white">
              Campus AI
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                Student Monitor
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Behaviour analysis and performance intelligence
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 dark:border-slate-700 dark:text-slate-300 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6 rounded-[26px] bg-gradient-to-br from-brand-500 via-cyan-500 to-sky-600 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
            Active role
          </p>
          <h2 className="mt-2 text-2xl font-bold">{user?.role || "Guest"}</h2>
          <p className="mt-2 text-sm text-white/80">
            Signed in as {user?.name}. Access is tailored for this dashboard view.
          </p>
        </div>

        <nav className="space-y-2">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-950/10 dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {label}
              </span>
              {label === "Notifications" && notificationCount ? (
                <span className="rounded-full bg-rose-500 px-2 py-1 text-[10px] font-bold text-white">
                  {notificationCount}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
