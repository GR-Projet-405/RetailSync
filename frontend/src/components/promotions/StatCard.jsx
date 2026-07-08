import React from 'react';
import { cn } from '../../utils/cn';

export default function StatCard({ icon: Icon, label, value, trend, trendDirection = 'up', colorVariant = 'blue' }) {
  const isUp = trendDirection === 'up';
  
  const colors = {
    blue: {
      bg: 'bg-blue-50/20 border-blue-100/80',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/55',
      text: 'text-blue-600',
    },
    amber: {
      bg: 'bg-amber-50/20 border-amber-100/80',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/55',
      text: 'text-amber-600',
    },
    indigo: {
      bg: 'bg-indigo-50/20 border-indigo-100/80',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/55',
      text: 'text-indigo-600',
    },
    emerald: {
      bg: 'bg-emerald-50/20 border-emerald-100/80',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/55',
      text: 'text-emerald-600',
    }
  };

  const scheme = colors[colorVariant] || colors.blue;

  return (
    <div className={cn(
      "flex items-start gap-4 px-6 py-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md card-hover transition-all duration-200 select-none",
      scheme.bg
    )}>
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-0.5", scheme.iconBg)}>
        {Icon && <Icon size={20} className="stroke-[2.25]" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
          {label}
        </p>
        
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-2 font-sans">
          {value ?? '—'}
        </p>
        
        {trend && (
          <div className="mt-2.5">
            <span className={cn(
              "text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center select-none border whitespace-nowrap",
              isUp 
                ? "text-emerald-700 bg-emerald-50 border-emerald-200/60" 
                : "text-red-700 bg-red-50 border-red-200/60"
            )}>
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
