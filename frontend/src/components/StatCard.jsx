import React from 'react';
import { cn } from '../utils/cn';

export const StatCard = ({ title, value, change, changeVariant = 'success', className }) => {
  const changeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={cn('rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm', className)}>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.18em]">{title}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      {change && (
        <span className={cn('inline-flex items-center gap-1 mt-3 px-2.5 py-1.5 text-xs font-semibold rounded-full border', changeStyles[changeVariant])}>
          {change}
        </span>
      )}
    </div>
  );
};

export default StatCard;
