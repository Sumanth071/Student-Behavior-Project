import { Download, FileText, Presentation } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "../api/apiClient.js";
import AttendanceTrendChart from "../components/charts/AttendanceTrendChart.jsx";
import PerformanceBarChart from "../components/charts/PerformanceBarChart.jsx";
import RiskDistributionChart from "../components/charts/RiskDistributionChart.jsx";
import FormField from "../components/common/FormField.jsx";
import Panel from "../components/common/Panel.jsx";
import RoleNotice from "../components/common/RoleNotice.jsx";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { formatDate, formatPercent } from "../utils/format.js";
import { exportStudentReportToPDF } from "../utils/pdf.js";

const ReportsPage = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentReport, setStudentReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBaseData = async () => {
      setLoading(true);
      setError("");

      try {
        const [analyticsData, studentsData] = await Promise.all([
          apiClient.get("/reports/analytics", { token }),
          apiClient.get("/students", { token }),
        ]);

        setAnalytics(analyticsData);
        setStudents(studentsData);
        setSelectedStudentId((current) => current || studentsData[0]?._id || "");
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    };

    loadBaseData();
  }, [token]);

  useEffect(() => {
    const loadStudentReport = async () => {
      if (!selectedStudentId) {
        return;
      }

      try {
        const report = await apiClient.get(`/reports/students/${selectedStudentId}`, { token });
        setStudentReport(report);
      } catch (loadError) {
        setError(loadError.message);
      }
    };

    loadStudentReport();
  }, [selectedStudentId, token]);

  if (loading) {
    return (
      <div className="card-surface p-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-300">
        Loading analytics and report data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoleNotice subject="reports and analytics" />

      {error ? (
        <div className="card-surface border border-rose-200 px-5 py-4 text-sm font-semibold text-rose-500 dark:border-rose-500/20 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Students in Reports"
          value={analytics?.overview?.totalStudents || 0}
          helper="Number of student profiles represented in analytics."
          icon={<Presentation size={22} />}
        />
        <StatCard
          label="Average Behaviour Score"
          value={analytics?.overview?.averageBehaviourScore || 0}
          helper="Composite score benchmark for the selected analytics scope."
          icon={<FileText size={22} />}
          accent="bg-gradient-to-r from-brand-400 via-cyan-500 to-sky-500"
        />
        <StatCard
          label="High Risk Count"
          value={analytics?.overview?.highRiskCount || 0}
          helper="Students needing focused intervention planning."
          icon={<Download size={22} />}
          accent="bg-gradient-to-r from-rose-400 via-red-500 to-orange-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Attendance Analytics"
          description="Trend analysis ready to present during the demo."
        >
          <AttendanceTrendChart data={analytics?.attendanceTrend || []} />
        </Panel>
        <Panel
          title="Risk Distribution"
          description="Distribution of risk bands across the current academic view."
        >
          <RiskDistributionChart data={analytics?.riskDistribution || []} />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel
          title="Department Performance"
          description="Compare departments by average behaviour score."
        >
          <PerformanceBarChart
            data={analytics?.departmentPerformance || []}
            xKey="department"
            barKey="averageBehaviourScore"
            color="#06b6d4"
          />
        </Panel>
        <Panel
          title="Subject Performance"
          description="Average marks by subject for presentation and viva discussion."
        >
          <PerformanceBarChart
            data={analytics?.subjectPerformance || []}
            xKey="subject"
            barKey="averageMarks"
            color="#8b5cf6"
          />
        </Panel>
      </div>

      <Panel
        title="Export Student Report to PDF"
        description="One of the most useful extra features for scoring well in demos and project evaluations."
        action={
          <button
            type="button"
            onClick={() => exportStudentReportToPDF(studentReport)}
            disabled={!studentReport}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Download size={16} />
            Export PDF
          </button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <FormField
              label="Select Student"
              as="select"
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              options={students.map((student) => ({
                label: `${student.fullName} (${student.admissionNo})`,
                value: student._id,
              }))}
            />

            {studentReport?.student ? (
              <div className="rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-brand-800 p-5 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold">{studentReport.student.fullName}</h3>
                    <p className="mt-1 text-sm text-white/75">
                      {studentReport.student.department} • Sem {studentReport.student.semester} • Sec{" "}
                      {studentReport.student.section}
                    </p>
                  </div>
                  <StatusBadge value={studentReport.student.riskLevel} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/65">Score</p>
                    <p className="mt-2 text-3xl font-bold">{studentReport.student.behaviourScore}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/65">Attendance</p>
                    <p className="mt-2 text-3xl font-bold">
                      {formatPercent(studentReport.student.attendanceRate)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {(studentReport.student.suggestions || []).map((suggestion) => (
                    <div
                      key={suggestion}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Average Marks
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {formatPercent(studentReport?.student?.averageMark)}
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/40">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Assignment Rate
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {formatPercent(studentReport?.student?.assignmentRate)}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/40">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Latest Insight</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {studentReport?.student?.latestObservation || "No observation available."}
              </p>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-950/40">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Recent Attendance</p>
              <div className="mt-3 space-y-2">
                {(studentReport?.records?.attendance || []).slice(0, 4).map((entry) => (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-700"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {entry.subject}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(entry.date)}
                      </p>
                    </div>
                    <StatusBadge value={entry.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
};

export default ReportsPage;
