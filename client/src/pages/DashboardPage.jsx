import {
  BellRing,
  BookOpenCheck,
  BrainCircuit,
  GraduationCap,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient.js";
import AttendanceTrendChart from "../components/charts/AttendanceTrendChart.jsx";
import PerformanceBarChart from "../components/charts/PerformanceBarChart.jsx";
import RiskDistributionChart from "../components/charts/RiskDistributionChart.jsx";
import Panel from "../components/common/Panel.jsx";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { formatPercent } from "../utils/format.js";

const DashboardPage = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await apiClient.get("/dashboard/summary", { token });
        setSummary(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [token]);

  if (loading) {
    return (
      <div className="card-surface p-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-300">
        Loading dashboard intelligence...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-surface border border-rose-200 p-10 text-center text-sm font-semibold text-rose-500 dark:border-rose-500/20 dark:text-rose-300">
        {error}
      </div>
    );
  }

  const metrics = summary?.metrics || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Total Students"
          value={metrics.totalStudents || 0}
          helper="Profiles being monitored across the campus dashboard."
          icon={<Users size={22} />}
        />
        <StatCard
          label="Attendance Today"
          value={formatPercent(metrics.attendanceToday)}
          helper="Latest daily attendance health snapshot."
          icon={<BookOpenCheck size={22} />}
          accent="bg-gradient-to-r from-emerald-400 via-teal-500 to-brand-500"
        />
        <StatCard
          label="Average Marks"
          value={formatPercent(metrics.averageMarks)}
          helper="Average academic score from recorded assessments."
          icon={<GraduationCap size={22} />}
          accent="bg-gradient-to-r from-sky-400 via-brand-500 to-indigo-500"
        />
        <StatCard
          label="Behaviour Score"
          value={metrics.averageBehaviourScore || 0}
          helper="Composite score built from performance and behaviour signals."
          icon={<BrainCircuit size={22} />}
          accent="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-rose-500"
        />
        <StatCard
          label="High Risk Students"
          value={metrics.highRiskStudents || 0}
          helper="Students needing immediate mentoring or intervention."
          icon={<ShieldAlert size={22} />}
          accent="bg-gradient-to-r from-rose-400 via-red-500 to-orange-500"
        />
        <StatCard
          label="Active Alerts"
          value={metrics.activeAlerts || 0}
          helper={`Visible alerts for the current ${summary?.currentRole || "user"} view.`}
          icon={<BellRing size={22} />}
          accent="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Attendance Trend"
          description="Recent attendance consistency across the tracked student group."
        >
          <AttendanceTrendChart data={summary?.attendanceTrend || []} />
        </Panel>

        <Panel
          title="Risk Distribution"
          description="Current distribution of low, medium, and high-risk students."
        >
          <RiskDistributionChart data={summary?.riskDistribution || []} />
          <div className="mt-4 flex flex-wrap gap-3">
            {(summary?.riskDistribution || []).map((entry) => (
              <div
                key={entry.name}
                className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <StatusBadge value={entry.name} />
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                    {entry.value} students
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Department Performance"
          description="Average behaviour score by department for presentation-ready comparisons."
        >
          <PerformanceBarChart
            data={summary?.departmentPerformance || []}
            xKey="department"
            barKey="averageBehaviourScore"
            color="#14b8a6"
          />
        </Panel>

        <Panel
          title="System Recommendations"
          description="Quick action points generated from the most at-risk student profiles."
        >
          <div className="space-y-3">
            {(summary?.recommendations || []).length ? (
              summary.recommendations.map((recommendation, index) => (
                <div
                  key={`${recommendation}-${index}`}
                  className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300"
                >
                  {recommendation}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No recommendations available right now.
              </p>
            )}
          </div>
        </Panel>
      </div>

      <Panel
        title="Risk Student Highlight Section"
        description="A presentation-friendly area that brings the most critical student cases to the front."
      >
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {(summary?.topConcernStudents || []).map((student) => (
            <article
              key={student._id}
              className="rounded-[28px] border border-rose-200/80 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-lg shadow-rose-100/50 dark:border-rose-500/20 dark:from-rose-500/10 dark:via-slate-900 dark:to-amber-500/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {student.fullName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {student.department} • Sem {student.semester} • Sec {student.section}
                  </p>
                </div>
                <StatusBadge value={student.riskLevel} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/80 p-3 dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Score
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {student.behaviourScore}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-3 dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Attendance
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPercent(student.attendanceRate)}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm font-medium text-slate-600 dark:text-slate-300">
                {student.latestObservation}
              </p>

              <div className="mt-4 space-y-2">
                {(student.suggestions || []).slice(0, 2).map((suggestion) => (
                  <div
                    key={suggestion}
                    className="rounded-2xl border border-white/60 bg-white/75 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel
          title="Top Performing Students"
          description="Students with the strongest combined behaviour and performance indicators."
        >
          <div className="space-y-3">
            {(summary?.spotlightStudents || []).map((student, index) => (
              <div
                key={student._id}
                className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-700 dark:bg-slate-950/40"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    #{index + 1} {student.fullName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {student.department} • {formatPercent(student.averageMark)} avg marks
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge value={student.riskLevel} />
                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    {student.behaviourScore}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Recent Notifications"
          description="Latest alerts and updates being shown inside the system."
        >
          <div className="space-y-4">
            {(summary?.recentNotifications || []).map((notification) => (
              <div
                key={notification._id}
                className="rounded-[24px] border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {notification.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {notification.message}
                    </p>
                  </div>
                  <StatusBadge value={notification.type} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
};

export default DashboardPage;
