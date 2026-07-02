import React from 'react';
import { Check, Clock, ArrowRight, CheckCircle2, Info, PlusSquare } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

export default function ReturnStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { returnId: paramId } = useParams();

  
  const returnId = paramId || "RET-0091";

  
  const status = location.state?.status || 'Pending';
  const isApproved = status === 'Approved';

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto fade-up">
      
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Track Return Status</h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Live progress tracking for Return ID: <span className="text-blue-600 font-bold">{returnId}</span>
        </p>
      </div>

      
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-10 relative flex flex-col justify-between">
        
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-800">Return Status for {returnId}</h2>
          {isApproved ? (
            <div className="flex items-center justify-center gap-1.5 text-blue-600 font-semibold text-xs">
              <CheckCircle2 size={14} />
              <span>Return Approved & Ready for Refund</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-amber-500 font-semibold text-xs">
              <Clock size={14} className="animate-pulse" />
              <span>Pending Manager Approval</span>
            </div>
          )}
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
            
            <div className={`absolute top-5 left-1/2 w-full ${isApproved ? 'h-[3px] bg-blue-600' : 'h-[2px] border-t-2 border-dashed border-slate-200'} -z-0`}></div>
            <div className="text-center mt-3 space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Item Inspected</p>
              <p className="text-[10px] text-slate-400 font-medium">09 Jun, 11:30 AM</p>
            </div>
          </div>

          
          <div className="flex flex-col items-center flex-1 relative group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm ${isApproved ? 'bg-emerald-500 text-white' : 'bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold text-sm'}`}>
              {isApproved ? <Check size={20} strokeWidth={3} /> : '3'}
            </div>
            <div className="absolute top-5 left-1/2 w-full h-[2px] border-t-2 border-dashed border-slate-200 -z-0"></div>
            <div className="text-center mt-3 space-y-0.5">
              <p className={`text-xs font-bold ${isApproved ? 'text-slate-800' : 'text-slate-400'}`}>Return Approved</p>
              {isApproved && <p className="text-[10px] text-slate-400 font-medium">09 Jun, 11:45 AM</p>}
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

        
        <div className="flex justify-end w-full mt-2">
          <button 
            type="button"
            onClick={() => navigate('/returns/history')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-xs transition-colors focus:outline-none"
          >
            <span>Go to History</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      
      {isApproved && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-3">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">Ready for Refund Processing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The Store Manager has approved the return request for <span className="font-semibold text-slate-700">{returnId}</span>. Please click 'Process Refund' to select the payment method and complete the transaction.
              </p>
            </div>
          </div>

          
          <div className="bg-blue-50/40 border-2 border-dashed border-blue-300 rounded-xl p-5 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
              <PlusSquare size={18} />
              <span>Add Refund Method</span>
            </div>
          </div>
          
        </div>
      )}

    </div>
  );
}