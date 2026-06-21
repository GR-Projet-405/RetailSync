import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

export const BranchSelector = () => {
  const { activeBranch, setActiveBranch, branches } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 shadow-sm transition-all focus:outline-none"
      >
        <MapPin className="w-4 h-4 text-cyan-400" />
        <span>{activeBranch}</span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden glass-panel">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/50">
              Select Active Branch
            </div>
            {branches.map((branch) => (
              <button
                key={branch}
                onClick={() => {
                  setActiveBranch(branch);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-indigo-600/20 hover:text-indigo-200 flex items-center gap-2",
                  activeBranch === branch ? "text-indigo-400 font-semibold bg-indigo-500/10" : "text-slate-300"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full bg-cyan-400", activeBranch === branch ? "opacity-100" : "opacity-0")} />
                {branch}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BranchSelector;
