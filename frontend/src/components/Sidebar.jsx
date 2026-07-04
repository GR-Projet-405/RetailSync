import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAVIGATION_GROUPS } from '../config/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { cn } from '../utils/cn';

const linkClassName = ({ isActive }) =>
  cn(
    'flex items-center gap-2.5 px-2.5 min-h-[44px] text-[14px] font-[500] tracking-[-0.01em] leading-[1.5] rounded-lg transition-all duration-150 ease-in-out relative group',
    isActive
      ? 'bg-blue-600 text-white shadow-[0_6px_18px_rgba(37,99,235,0.20)] border border-white/[0.08] font-[600]'
      : 'text-[#E2E8F0] hover:bg-white/[0.05] hover:text-white border border-transparent'
  );

const SidebarNavItem = ({ item, renderIcon, isSidebarCollapsed }) => {
  const location = useLocation();
  const visibleChildren = item.children || [];
  const hasChildren = visibleChildren.length > 0;
  const isChildActive = visibleChildren.some(
    (child) =>
      location.pathname === child.path
  );
  const [expanded, setExpanded] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setExpanded(true);
    }
  }, [isChildActive]);

  if (!hasChildren) {
    return (
      <NavLink
        to={item.path}
        title={isSidebarCollapsed ? item.name : undefined}
        className={({ isActive }) =>
          cn(linkClassName({ isActive }), isSidebarCollapsed && 'lg:justify-center lg:gap-0 lg:px-2')
        }
      >
        {renderIcon(item.icon)}
        <span
          className={cn(
            'transition-all duration-300 whitespace-nowrap leading-none',
            isSidebarCollapsed ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100 lg:w-auto'
          )}
        >
          {item.name}
        </span>

        {isSidebarCollapsed && (
          <div className="absolute left-full ml-3 px-2 py-1 text-xs bg-slate-950 text-slate-100 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap border border-slate-800 shadow-xl hidden lg:block z-50">
            {item.name}
          </div>
        )}
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        title={isSidebarCollapsed ? item.name : undefined}
        className={cn(
          'w-full flex items-center gap-2.5 px-2.5 min-h-[44px] text-[14px] font-[500] tracking-[-0.01em] leading-[1.5] rounded-lg transition-all duration-150 ease-in-out relative group border border-transparent',
          isChildActive
            ? 'bg-white/[0.08] text-white font-[600]'
            : 'text-[#E2E8F0] hover:bg-white/[0.05] hover:text-white',
          isSidebarCollapsed && 'lg:justify-center lg:gap-0 lg:px-2'
        )}
      >
        {renderIcon(item.icon)}
        <span
          className={cn(
            'flex-1 text-left transition-all duration-300 whitespace-nowrap leading-none',
            isSidebarCollapsed ? 'lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100 lg:w-auto'
          )}
        >
          {item.name}
        </span>
        {!isSidebarCollapsed && (
          <Icons.ChevronDown
            className={cn(
              'w-4 h-4 shrink-0 transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        )}

        {isSidebarCollapsed && (
          <div className="absolute left-full ml-3 px-2 py-1 text-xs bg-slate-950 text-slate-100 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap border border-slate-800 shadow-xl hidden lg:block z-50">
            {item.name}
          </div>
        )}
      </button>

      {expanded && !isSidebarCollapsed && (
        <div className="mt-1 ml-3 space-y-1 border-l border-white/10 pl-3">
          {visibleChildren.map((child) => (
            <NavLink
              key={child.id}
              to={child.path}
              end
              className={({ isActive }) =>
                cn(
                  linkClassName({ isActive }),
                  'min-h-[40px] text-[13px]'
                )
              }
            >
              {renderIcon(child.icon)}
              <span className="whitespace-nowrap leading-none">{child.name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar = () => {
  const { user, hasRole } = useAuth();
  const { isSidebarCollapsed, isSidebarOpen, toggleSidebar } = useSidebar();

  const renderIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4 shrink-0" /> : null;
  };

  const isItemVisible = (item) =>
    !user || (item.allowedRoles && hasRole(...item.allowedRoles));

  const getVisibleItems = (items) =>
    items.filter((item) => {
      if (!isItemVisible(item)) return false;
      if (item.children?.length) {
        return item.children.some((child) => isItemVisible(child));
      }
      return true;
    });

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-[280px] h-screen bg-[#0F172A] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:static lg:translate-x-0 lg:h-screen',
        isSidebarCollapsed ? 'lg:w-[80px]' : 'lg:w-[280px]'
      )}
    >
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center h-8 shrink-0 overflow-hidden relative">
            <img
              src="/logo.png"
              alt="RetailSync Logo"
              className={cn(
                'h-8 transition-all duration-300 select-none',
                isSidebarCollapsed ? 'w-8 object-cover object-left' : 'w-[180px] object-contain object-left'
              )}
            />
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors duration-150"
        >
          <Icons.X size={15} />
        </button>
      </div>

      <div
        className={cn(
          'flex-1 overflow-y-auto overflow-x-visible py-4 px-3 flex flex-col transition-all duration-300',
          isSidebarCollapsed && 'lg:px-2'
        )}
      >
        {NAVIGATION_GROUPS.map((group, index) => {
          const visibleItems = getVisibleItems(group.items);

          if (visibleItems.length === 0) return null;

          return (
            <React.Fragment key={group.title}>
              {index > 0 && <div className="h-px bg-white/[0.05] my-6 mx-2 shrink-0" />}
              <div className="space-y-1 shrink-0">
                <h2
                  className={cn(
                    'px-2 mb-2 text-[11px] font-[700] text-[#94A3B8] uppercase tracking-[0.12em] transition-all duration-300 select-none',
                    isSidebarCollapsed ? 'lg:opacity-0 lg:h-0 lg:mb-0 overflow-hidden' : 'opacity-100'
                  )}
                >
                  {group.title}
                </h2>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <SidebarNavItem
                      key={item.id}
                      item={{
                        ...item,
                        children: item.children?.filter((child) => isItemVisible(child)),
                      }}
                      renderIcon={renderIcon}
                      isSidebarCollapsed={isSidebarCollapsed}
                    />
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
