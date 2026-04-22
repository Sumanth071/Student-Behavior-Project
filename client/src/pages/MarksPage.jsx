import { BookOpenText, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../api/apiClient.js";
import PerformanceBarChart from "../components/charts/PerformanceBarChart.jsx";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import Panel from "../components/common/Panel.jsx";
import RoleNotice from "../components/common/RoleNotice.jsx";
import StatCard from "../components/common/StatCard.jsx";
import Table from "../components/common/Table.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { examTypeOptions } from "../utils/constants.js";

const defaultForm = {
  student: "",
  subject: "",
  examType: "Quiz",
  term: "2026 Semester Review",
  marksObtained: "",
  totalMarks: "100",
};

const MarksPage = () => {
  const { token, user } = useAuth();
  const canManage = ["Admin", "Teacher"].includes(user?.role);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(defaultForm);
  const [markId, setMarkId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [studentsData, marksData] = await Promise.all([
        apiClient.get("/students", { token }),
        apiClient.get("/marks", { token }),
      ]);

      setStudents(studentsData);
      setMarks(marksData);
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

  const subjectPerformance = useMemo(() => {
    const grouped = marks.reduce((result, mark) => {
      const percentage = (Number(mark.marksObtained) / Number(mark.totalMarks || 1)) * 100;

      if (!result[mark.subject]) {
        result[mark.subject] = [];
      }

      result[mark.subject].push(percentage);
      return result;
    }, {});

    return Object.entries(grouped).map(([subject, values]) => ({
      subject,
      average: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
    }));
  }, [marks]);

  const averageScore = useMemo(() => {
    if (!marks.length) {
      return 0;
    }

    const total = marks.reduce(
      (sum, mark) => sum + (Number(mark.marksObtained) / Number(mark.totalMarks || 1)) * 100,
      0,
    );

    return Math.round(total / marks.length);
  }, [marks]);

  const openCreateModal = () => {
    setMode("create");
    setMarkId("");
    setForm({
      ...defaultForm,
      student: students[0]?._id || "",
    });
    setModalOpen(true);
  };

  const openEditModal = (mark) => {
    setMode("edit");
    setMarkId(mark._id);
    setForm({
      student: mark.student?._id || "",
      subject: mark.subject,
      examType: mark.examType,
      term: mark.term,
      marksObtained: String(mark.marksObtained),
      totalMarks: String(mark.totalMarks),
    });
    setModalOpen(true);
  };

  const saveMark = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (mode === "create") {
        await apiClient.post("/marks", form, { token });
      } else {
        await apiClient.put(`/marks/${markId}`, form, { token });
      }

      setModalOpen(false);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMark = async (id) => {
    if (!window.confirm("Delete this marks entry?")) {
      return;
    }

    try {
      await apiClient.delete(`/marks/${id}`, { token });
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (mark) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{mark.student?.fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mark.student?.department}
          </p>
        </div>
      ),
    },
    { key: "subject", header: "Subject" },
    { key: "examType", header: "Exam Type" },
    { key: "term", header: "Term" },
    {
      key: "score",
      header: "Score",
      render: (mark) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {mark.marksObtained}/{mark.totalMarks}
        </span>
      ),
    },
    {
      key: "percentage",
      header: "Percentage",
      render: (mark) => `${Math.round((mark.marksObtained / mark.totalMarks) * 100)}%`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (mark) =>
        canManage ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEditModal(mark)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => deleteMark(mark._id)}
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
      <RoleNotice subject="marks and assessment entries" />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Marks Entries"
          value={marks.length}
          helper="Assessment records available for analysis."
          icon={<BookOpenText size={22} />}
        />
        <StatCard
          label="Average Score"
          value={`${averageScore}%`}
          helper="Average assessment performance across visible entries."
          icon={<Plus size={22} />}
          accent="bg-gradient-to-r from-sky-400 via-brand-500 to-indigo-500"
        />
        <StatCard
          label="Tracked Subjects"
          value={subjectPerformance.length}
          helper="Subjects currently contributing to analytics."
          icon={<Pencil size={22} />}
          accent="bg-gradient-to-r from-violet-400 via-fuchsia-500 to-rose-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel
          title="Subject Performance"
          description="Presentation-ready chart comparing subject-wise average marks."
        >
          <PerformanceBarChart data={subjectPerformance} xKey="subject" barKey="average" color="#3b82f6" />
        </Panel>

        <Panel
          title="Marks Management"
          description={loading ? "Refreshing academic records..." : "Clean CRUD operations for examination and assignment scores."}
          action={
            canManage ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Plus size={16} />
                Add Marks
              </button>
            ) : null
          }
        >
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : null}
          <Table columns={columns} data={marks} emptyMessage="No marks entries found." />
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === "create" ? "Add Marks Entry" : "Edit Marks Entry"}
        description="Marks directly affect the overall behaviour score and risk analysis."
      >
        <form className="space-y-5" onSubmit={saveMark}>
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
              label="Subject"
              value={form.subject}
              onChange={(event) =>
                setForm((current) => ({ ...current, subject: event.target.value }))
              }
            />
            <FormField
              label="Exam Type"
              as="select"
              value={form.examType}
              onChange={(event) =>
                setForm((current) => ({ ...current, examType: event.target.value }))
              }
              options={examTypeOptions}
            />
            <FormField
              label="Term"
              value={form.term}
              onChange={(event) =>
                setForm((current) => ({ ...current, term: event.target.value }))
              }
            />
            <FormField
              label="Marks Obtained"
              type="number"
              value={form.marksObtained}
              onChange={(event) =>
                setForm((current) => ({ ...current, marksObtained: event.target.value }))
              }
            />
            <FormField
              label="Total Marks"
              type="number"
              value={form.totalMarks}
              onChange={(event) =>
                setForm((current) => ({ ...current, totalMarks: event.target.value }))
              }
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
              {saving ? "Saving..." : mode === "create" ? "Create Entry" : "Update Entry"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MarksPage;
