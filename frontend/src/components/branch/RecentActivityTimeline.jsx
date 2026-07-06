import React from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatDistanceToNow } from 'date-fns';

export const RecentActivityTimeline = ({ activities = [] }) => {
  if (!activities || activities.length === 0) {
    return <div className="text-sm text-slate-500 italic p-4">No recent activity found.</div>;
  }

  const getIconAndColor = (action) => {
    switch (action) {
      case 'CREATE':
        return { Icon: Icons.PlusCircle, color: 'text-emerald-500', bg: 'bg-emerald-100' };
      case 'UPDATE':
        return { Icon: Icons.Edit3, color: 'text-blue-500', bg: 'bg-blue-100' };
      case 'ASSIGN_MANAGER':
      case 'REASSIGN_MANAGER':
        return { Icon: Icons.UserCheck, color: 'text-indigo-500', bg: 'bg-indigo-100' };
      case 'ACTIVATE':
        return { Icon: Icons.CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-100' };
      case 'DEACTIVATE':
        return { Icon: Icons.XCircle, color: 'text-rose-500', bg: 'bg-rose-100' };
      default:
        return { Icon: Icons.Activity, color: 'text-slate-500', bg: 'bg-slate-100' };
    }
  };

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => {
        const { Icon, color, bg } = getIconAndColor(activity.action);
        const performedBy = activity.performedBy ? `${activity.performedBy.firstName} ${activity.performedBy.lastName}` : 'System';
        
        return (
          <div key={activity._id || index} className="relative pl-6 pb-2">
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <span className="absolute left-[11px] top-6 bottom-[-24px] w-px bg-slate-200" />
            )}
            
            {/* Timeline Icon */}
            <div className={cn("absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white", bg)}>
              <Icon className={cn("w-3.5 h-3.5", color)} />
            </div>
            
            {/* Content */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  {activity.action.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
              <span className="text-xs text-slate-500 mt-1">
                Performed by <span className="font-medium text-slate-700">{performedBy}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
