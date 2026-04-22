import { AlertTriangle, Plus, Shield, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../api/apiClient.js";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import Panel from "../components/common/Panel.jsx";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Table from "../components/common/Table.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { incidentSeverityOptions } from "../utils/constants.js";
import { formatDate } from "../utils/format.js";

const defaultForm = {
  student: "",
  date: new Date().toISOString().slice(0, 10),
  participation: "70",
  discipline: "75",
  assignmentSubmitted: "3",
  assignmentTotal: "5",
  incidentSeverity: "None",
  observation: "",
  counselorNote: "",
};

const BehaviourPage = () => {
  const { token, user } = useAuth();
  const canManage = ["Admin", "Teacher"].includes(user?.role);
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [logId, setLogId] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentsData, behaviourData] = await Promise.all([
        apiClient.get("/students", { token }),
        apiClient.get("/behaviour", { token }),
      ]);

      setStudents(studentsData);
      setLogs(behaviourData);
      setForm((current) => ({
        ...current,
        student: current.student || studentsData[0]?._id || "",
      }));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const riskStudents = useMemo(
    () => students.filter((student) => student.riskLevel === "High").slice(0, 3),
    [students],
  );

  const averageParticipation = useMemo(() => {
    if (!logs.length) {
      return 0;
    }

    return Math.round(
      logs.reduce((sum, log) => sum + Number(log.participation || 0), 0) / logs.length,
    );
  }, [logs]);

  const openCreateModal = () => {
    setMode("create");
    setLogId("");
    setForm({
      ...defaultForm,
      student: students[0]?._id || "",
    });
    setModalOpen(true);
  };

  const openEditModal = (log) => {
    setMode("edit");
    setLogId(log._id);
    setForm({
      student: log.student?._id || "",
      date: new Date(log.date).toISOString().slice(0, 10),
      participation: String(log.participation),
      discipline: String(log.discipline),
      assignmentSubmitted: String(log.assignmentSubmitted),
      assignmentTotal: String(log.assignmentTotal),
      incidentSeverity: log.incidentSeverity,
      observation: log.observation || "",
      counselorNote: log.counselorNote || "",
    });
    setModalOpen(true);
  };

  const saveLog = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (mode === "create") {
        await apiClient.post("/behaviour", form, { token });
      } else {
        await apiClient.put(`/behaviour/${logId}`, form, { token });
      }

      setModalOpen(false);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id) => {
    if (!window.confirm("Delete this behaviour log?")) {
      return;
    }

    try {
      await apiClient.delete(`/behaviour/${id}`, { token });
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (log) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{log.student?.fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {log.student?.department}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (log) => formatDate(log.date),
    },
    { key: "participation", header: "Participation" },
    { key: "discipline", header: "Discipline" },
    {
      key: "assignmentRate",
      header: "Assignment Rate",
      render: (log) => `${Math.round((log.assignmentSubmitted / log.assignmentTotal) * 100)}%`,
    },
    {
      key: "incidentSeverity",
      header: "Incident",
      render: (log) => <StatusBadge value={log.incidentSeverity === "None" ? "Low" : log.incidentSeverity} label={log.incidentSeverity} />,
    },
    {
      key: "observation",
      header: "Observation",
      render: (log) => (
        <p className="max-w-xs text-sm text-slate-600 dark:text-slate-300">{log.observation}</p>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (log) =>
        canManage ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEditModal(log)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteLog(log._id)}
              className="rounded-xl border border-rose-200 p-2 text-rose-500 transition hover:bg-rose-50 dark:border-rose-500/20 dark:hover:bg-rose-500/10"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          "--"
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Behaviour Logs"
          value={logs.length}
          helper="Recorded classroom behaviour observations and checkpoints."
          icon={<Shield size={22} />}
        />
        <StatCard
          label="Average Participation"
          value={`${averageParticipation}%`}
          helper="Overall class participation average from behaviour logs."
          icon={<Plus size={22} />}
          accent="bg-gradient-to-r from-brand-400 via-cyan-500 to-sky-500"
        />
        <StatCard
          label="High Risk Highlights"
          value={riskStudents.length}
          helper="Students currently in the most critical risk zone."
          icon={<AlertTriangle size={22} />}
          accent="bg-gradient-to-r from-rose-400 via-red-500 to-orange-500"
        />
      </div>

      <Panel
        title="High Risk Student Highlights"
        description="This section adds strong presentation value by focusing on intervention-ready cases."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {riskStudents.length ? (
            riskStudents.map((student) => (
              <article
                key={student._id}
                className="rounded-[28px] border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 dark:border-rose-500/20 dark:from-rose-500/10 dark:to-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {student.fullName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {student.department}
                    </p>
                  </div>
                  <StatusBadge value={student.riskLevel} />
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                  {student.latestObservation}
                </p>
                <div className="mt-4 space-y-2">
                  {(student.suggestions || []).slice(0, 2).map((suggestion) => (
                    <div
                      key={suggestion}
                      className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No high-risk students found in the current data set.
            </p>
          )}
        </div>
      </Panel>

      <Panel
        title="Behaviour Tracking Records"
        description={loading ? "Refreshing behaviour logs..." : "Track participation, discipline, and assignments with clean CRUD flows."}
        action={
          canManage ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Plus size={16} />
              Add Log
            </button>
          ) : null
        }
      >
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        ) : null}
        <Table columns={columns} data={logs} emptyMessage="No behaviour logs found." />
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === "create" ? "Add Behaviour Log" : "Edit Behaviour Log"}
        description="Behaviour scores are calculated from these observation entries plus marks and attendance."
      >
        <form className="space-y-5" onSubmit={saveLog}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Student"
              as="select"
              value={form.student}
              onChange={(event) =>
                setForm((current) => ({ ...current, student: event.target.value }))
              }
              options={students.map((student) => ({
                label: student.fullName,
                value: student._id,
              }))}
            />
            <FormField
              label="Date"
              type="date"
              value={form.date}
              onChange={(event) =>
                setForm((current) => ({ ...current, date: event.target.value }))
              }
            />
            <FormField
              label="Participation"
              type="number"
              value={form.participation}
              onChange={(event) =>
                setForm((current) => ({ ...current, participation: event.target.value }))
              }
            />
            <FormField
              label="Discipline"
              type="number"
              value={form.discipline}
              onChange={(event) =>
                setForm((current) => ({ ...current, discipline: event.target.value }))
              }
            />
            <FormField
              label="Assignments Submitted"
              type="number"
              value={form.assignmentSubmitted}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  assignmentSubmitted: event.target.value,
                }))
              }
            />
            <FormField
              label="Assignment Total"
              type="number"
              value={form.assignmentTotal}
              onChange={(event) =>
                setForm((current) => ({ ...current, assignmentTotal: event.target.value }))
              }
            />
            <FormField
              label="Incident Severity"
              as="select"
              value={form.incidentSeverity}
              onChange={(event) =>
                setForm((current) => ({ ...current, incidentSeverity: event.target.value }))
              }
              options={incidentSeverityOptions}
            />
          </div>
          <FormField
            label="Observation"
            as="textarea"
            value={form.observation}
            onChange={(event) =>
              setForm((current) => ({ ...current, observation: event.target.value }))
            }
          />
          <FormField
            label="Counselor Note"
            as="textarea"
            value={form.counselorNote}
            onChange={(event) =>
              setForm((current) => ({ ...current, counselorNote: event.target.value }))
            }
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {saving ? "Saving..." : mode === "create" ? "Create Log" : "Update Log"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BehaviourPage;
