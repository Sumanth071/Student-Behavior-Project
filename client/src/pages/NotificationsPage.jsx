import { BellRing, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import apiClient from "../api/apiClient.js";
import FormField from "../components/common/FormField.jsx";
import Modal from "../components/common/Modal.jsx";
import Panel from "../components/common/Panel.jsx";
import StatCard from "../components/common/StatCard.jsx";
import StatusBadge from "../components/common/StatusBadge.jsx";
import Table from "../components/common/Table.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { audienceRoleOptions } from "../utils/constants.js";
import { formatDate } from "../utils/format.js";

const defaultForm = {
  title: "",
  message: "",
  type: "info",
  audienceRoles: ["Admin", "Teacher"],
  student: "",
  actionLabel: "Review",
  isActive: true,
};

const NotificationsPage = () => {
  const { token, user } = useAuth();
  const canManage = ["Admin", "Teacher"].includes(user?.role);
  const [notifications, setNotifications] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [notificationId, setNotificationId] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [notificationsData, studentsData] = await Promise.all([
        apiClient.get("/notifications", { token }),
        apiClient.get("/students", { token }),
      ]);

      setNotifications(notificationsData);
      setStudents(studentsData);
      setForm((current) => ({
        ...current,
        student: current.student || "",
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

  const notificationMetrics = useMemo(
    () => ({
      active: notifications.filter((notification) => notification.isActive).length,
      critical: notifications.filter((notification) => notification.type === "critical").length,
    }),
    [notifications],
  );

  const openCreateModal = () => {
    setMode("create");
    setNotificationId("");
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEditModal = (notification) => {
    setMode("edit");
    setNotificationId(notification._id);
    setForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      audienceRoles: notification.audienceRoles || [],
      student: notification.student?._id || "",
      actionLabel: notification.actionLabel || "Review",
      isActive: notification.isActive,
    });
    setModalOpen(true);
  };

  const toggleAudienceRole = (role) => {
    setForm((current) => ({
      ...current,
      audienceRoles: current.audienceRoles.includes(role)
        ? current.audienceRoles.filter((item) => item !== role)
        : [...current.audienceRoles, role],
    }));
  };

  const saveNotification = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (mode === "create") {
        await apiClient.post("/notifications", form, { token });
      } else {
        await apiClient.put(`/notifications/${notificationId}`, form, { token });
      }

      setModalOpen(false);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Delete this notification?")) {
      return;
    }

    try {
      await apiClient.delete(`/notifications/${id}`, { token });
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (notification) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{notification.title}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {notification.actionLabel}
          </p>
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (notification) => (
        <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">
          {notification.message}
        </p>
      ),
    },
    {
      key: "audienceRoles",
      header: "Audience",
      render: (notification) => (
        <div className="flex flex-wrap gap-2">
          {(notification.audienceRoles || []).map((role) => (
            <StatusBadge key={role} value="Active" label={role} />
          ))}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (notification) => <StatusBadge value={notification.type} />,
    },
    {
      key: "student",
      header: "Student",
      render: (notification) => notification.student?.fullName || "General Alert",
    },
    {
      key: "createdAt",
      header: "Created",
      render: (notification) => formatDate(notification.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (notification) =>
        canManage ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => openEditModal(notification)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteNotification(notification._id)}
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
          label="Notification Count"
          value={notifications.length}
          helper="All alerts visible to the current logged-in role."
          icon={<BellRing size={22} />}
        />
        <StatCard
          label="Active Alerts"
          value={notificationMetrics.active}
          helper="Alerts that are currently active in the dashboard."
          icon={<Plus size={22} />}
          accent="bg-gradient-to-r from-brand-400 via-cyan-500 to-sky-500"
        />
        <StatCard
          label="Critical Alerts"
          value={notificationMetrics.critical}
          helper="High priority notifications for intervention or review."
          icon={<Trash2 size={22} />}
          accent="bg-gradient-to-r from-rose-400 via-red-500 to-orange-500"
        />
      </div>

      <Panel
        title="Notifications and Alerts"
        description={loading ? "Refreshing notification data..." : "Role-based notifications with clean CRUD management for demo readiness."}
        action={
          canManage ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Plus size={16} />
              Add Notification
            </button>
          ) : null
        }
      >
        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-500 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        ) : null}
        <Table columns={columns} data={notifications} emptyMessage="No notifications available." />
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={mode === "create" ? "Create Notification" : "Edit Notification"}
        description="Notifications help admins, teachers, students, and parents stay updated."
      >
        <form className="space-y-5" onSubmit={saveNotification}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Title"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
            />
            <FormField
              label="Type"
              as="select"
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({ ...current, type: event.target.value }))
              }
              options={["info", "success", "warning", "critical"]}
            />
            <FormField
              label="Linked Student"
              as="select"
              value={form.student}
              onChange={(event) =>
                setForm((current) => ({ ...current, student: event.target.value }))
              }
              options={[
                { label: "General Alert", value: "" },
                ...students.map((student) => ({
                  label: student.fullName,
                  value: student._id,
                })),
              ]}
            />
            <FormField
              label="Action Label"
              value={form.actionLabel}
              onChange={(event) =>
                setForm((current) => ({ ...current, actionLabel: event.target.value }))
              }
            />
          </div>

          <FormField
            label="Message"
            as="textarea"
            value={form.message}
            onChange={(event) =>
              setForm((current) => ({ ...current, message: event.target.value }))
            }
          />

          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Audience Roles
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {audienceRoleOptions.map((role) => {
                const selected = form.audienceRoles.includes(role);

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleAudienceRole(role)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      selected
                        ? "border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-300"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300"
                    }`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm((current) => ({ ...current, isActive: event.target.checked }))
              }
            />
            Keep this alert active
          </label>

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
              {saving ? "Saving..." : mode === "create" ? "Create Alert" : "Update Alert"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
