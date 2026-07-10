import React from 'react';
import { cn } from '../utils/cn';

const STATUS_STYLES = {
  Active:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Inactive:'bg-red-50 text-red-700 border-red-200',
};

export const StatusBadge = ({ status }) => {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border', STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 border-slate-200')}>
      {status}
    </span>
  );
};

export default StatusBadge;
