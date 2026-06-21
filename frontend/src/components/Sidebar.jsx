import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAVIGATION_GROUPS } from '../config/navigation';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();

  // Helper to render Lucide Icons by name dynamically
  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4 shrink-0" /> : null;
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:static lg:translate-x-0 glass-panel",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Sidebar Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm tracking-wider text-white shadow-md shadow-indigo-600/30">
            RS
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight leading-none">RetailSync</h1>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider">ENTERPRISE POS</span>
          </div>
        </div>
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white"
        >
          <Icons.X size={16} />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {NAVIGATION_GROUPS.map((group) => {
          // Filter items based on roles
          const visibleItems = group.items.filter(item => 
            !user || item.allowedRoles.includes(user.role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-2">
              <h2 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {group.title}
              </h2>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all",
                      isActive 
                        ? "bg-indigo-600 text-white shadow-sm font-semibold" 
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200"
                    )}
                  >
                    {renderIcon(item.icon)}
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
