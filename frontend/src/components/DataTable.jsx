import { cn } from '../utils/cn';

export const DataTable = ({ columns, data, className, emptyMessage = 'No records found' }) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-200 bg-white', className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {columns.map((column, idx) => (
              <th
                key={column.key || idx}
                className="px-6 py-3.5 font-semibold"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className="hover:bg-blue-50/40 transition-colors duration-150"
              >
                {columns.map((column, colIdx) => (
                  <td key={column.key || colIdx} className="px-6 py-4 whitespace-nowrap">
                    {column.render ? column.render(row, rowIdx) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-14 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
