import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

export const BranchSelector = () => {
  const { activeBranch, setActiveBranch, branches } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger button — white text on blue navbar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 shadow-sm transition-colors duration-150 focus:outline-none"
      >
        <MapPin className="w-4 h-4 text-white/80" />
        <span>{activeBranch}</span>
        <ChevronDown className={cn('w-4 h-4 text-white/60 transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown — white panel, dark text */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden fade-in">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
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
                  'w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2',
                  activeBranch === branch
                    ? 'text-blue-700 font-semibold bg-blue-50'
                    : 'text-slate-700'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full bg-blue-500', activeBranch === branch ? 'opacity-100' : 'opacity-0')} />
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
