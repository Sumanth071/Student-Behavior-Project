const StatCard = ({ icon, label, value, helper, accent }) => (
  <div className="card-surface relative overflow-hidden p-5">
    <div
      className={`absolute inset-x-0 top-0 h-1 ${
        accent || "bg-gradient-to-r from-brand-400 via-cyan-500 to-sky-500"
      }`}
    />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
        <h3 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
      </div>
      <div className="rounded-2xl bg-slate-100 p-3 text-brand-600 dark:bg-slate-800 dark:text-brand-300">
        {icon}
      </div>
    </div>
  </div>
);

export default StatCard;
