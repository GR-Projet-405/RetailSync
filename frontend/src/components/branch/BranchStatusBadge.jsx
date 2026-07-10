import React from 'react';
import { cn } from '../../utils/cn';

export const BranchStatusBadge = ({ status }) => {
  const isActive = status?.toUpperCase() === 'ACTIVE' || status?.toUpperCase() === 'IN STOCK';
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        isActive 
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", isActive ? "bg-emerald-500" : "bg-rose-500")} />
      {isActive ? (status === 'IN STOCK' ? 'In Stock' : 'Active') : (status === 'OUT OF STOCK' ? 'Out of Stock' : status === 'LOW STOCK' ? 'Low Stock' : 'Inactive')}
    </span>
  );
};
