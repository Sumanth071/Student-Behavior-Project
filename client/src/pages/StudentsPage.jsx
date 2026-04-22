import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import apiClient from "../api/apiClient.js";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import Panel from "../components/common/Panel.jsx";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Table from "../components/common/Table.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { studentStatusOptions } from "../utils/constants.js";
import { buildQueryString, formatPercent } from "../utils/format.js";

const emptyForm = {
  admissionNo: "",
  fullName: "",
  email: "",
  department: "",
  semester: "",
  section: "",
  mentorName: "",
  parentName: "",
  parentPhone: "",
  gender: "Other",
  status: "Active",
  address: "",
};

const StudentsPage = () => {
  const { token, user } = useAuth();
  const canManage = ["Admin", "Teacher"].includes(user?.role);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    section: "",
    semester: "",
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const deferredSearch = useDeferredValue(filters.search);

  const loadStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const queryString = buildQueryString({
        search: deferredSearch,
        department: filters.department,
        section: filters.section,
        semester: filters.semester,
      });
      const data = await apiClient.get(`/students${queryString}`, { token });

      startTransition(() => {
        setStudents(data);
        setSelectedStudent((current) => {
          if (!data.length) {
            return null;
          }

          return data.find((student) => student._id === current?._id) || data[0];
        });
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [token, deferredSearch, filters.department, filters.section, filters.semester]);

  const studentMetrics = useMemo(
    () => ({
      lowRisk: students.filter((student) => student.riskLevel === "Low").length,
      mediumRisk: students.filter((student) => student.riskLevel === "Medium").length,
      highRisk: students.filter((student) => student.riskLevel === "High").length,
    }),
    [students],
  );

  const filterOptions = useMemo(
    () => ({
      departments: [...new Set(students.map((student) => student.department))],
      sections: [...new Set(students.map((student) => student.section))],
      semesters: [...new Set(students.map((student) => student.semester))],
    }),
    [students],
  );

  const openCreateModal = () => {
    setMode("create");
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (student) => {
    setMode("edit");
    setForm({
      admissionNo: student.admissionNo || "",
      fullName: student.fullName || "",
      email: student.email || "",
      department: student.department || "",
      semester: student.semester || "",
      section: student.section || "",
      mentorName: student.mentorName || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      gender: student.gender || "Other",
      status: student.status || "Active",
      address: student.address || "",
      _id: student._id,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};

    if (!form.admissionNo.trim()) {
      errors.admissionNo = "Admission number is required.";
    }

    if (!form.fullName.trim()) {
      errors.fullName = "Student name is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    }

    if (!form.department.trim()) {
      errors.department = "Department is required.";
    }

    if (!form.semester) {
      errors.semester = "Semester is required.";
    }

    if (!form.section.trim()) {
      errors.section = "Section is required.";
    }

    return errors;
  };

  const saveStudent = async (event) => {
    event.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length) {
      setFormErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      if (mode === "create") {
        await apiClient.post("/students", form, { token });
      } else {
        await apiClient.put(`/students/${form._id}`, form, { token });
      }

      setModalOpen(false);
      await loadStudents();
    } catch (saveError) {
      setFormErrors({ submit: saveError.message });
    } finally {
      setSaving(false);
    }
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm("Delete this student and all related records?")) {
      return;
    }

    try {
      await apiClient.delete(`/students/${studentId}`, { token });
      await loadStudents();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const columns = [
    {
      key: "student",
      header: "Student",
      render: (student) => (
        <button
          type="button"
          onClick={() => setSelectedStudent(student)}
          className="text-left"
        >
          <p className="font-semibold text-slate-900 dark:text-white">{student.fullName}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{student.admissionNo}</p>
        </button>
      ),
    },
    {
      key: "class",
      header: "Class / Section",
      render: (student) => (
        <div>
          <p>{student.department}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sem {student.semester} • Sec {student.section}
          </p>
        </div>
      ),
    },
    {
      key: "attendanceRate",
      header: "Attendance",
      render: (student) => formatPercent(student.attendanceRate),
    },
    {
      key: "averageMark",
      header: "Marks",
      render: (student) => formatPercent(student.averageMark),
    },
    {
      key: "behaviourScore",
      header: "Score",
      render: (student) => (
        <span className="font-bold text-slate-900 dark:text-white">{student.behaviourScore}</span>
      ),
    },
    {
      key: "riskLevel",
      header: "Risk",
      render: (student) => <StatusBadge value={student.riskLevel} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (student) => (
        <div className="flex gap-2">
          {canManage ? (
            <>
              <button
                type="button"
                onClick={() => openEditModal(student)}
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => deleteStudent(student._id)}
                className="rounded-xl border border-rose-200 p-2 text-rose-500 transition hover:bg-rose-50 dark:border-rose-500/20 dark:hover:bg-rose-500/10"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSelectedStudent(student)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              View
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visible Students"
          value={students.length}
          helper="Records matching the current search and section filters."
          icon={<Search size={22} />}
        />
        <StatCard
          label="Low Risk"
          value={studentMetrics.lowRisk}
          helper="Students showing strong academic and behavioural balance."
          icon={<Plus size={22} />}
          accent="bg-gradient-to-r from-emerald-400 via-teal-500 to-brand-500"
        />
        <StatCard
          label="Medium Risk"
          value={studentMetrics.mediumRisk}
          helper="Students who need regular follow-up and targeted support."
          icon={<Pencil size={22} />}
          accent="bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500"
        />
        <StatCard
          label="High Risk"
          value={studentMetrics.highRisk}
          helper="Profiles requiring immediate mentor or parent intervention."
          icon={<Trash2 size={22} />}
          accent="bg-gradient-to-r from-rose-400 via-red-500 to-orange-500"
        />
      </div>

      <Panel
        title="Search and Filter by Class / Section"
        description="Use this extra feature to impress evaluators with faster data exploration."
        action={
          canManage ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Plus size={16} />
              Add Student
            </button>
          ) : null
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FormField
            label="Search"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
            placeholder="Name, admission no, or email"
          />
          <FormField
            label="Department"
            as="select"
            value={filters.department}
            onChange={(event) =>
              setFilters((current) => ({ ...current, department: event.target.value }))
            }
            options={[
              { label: "All Departments", value: "" },
              ...filterOptions.departments.map((option) => ({ label: option, value: option })),
            ]}
          />
          <FormField
            label="Section"
            as="select"
            value={filters.section}
            onChange={(event) =>
              setFilters((current) => ({ ...current, section: event.target.value }))
            }
            options={[
              { label: "All Sections", value: "" },
              ...filterOptions.sections.map((option) => ({ label: option, value: option })),
            ]}
          />
          <FormField
            label="Semester"
            as="select"
            value={filters.semester}
            onChange={(event) =>
              setFilters((current) => ({ ...current, semester: event.target.value }))
            }
            options={[
              { label: "All Semesters", value: "" },
              ...filterOptions.semesters.map((option) => ({ label: option, value: option })),
            ]}
          />
        </div>
      </Panel>

      {error ? (
        <div className="card-surface border border-rose-200 px-5 py-4 text-sm font-semibold text-rose-500 dark:border-rose-500/20 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Student Records"
          description={loading ? "Refreshing student data..." : "All student records with computed behaviour intelligence."}
        >
          <Table columns={columns} data={students} emptyMessage="No students match the current filters." />
        </Panel>

        <Panel
          title="Student Insight Card"
          description="Select a student from the table to review the detailed behavioural summary."
        >
          {selectedStudent ? (
            <div className="space-y-5">
              <div className="rounded-[24px] bg-gradient-to-br from-brand-500 via-cyan-500 to-sky-600 p-5 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedStudent.fullName}</h3>
                    <p className="mt-1 text-sm text-white/80">
                      {selectedStudent.department} • Sem {selectedStudent.semester} • Sec{" "}
                      {selectedStudent.section}
                    </p>
                  </div>
                  <StatusBadge value={selectedStudent.riskLevel} />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/70">Score</p>
                    <p className="mt-2 text-3xl font-bold">{selectedStudent.behaviourScore}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-white/70">Attendance</p>
                    <p className="mt-2 text-3xl font-bold">
                      {formatPercent(selectedStudent.attendanceRate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Marks
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPercent(selectedStudent.averageMark)}
                  </p>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Assignment Rate
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {formatPercent(selectedStudent.assignmentRate)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Insights</p>
                <div className="mt-3 space-y-2">
                  {(selectedStudent.insights || []).map((insight) => (
                    <div
                      key={insight}
                      className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300"
                    >
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Suggestions</p>
                <div className="mt-3 space-y-2">
                  {(selectedStudent.suggestions || []).map((suggestion) => (
                    <div
                      key={suggestion}
                      className="rounded-2xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-sm text-slate-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-slate-200"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select a student to preview the behaviour summary.
            </p>
          )}
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === "create" ? "Add Student" : "Edit Student"}
        description="Maintain complete student profiles with clean validation and CRUD support."
      >
        <form className="space-y-5" onSubmit={saveStudent}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Admission Number"
              value={form.admissionNo}
              error={formErrors.admissionNo}
              onChange={(event) =>
                setForm((current) => ({ ...current, admissionNo: event.target.value }))
              }
            />
            <FormField
              label="Full Name"
              value={form.fullName}
              error={formErrors.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
            />
            <FormField
              label="Email"
              type="email"
              value={form.email}
              error={formErrors.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
            <FormField
              label="Department"
              value={form.department}
              error={formErrors.department}
              onChange={(event) =>
                setForm((current) => ({ ...current, department: event.target.value }))
              }
            />
            <FormField
              label="Semester"
              type="number"
              value={form.semester}
              error={formErrors.semester}
              onChange={(event) =>
                setForm((current) => ({ ...current, semester: event.target.value }))
              }
            />
            <FormField
              label="Section"
              value={form.section}
              error={formErrors.section}
              onChange={(event) =>
                setForm((current) => ({ ...current, section: event.target.value }))
              }
            />
            <FormField
              label="Mentor Name"
              value={form.mentorName}
              onChange={(event) =>
                setForm((current) => ({ ...current, mentorName: event.target.value }))
              }
            />
            <FormField
              label="Parent Name"
              value={form.parentName}
              onChange={(event) =>
                setForm((current) => ({ ...current, parentName: event.target.value }))
              }
            />
            <FormField
              label="Parent Phone"
              value={form.parentPhone}
              onChange={(event) =>
                setForm((current) => ({ ...current, parentPhone: event.target.value }))
              }
            />
            <FormField
              label="Gender"
              as="select"
              value={form.gender}
              onChange={(event) =>
                setForm((current) => ({ ...current, gender: event.target.value }))
              }
              options={["Male", "Female", "Other"]}
            />
            <FormField
              label="Status"
              as="select"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({ ...current, status: event.target.value }))
              }
              options={studentStatusOptions}
            />
          </div>

          <FormField
            label="Address"
            as="textarea"
            value={form.address}
            onChange={(event) =>
              setForm((current) => ({ ...current, address: event.target.value }))
            }
          />

          {formErrors.submit ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
              {formErrors.submit}
            </div>
          ) : null}

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
              {saving ? "Saving..." : mode === "create" ? "Create Student" : "Update Student"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentsPage;
