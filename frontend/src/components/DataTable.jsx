import React from 'react';
import { cn } from '../utils/cn';

export const DataTable = ({ columns, data, className, emptyMessage = 'No data available' }) => {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {columns.map((column, idx) => (
              <th 
                key={column.key || idx} 
                className="px-6 py-4 font-semibold"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
          {data && data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr 
                key={row.id || rowIdx} 
                className="hover:bg-slate-800/40 transition-colors"
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
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
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
