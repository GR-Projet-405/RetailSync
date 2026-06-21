import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ROLES, ROLE_LABELS } from '../config/roles';
import BranchSelector from './BranchSelector';
import { cn } from '../utils/cn';

export const Navbar = ({ toggleSidebar }) => {
  const { user, updateRole, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <BranchSelector />
      </div>

      <div className="flex items-center gap-4">
        {/* Dynamic Role Switcher (For Demo / Verification Purposes) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800/80 rounded-lg">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Demo Role:</span>
          <select 
            value={user?.role} 
            onChange={(e) => updateRole(e.target.value)}
            className="bg-transparent text-xs text-indigo-400 font-semibold border-none focus:ring-0 outline-none cursor-pointer"
          >
            {Object.keys(ROLES).map((roleKey) => (
              <option key={roleKey} value={roleKey} className="bg-slate-950 text-slate-300">
                {ROLE_LABELS[roleKey]}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <button 
          onClick={() => setShowNotificationBadge(false)}
          className="p-2 rounded-lg bg-slate-900/50 hover:bg-slate-800/85 border border-slate-800/60 text-slate-400 hover:text-white relative transition-colors"
        >
          <Bell className="w-4 h-4" />
          {showNotificationBadge && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
          )}
        </button>

        {/* User Actions */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pl-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/85 border border-slate-800/60 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
              <div className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider leading-none mt-0.5">{ROLE_LABELS[user?.role]}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/20">
              {user?.name?.substring(0, 2)}
            </div>
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden glass-panel">
                <div className="px-4 py-2 border-b border-slate-800/50">
                  <div className="text-sm font-semibold text-slate-100">{user?.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                </div>
                
                {/* Mobile-Only Role Selector */}
                <div className="md:hidden px-4 py-2 border-b border-slate-800/50">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Switch Role</div>
                  <select 
                    value={user?.role} 
                    onChange={(e) => updateRole(e.target.value)}
                    className="w-full bg-slate-950 text-xs text-indigo-400 font-semibold border border-slate-800 rounded px-2 py-1 outline-none"
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
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
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
