const FormField = ({
  label,
  error,
  as = "input",
  options = [],
  className = "",
  ...props
}) => {
  const Component = as;

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
      {Component === "select" ? (
        <select className={`input-shell ${className}`} {...props}>
          {options.map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
        </select>
      ) : Component === "textarea" ? (
        <textarea className={`input-shell min-h-[120px] resize-none ${className}`} {...props} />
      ) : (
        <input className={`input-shell ${className}`} {...props} />
      )}
      {error ? <p className="text-xs font-medium text-rose-500">{error}</p> : null}
    </label>
  );
};

export default FormField;
