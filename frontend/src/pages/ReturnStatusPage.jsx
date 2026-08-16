import React, { useState, useEffect } from 'react';
import { Check, Clock, ArrowRight, CheckCircle2, Info, PlusSquare, Printer, AlertCircle, Trophy } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/Spinner';
import toast from '../utils/toast';

export default function ReturnStatusPage() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { returnId: paramId } = useParams();

  const returnId = paramId || "RET-0091";

  const [dbStatus, setDbStatus] = useState('Pending');
  const [refundAmount, setRefundAmount] = useState(0);
  const [internalNotes, setInternalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  const fetchReturnStatus = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/returns-refunds/status/${returnId}`);

      if (response.data && response.data.data) {
        const returnData = response.data.data;

        if (returnData.status === 'Ready for Refund Processing') {
          setDbStatus('Pending');
        } else {
          setDbStatus(returnData.status);
        }

        setRefundAmount(returnData.estimatedRefundTotal || 0);
        setInternalNotes(returnData.internalNotes || '');
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Tracking API Error:", error);
      const errorMsg = error.response?.data?.message || "Failed to load live tracking data.";
      setApiError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnStatus();
  }, [returnId, location]);

  const isApproved = dbStatus === 'Approved' || dbStatus === 'Refund Issued' || dbStatus === 'Completed';
  const isCompleted = dbStatus === 'Refund Issued' || dbStatus === 'Completed';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white border rounded-xl border-slate-200">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-slate-500">Fetching live return progress...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-red-100 rounded-xl">
        <div className="flex items-center justify-center w-12 h-12 mb-3 text-red-500 rounded-full bg-red-50">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-800">Tracking Unsuccessful</h3>
        <p className="max-w-sm mt-1 text-xs text-slate-500">{apiError}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 mt-4 text-xs font-semibold text-white bg-blue-600 rounded-lg">
          Retry Tracking
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl p-6 mx-auto space-y-6 fade-up">

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Track Return Status</h1>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Live progress tracking for Return ID: <span className="font-bold text-blue-600">{returnId}</span>
        </p>
      </div>

      {dbStatus === 'Rejected' && internalNotes && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-in fade-in duration-500">
          <AlertCircle className="text-red-600 shrink-0" size={24} />
          <div>
            <h3 className="text-sm font-bold text-red-800">Action Required: Request Rejected</h3>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              <span className="font-bold">Manager's Note:</span> {internalNotes}
            </p>
          </div>
        </div>
      )}

      <div className="relative flex flex-col justify-between p-10 bg-white border shadow-sm border-slate-100 rounded-xl">

        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold text-slate-800">Return Status for {returnId}</h2>

          {isCompleted ? (
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-semibold text-xs">
              <CheckCircle2 size={15} />
              <span>Completed Successfully</span>
            </div>
          ) : isApproved ? (
            <div className="flex items-center justify-center gap-1.5 text-blue-600 font-semibold text-xs">
              <CheckCircle2 size={14} />
              <span>Return Approved & Ready for Refund</span>
            </div>
          ) : dbStatus === 'Rejected' ? (
            <div className="flex items-center justify-center gap-1.5 text-red-600 font-semibold text-xs">
              <AlertCircle size={14} />
              <span>Return Request Rejected by Manager</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-amber-500 font-semibold text-xs">
              <Clock size={14} className="animate-pulse" />
              <span>Pending Manager Approval</span>
            </div>
          )}
        </div>

        <div className="relative flex items-start justify-between w-full max-w-3xl mx-auto my-12">

          <div className="relative flex flex-col items-center flex-1 group">
            <div className="z-10 flex items-center justify-center w-10 h-10 text-white rounded-full shadow-sm bg-emerald-500">
              <Check size={20} strokeWidth={3} />
            </div>
            <div className="absolute top-5 left-1/2 w-full h-[3px] bg-blue-600 -z-0"></div>
            <div className="text-center mt-3 space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Request Submitted</p>
              <p className="text-[10px] text-slate-400 font-medium">Live System</p>
            </div>
          </div>

          <div className="relative flex flex-col items-center flex-1 group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white z-10 shadow-sm ${dbStatus === 'Rejected' ? 'bg-red-500' : 'bg-emerald-500'}`}>
              {dbStatus === 'Rejected' ? <AlertCircle size={20} /> : <Check size={20} strokeWidth={3} />}
            </div>
            <div className={`absolute top-5 left-1/2 w-full ${isApproved ? 'h-[3px] bg-blue-600' : 'h-[2px] border-t-2 border-dashed border-slate-200'} -z-0`}></div>
            <div className="text-center mt-3 space-y-0.5">
              <p className="text-xs font-bold text-slate-800">Item Inspected</p>
              <p className="text-[10px] text-slate-400 font-medium">Verified</p>
            </div>
          </div>

          <div className="relative flex flex-col items-center flex-1 group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm ${isApproved ? 'bg-emerald-500 text-white' : 'bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold text-sm'}`}>
              {isApproved ? <Check size={20} strokeWidth={3} /> : '3'}
            </div>
            <div className={`absolute top-5 left-1/2 w-full ${isCompleted ? 'h-[3px] bg-blue-600' : 'h-[2px] border-t-2 border-dashed border-slate-200'} -z-0`}></div>
            <div className="text-center mt-3 space-y-0.5">
              <p className={`text-xs font-bold ${isApproved ? 'text-slate-800' : 'text-slate-400'}`}>Return Approved</p>
            </div>
          </div>

          <div className="relative flex flex-col items-center flex-1 group">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm transition-all ${isCompleted ? 'bg-emerald-500 text-white ring-4 ring-emerald-100' : 'bg-slate-100 border-2 border-slate-200 text-slate-700 font-bold text-sm'}`}>
              {isCompleted ? <Trophy size={18} strokeWidth={2.5} /> : '4'}
            </div>
            <div className="text-center mt-3 space-y-0.5">
              <p className={`text-xs font-bold ${isCompleted ? 'text-emerald-500 font-extrabold' : 'text-slate-400'}`}>Refund Issued</p>
            </div>
          </div>

        </div>

        <div className="flex justify-end w-full mt-2">
          <button
            type="button"
            onClick={() => navigate('/returns/history')}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 transition-colors cursor-pointer hover:text-blue-700 focus:outline-none"
          >
            <span>Go to History</span>
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isCompleted ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="p-5 space-y-2 border shadow-sm bg-emerald-50/30 border-emerald-200/80 rounded-xl">
            <h3 className="text-sm font-bold text-emerald-900">Refund Successful</h3>
            <p className="text-xs font-normal leading-relaxed text-slate-600">
              An amount of <span className="font-bold text-slate-800">Rs. {refundAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> has been successfully credited back to the customer. An automated receipt has been updated in the multi-branch retail ledger.
            </p>
          </div>

          <div
            onClick={() => navigate(`/returns/slip/${returnId}`)}
            className="flex items-center justify-center p-5 transition-colors bg-white border-2 border-dashed shadow-sm cursor-pointer border-slate-300 rounded-xl hover:bg-slate-50"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
              <Printer size={18} />
              <span>Print Return Slip</span>
            </div>
          </div>
        </div>

      ) : dbStatus === 'Approved' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-start gap-3 p-5 bg-white border shadow-sm border-slate-200 rounded-xl">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">Ready for Refund Processing</h3>
              <p className="text-xs leading-relaxed text-slate-500">
                The Store Manager has approved the return request for <span className="font-semibold text-slate-700">{returnId}</span>. Please click 'Process Refund' to select the payment method and complete the transaction.
              </p>
            </div>
          </div>

          <div
            onClick={() => navigate(`/returns/process-refund/${returnId}`)}
            className="flex items-center justify-center p-5 transition-colors border-2 border-blue-300 border-dashed cursor-pointer bg-blue-50/40 rounded-xl hover:bg-blue-50"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <PlusSquare size={18} />
              <span>Add Refund Method</span>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}