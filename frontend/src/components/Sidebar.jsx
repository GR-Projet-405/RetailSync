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
        "fixed inset-y-0 left-0 z-30 w-[280px] h-screen bg-[#0F172A] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:static lg:translate-x-0 lg:h-screen",
        isSidebarCollapsed ? "lg:w-[80px]" : "lg:w-[280px]"
      )}
    >
      {/* Sidebar Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo mark */}
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-[11px] tracking-widest text-white shadow-md shadow-blue-600/30 shrink-0 select-none">
            RS
          </div>
          {/* Brand text */}
          <div
            className={cn(
              "transition-all duration-300 flex flex-col gap-0.5",
              isSidebarCollapsed ? "lg:opacity-0 lg:w-0 overflow-hidden" : "opacity-100 lg:w-auto"
            )}
          >
            <h1 className="text-[18px] font-[700] text-white tracking-[-0.01em] leading-none">RetailSync</h1>
            <span className="text-[11px] font-[500] text-[#94A3B8] tracking-[0.08em] uppercase leading-none">Enterprise POS</span>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors duration-150"
        >
          <Icons.X size={15} />
        </button>
      </div>

      {/* Navigation Groups */}
      <div
        className={cn(
          "flex-1 overflow-y-auto overflow-x-visible py-4 px-3 flex flex-col transition-all duration-300",
          isSidebarCollapsed && "lg:px-2"
        )}
      >
        {NAVIGATION_GROUPS.map((group, index) => {
          // Filter items based on roles
          const visibleItems = group.items.filter(item => 
            !user || item.allowedRoles.includes(user.role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <React.Fragment key={group.title}>
              {index > 0 && <div className="h-px bg-white/[0.05] my-6 mx-2 shrink-0" />}
              <div className="space-y-1 shrink-0">
                <h2
                  className={cn(
                    "px-2 mb-2 text-[11px] font-[700] text-[#94A3B8] uppercase tracking-[0.12em] transition-all duration-300 select-none",
                    isSidebarCollapsed ? "lg:opacity-0 lg:h-0 lg:mb-0 overflow-hidden" : "opacity-100"
                  )}
                >
                  {group.title}
                </h2>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      title={isSidebarCollapsed ? item.name : undefined}
                      className={({ isActive }) => cn(
                        "flex items-center gap-2.5 px-2.5 min-h-[44px] text-[14px] font-[500] tracking-[-0.01em] leading-[1.5] rounded-lg transition-all duration-150 ease-in-out relative group",
                        isActive
                          ? "bg-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.20)] border border-white/[0.08] font-[600]"
                          : "text-[#E2E8F0] hover:bg-white/[0.05] hover:text-white border border-transparent",
                        isSidebarCollapsed && "lg:justify-center lg:gap-0 lg:px-2"
                      )}
                    >
                    {renderIcon(item.icon)}
                    <span
                      className={cn(
                        "transition-all duration-300 whitespace-nowrap leading-none",
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
            </React.Fragment>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
