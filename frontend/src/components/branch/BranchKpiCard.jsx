import React from 'react';
import { cn } from '../../utils/cn';

export const BranchKpiCard = ({ title, value, subtext, icon: Icon, trend, variant = 'default' }) => {
  const variantStyles = {
    default: "bg-white border-slate-200",
    primary: "bg-blue-50/50 border-blue-100",
    success: "bg-emerald-50/50 border-emerald-100",
    warning: "bg-amber-50/50 border-amber-100",
  };

  const iconStyles = {
    default: "bg-slate-100 text-slate-600",
    primary: "bg-blue-100 text-blue-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
  };

  return (
    <div className={cn("p-5 rounded-xl border flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow", variantStyles[variant])}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        {Icon && (
          <div className={cn("p-2 rounded-lg", iconStyles[variant])}>
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1 z-10">
        <span className="text-3xl font-bold text-slate-800">{value}</span>
        {trend ? (
          <div className="flex items-center gap-1 mt-1 text-xs">
            <span className={cn("font-medium", trend.value > 0 ? "text-emerald-600" : "text-rose-600")}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-slate-500">{trend.label || 'vs last month'}</span>
          </div>
        ) : (
          subtext && <span className="text-sm text-slate-500 mt-1">{subtext}</span>
        )}
      </div>
      
      {/* Decorative gradient blur in background */}
      <div className={cn(
        "absolute -bottom-4 -right-4 w-24 h-24 blur-2xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity",
        variant === 'primary' ? 'bg-blue-400' :
        variant === 'success' ? 'bg-emerald-400' :
        variant === 'warning' ? 'bg-amber-400' : 'bg-slate-300'
      )} />
    </div>
  );
};
