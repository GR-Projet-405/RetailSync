import React, { useState } from 'react';
import { MapPin, Calendar, ChevronDown, Plus } from 'lucide-react';
import Button from '../Button';

export default function PromotionHeader({ 
  selectedBranch, 
  setSelectedBranch, 
  branches = ['All Branches', 'Downtown Flagship', 'North Branch', 'South Branch'],
  dateRange,
  setDateRange,
  onCreatePromotion,
  isBranchLocked = false
}) {
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: '01 Jun 2026 - 14 Jun 2026', value: 'custom_june' },
    { label: 'This Month', value: 'month' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 mb-6 border-b border-slate-200 gap-4 select-none">
      {/* Title Block */}
      <div className="space-y-0.5">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Promotions Dashboard</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Overview of your promotions performance and activity</p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Branch Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              if (isBranchLocked) return;
              setIsBranchOpen(!isBranchOpen);
              setIsDateOpen(false);
            }}
            disabled={isBranchLocked}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm transition-colors focus:outline-none ${
              isBranchLocked ? 'opacity-85 cursor-not-allowed bg-slate-50/50' : 'hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4 text-slate-400 stroke-[2.25]" />
            <span>{selectedBranch}</span>
            {!isBranchLocked && <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {isBranchOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsBranchOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden text-xs font-semibold text-slate-700">
                {branches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsBranchOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50/50 hover:text-blue-600 flex items-center gap-2 ${
                      selectedBranch === branch ? 'text-blue-600 font-bold bg-blue-50/20' : ''
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-blue-500 ${selectedBranch === branch ? 'opacity-100' : 'opacity-0'}`} />
                    {branch}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Date Range Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDateOpen(!isDateOpen);
              setIsBranchOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-full shadow-sm transition-colors focus:outline-none"
          >
            <Calendar className="w-4 h-4 text-slate-400 stroke-[2.25]" />
            <span>{dateRange.label}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isDateOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsDateOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden text-xs font-semibold text-slate-700">
                {dateRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => {
                      setDateRange(range);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-blue-50/50 hover:text-blue-600 flex items-center gap-2 ${
                      dateRange.value === range.value ? 'text-blue-600 font-bold bg-blue-50/20' : ''
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-blue-500 ${dateRange.value === range.value ? 'opacity-100' : 'opacity-0'}`} />
                    {range.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Create Promotion Button */}
        <Button
          onClick={onCreatePromotion}
          variant="primary"
          className="rounded-full px-5 py-2.5 text-xs font-bold shadow-sm flex items-center gap-2 shadow-blue-500/10"
        >
          <Plus size={15} />
          <span>Create Promotion</span>
        </Button>
      </div>
    </div>
  );
}
