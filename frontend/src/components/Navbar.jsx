import { useState } from 'react';
import { Menu, Bell, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSidebar } from '../contexts/SidebarContext';
import { ROLES, ROLE_LABELS } from '../config/roles';
import BranchSelector from './BranchSelector';

export const Navbar = () => {
  const { user, updateRole, logout } = useAuth();
  const { toggleSidebar } = useSidebar();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  return (
    <header
      className="h-16 border-b border-blue-700/30 flex items-center justify-between px-6 z-20 shrink-0 sticky top-0"
      style={{ background: 'linear-gradient(90deg, #2563EB, #3B82F6, #60A5FA)' }}
    >
      {/* Left — menu toggle + branch selector */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors duration-150"
        >
          <Menu className="w-5 h-5" />
        </button>
        <BranchSelector />
      </div>

      {/* Right — role switcher, notifications, user menu */}
      <div className="flex items-center gap-3">

        {/* Demo Role Switcher */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg">
          <ShieldAlert className="w-3.5 h-3.5 text-white/80" />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Demo Role:</span>
          <select
            value={user?.role}
            onChange={(e) => updateRole(e.target.value)}
            className="bg-transparent text-xs text-white font-semibold border-none focus:ring-0 outline-none cursor-pointer"
          >
            {Object.keys(ROLES).map((roleKey) => (
              <option key={roleKey} value={roleKey} className="bg-blue-700 text-white">
                {ROLE_LABELS[roleKey]}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <button
          onClick={() => setShowNotificationBadge(false)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white relative transition-colors duration-150"
        >
          <Bell className="w-4 h-4" />
          {showNotificationBadge && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white shadow-sm" />
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors duration-150"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white">{user?.name}</div>
              <div className="text-[10px] text-white/70 font-medium uppercase tracking-wider leading-none mt-0.5">
                {ROLE_LABELS[user?.role]}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.substring(0, 2)}
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden fade-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                  <div className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</div>
                </div>

                {/* Mobile-only role selector */}
                <div className="md:hidden px-4 py-2 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Switch Role</div>
                  <select
                    value={user?.role}
                    onChange={(e) => updateRole(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-blue-600 font-semibold border border-slate-200 rounded px-2 py-1 outline-none"
                  >
                    {Object.keys(ROLES).map((roleKey) => (
                      <option key={roleKey} value={roleKey}>
                        {ROLE_LABELS[roleKey]}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
