import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { isManagerRole } from "../../utils/roles.js";

const RoleNotice = ({ subject = "records" }) => {
  const { user } = useAuth();
  const canManage = isManagerRole(user?.role);

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-[24px] border px-4 py-4 text-sm ${
        canManage
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300"
      }`}
    >
      <div className="mt-0.5">
        {canManage ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
      </div>
      <div>
        <p className="font-semibold">
          {canManage
            ? `You have full CRUD access to ${subject} as ${user?.role}.`
            : `${user?.role} view is read-only and filtered to the linked student record.`}
        </p>
        <p className="mt-1 opacity-90">
          {canManage
            ? "Use this module to create, update, and remove demo data during the client presentation."
            : "This makes the demo feel like a realistic academic portal instead of a shared admin console."}
        </p>
      </div>
    </div>
  );
};

export default RoleNotice;
