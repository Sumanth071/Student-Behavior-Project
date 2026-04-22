const Table = ({ columns, data, emptyMessage = "No records found." }) => (
  <div className="overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50/90 dark:bg-slate-900/80">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white/80 dark:divide-slate-800 dark:bg-slate-950/40">
          {data.length ? (
            data.map((row, index) => (
              <tr
                key={row._id || row.id || index}
                className="transition hover:bg-brand-50/60 dark:hover:bg-slate-900/80"
              >
                {columns.map((column) => (
                  <td
                    key={`${column.key}-${row._id || row.id || index}`}
                    className="px-4 py-4 align-top text-sm text-slate-600 dark:text-slate-300"
                  >
                    {column.render ? column.render(row, index) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default Table;
