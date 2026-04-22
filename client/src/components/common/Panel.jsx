const Panel = ({ title, description, action, children, className = "" }) => (
  <section className={`card-surface p-5 ${className}`}>
    {(title || description || action) && (
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          {title && (
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export default Panel;
