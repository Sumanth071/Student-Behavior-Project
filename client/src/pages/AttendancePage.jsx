import { CheckCheck, Clock3, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../api/apiClient.js";
import PerformanceBarChart from "../components/charts/PerformanceBarChart.jsx";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import Panel from "../components/common/Panel.jsx";
import RoleNotice from "../components/common/RoleNotice.jsx";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Table from "../components/common/Table.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { attendanceStatusOptions } from "../utils/constants.js";
import { buildQueryString, formatDate } from "../utils/format.js";

const defaultForm = {
  student: "",
  date: new Date().toISOString().slice(0, 10),
  subject: "",
  status: "Present",
};

const AttendancePage = () => {
  const { token, user } = useAuth();
  const canManage = ["Admin", "Teacher"].includes(user?.role);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentsData, attendanceData] = await Promise.all([
        apiClient.get("/students", { token }),
        apiClient.get(
          `/attendance${buildQueryString({
            studentId: canManage ? selectedStudentId : "",
          })}`,
          { token },
        ),
      ]);

      setStudents(studentsData);
      setRecords(attendanceData);
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
  }, [token, selectedStudentId]);

  const statusBreakdown = useMemo(
    () =>
      attendanceStatusOptions.map((status) => ({
        status,
        total: records.filter((record) => record.status === status).length,
      })),
    [records],
  );

  const openCreateModal = () => {
    setMode("create");
    setRecordId("");
    setForm({
      ...defaultForm,
      student: students[0]?._id || "",
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setMode("edit");
    setRecordId(record._id);
    setForm({
      student: record.student?._id || "",
      date: new Date(record.date).toISOString().slice(0, 10),
      subject: record.subject,
      status: record.status,
    });
    setModalOpen(true);
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (mode === "create") {
        await apiClient.post("/attendance", form, { token });
      } else {
        await apiClient.put(`/attendance/${recordId}`, form, { token });
      }

      setModalOpen(false);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!window.confirm("Delete this attendance record?")) {
      return;
    }

    try {
      await apiClient.delete(`/attendance/${id}`, { token });
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (record) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">
            {record.student?.fullName}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {record.student?.admissionNo}
          </p>
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (record) => record.subject,
    },
    {
      key: "date",
      header: "Date",
      render: (record) => formatDate(record.date),
    },
    {
      key: "status",
      header: "Status",
      render: (record) => <StatusBadge value={record.status} />,
    },
    {
      key: "recordedBy",
      header: "Recorded By",
      render: (record) => record.recordedBy?.name || "--",
    },
    {
      key: "actions",
      header: "Actions",
      render: (record) =>
        canManage ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEditModal(record)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteRecord(record._id)}
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
      <RoleNotice subject="attendance records" />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Attendance Entries"
          value={records.length}
          helper="All visible attendance records for the current user scope."
          icon={<CheckCheck size={22} />}
        />
        <StatCard
          label="Present Records"
          value={statusBreakdown.find((item) => item.status === "Present")?.total || 0}
          helper="Count of fully present attendance marks."
          icon={<Plus size={22} />}
          accent="bg-gradient-to-r from-emerald-400 via-teal-500 to-brand-500"
        />
        <StatCard
          label="Late Records"
          value={statusBreakdown.find((item) => item.status === "Late")?.total || 0}
          helper="Late arrivals that influence behaviour scoring."
          icon={<Clock3 size={22} />}
          accent="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title="Attendance Overview"
          description="A quick distribution of attendance status values."
        >
          <PerformanceBarChart data={statusBreakdown} xKey="status" barKey="total" color="#22c55e" />
        </Panel>

        <Panel
          title="Attendance Records"
          description={loading ? "Refreshing attendance records..." : "Capture and maintain attendance with full CRUD support."}
          action={
            canManage ? (
              <div className="flex gap-3">
                <div className="min-w-[220px]">
                  <FormField
                    label="Filter by Student"
                    as="select"
                    value={selectedStudentId}
                    onChange={(event) => setSelectedStudentId(event.target.value)}
                    options={[
                      { label: "All Students", value: "" },
                      ...students.map((student) => ({
                        label: student.fullName,
                        value: student._id,
                      })),
                    ]}
                  />
                </div>
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-7 inline-flex h-fit items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  <Plus size={16} />
                  Add Record
                </button>
              </div>
            ) : null
          }
        >
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : null}
          <Table columns={columns} data={records} emptyMessage="No attendance records found." />
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === "create" ? "Add Attendance Record" : "Edit Attendance Record"}
        description="Attendance is one of the most important behaviour score inputs."
      >
        <form className="space-y-5" onSubmit={saveRecord}>
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
              label="Subject"
              value={form.subject}
              onChange={(event) =>
                setForm((current) => ({ ...current, subject: event.target.value }))
              }
            />
            <FormField
              label="Status"
              as="select"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value }))
              }
              options={attendanceStatusOptions}
            />
          </div>
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
              {saving ? "Saving..." : mode === "create" ? "Create Record" : "Update Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
