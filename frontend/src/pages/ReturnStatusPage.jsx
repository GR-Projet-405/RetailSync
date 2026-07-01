import React from 'react';
import { Check, Clock, ArrowRight } from 'lucide-react';

export default function ReturnStatusPage({ returnId = "RET-0091", onGoBack }) {
  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto fade-up">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Track Return Status</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Live progress tracking for Return ID: <span className="text-blue-600 font-bold">{returnId}</span>
        </p>
      </div>

      
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-10 relative min-h-[350px] flex flex-col justify-between">
        
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Return Status for {returnId}</h2>
          <div className="flex items-center justify-center gap-1.5 text-amber-500 font-semibold text-xs">
            <Clock size={14} className="animate-pulse" />
            <span>Pending Manager Approval</span>
          </div>
        </div>

        
        <div className="flex items-start justify-between w-full max-w-3xl mx-auto my-12 relative">
          
          
          <div className="flex flex-col items-center flex-1 relative group">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white z-10 shadow-sm">
              <Check size={20} strokeWidth={3} />
            </div>
            
            <div className="absolute top-5 left-1/2 w-full h-[3px] bg-blue-600 -z-0"></div>
            
            <div className="text-center mt-3 space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Request Submitted</p>
              <p className="text-[10px] text-slate-400 font-medium">09 Jun, 10:00 AM</p>
            </div>
          </div>

          
          <div className="flex flex-col items-center flex-1 relative group">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white z-10 shadow-sm">
              <Check size={20} strokeWidth={3} />
            </div>
            
            <div className="absolute top-5 left-1/2 w-full h-[2px] border-t-2 border-dashed border-slate-200 -z-0"></div>
            
            <div className="text-center mt-3 space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Item Inspected</p>
              <p className="text-[10px] text-slate-400 font-medium">09 Jun, 11:30 AM</p>
            </div>
          </div>

          
          <div className="flex flex-col items-center flex-1 relative group">
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm z-10">
              3
            </div>
            
            <div className="absolute top-5 left-1/2 w-full h-[2px] border-t-2 border-dashed border-slate-200 -z-0"></div>
            
            <div className="text-center mt-3 space-y-0.5">
              <p className="text-xs font-bold text-slate-400">Return Approved</p>
            </div>
          </div>

          
          <div className="flex flex-col items-center flex-1 relative group">
            <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm z-10">
              4
            </div>
            
            <div className="text-center mt-3 space-y-0.5">
              <p className="text-xs font-bold text-slate-400">Refund Issued</p>
            </div>
          </div>

        </div>

        
        <div className="flex justify-end w-full mt-4">
          <button 
            type="button"
            onClick={onGoBack}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-xs transition-colors focus:outline-none"
          >
            <span>Go to History</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
}