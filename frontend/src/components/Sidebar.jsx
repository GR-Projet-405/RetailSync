import React from 'react';
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAVIGATION_GROUPS } from '../config/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { cn } from '../utils/cn';

export const Sidebar = () => {
  const { user } = useAuth();
  const { isSidebarCollapsed, isSidebarOpen, toggleSidebar } = useSidebar();

  // Helper to render Lucide Icons by name dynamically
  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4 shrink-0" /> : null;
  };

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-[280px] h-screen bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out glass-panel",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:static lg:translate-x-0 lg:h-screen",
        isSidebarCollapsed ? "lg:w-[80px]" : "lg:w-[280px]"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 bg-slate-900/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm tracking-wider text-white shadow-md shadow-indigo-600/30 shrink-0">
            RS
          </div>
          <div 
            className={cn(
              "transition-all duration-300 flex flex-col justify-center",
              isSidebarCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 lg:w-auto"
            )}
          >
            <h1 className="font-bold text-sm text-slate-100 tracking-tight leading-none">RetailSync</h1>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider mt-0.5">ENTERPRISE POS</span>
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
      <div 
        className={cn(
          "flex-1 overflow-y-auto overflow-x-visible p-4 space-y-6 transition-all duration-300",
          isSidebarCollapsed && "lg:p-3 lg:space-y-4"
        )}
      >
        {NAVIGATION_GROUPS.map((group) => {
          // Filter items based on roles
          const visibleItems = group.items.filter(item => 
            !user || item.allowedRoles.includes(user.role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-2">
              <h2 
                className={cn(
                  "px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-all duration-300",
                  isSidebarCollapsed ? "lg:opacity-0 lg:h-0 lg:py-0 overflow-hidden" : "opacity-100"
                )}
              >
                {group.title}
              </h2>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    title={isSidebarCollapsed ? item.name : undefined}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-all relative group",
                      isActive 
                        ? "bg-indigo-600 text-white shadow-sm font-semibold" 
                        : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-200",
                      isSidebarCollapsed && "lg:justify-center lg:gap-0 lg:px-2"
                    )}
                  >
                    {renderIcon(item.icon)}
                    <span 
                      className={cn(
                        "transition-all duration-300 whitespace-nowrap",
                        isSidebarCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 lg:w-auto"
                      )}
                    >
                      {item.name}
                    </span>

                    {/* Premium CSS Tooltip (Desktop collapsed hover only) */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-3 px-2 py-1 text-xs bg-slate-950 text-slate-100 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap border border-slate-800 shadow-xl hidden lg:block z-50">
                        {item.name}
                      </div>
                    )}
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
