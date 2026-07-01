import React, { useState } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

export default function ReviewReturnRequestPage() {
  
  const [internalNotes, setInternalNotes] = useState('');

  
  const handleApprove = () => {
    Swal.fire({
      title: 'Approve Return?',
      text: "Are you sure you want to approve this return request?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#166534', 
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, Approve Request',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        
        Swal.fire(
          'Approved!',
          'The return request has been successfully approved.',
          'success'
        );
      }
    });
  };

  
  const handleReject = () => {
    if (!internalNotes) {
      Swal.fire('Error', 'Please provide internal notes before rejecting.', 'error');
      return;
    }

    Swal.fire({
      title: 'Reject Return?',
      text: "Are you sure you want to reject this request? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', 
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, Reject Request'
    }).then((result) => {
      if (result.isConfirmed) {
         
        Swal.fire(
          'Rejected!',
          'The return request has been rejected.',
          'success'
        );
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Review Return Request</h1>
        </div>
        <div className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 border border-amber-200">
          <AlertTriangle size={16} />
          Action Required
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        
        <div className="lg:col-span-2 space-y-6">
          
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Items to Inspect (2 items)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3 text-center">Original Qty</th>
                    <th className="px-6 py-3 text-center">Return Qty</th>
                    <th className="px-6 py-3">Condition / Reason</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400">1002</td>
                    <td className="px-6 py-4 text-slate-800">Logitech MX Master 3S</td>
                    <td className="px-6 py-4 text-center">1</td>
                    <td className="px-6 py-4 text-center font-bold">1</td>
                    <td className="px-6 py-4 text-red-500 font-semibold">Opened - Defective</td>
                    <td className="px-6 py-4 text-right text-blue-600 font-bold">Rs. 11,000.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400">5044</td>
                    <td className="px-6 py-4 text-slate-800">Anker USB-C Braided Cable</td>
                    <td className="px-6 py-4 text-center">2</td>
                    <td className="px-6 py-4 text-center font-bold">1</td>
                    <td className="px-6 py-4 text-red-500 font-semibold">Opened - Defective</td>
                    <td className="px-6 py-4 text-right text-blue-600 font-bold">Rs. 4,200.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <div className="text-right">
                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Requested Refund:</p>
                <p className="text-xl font-extrabold text-blue-600">Rs. 15,200.00</p>
              </div>
            </div>
          </div>

          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Provided Evidence for: <span className="text-blue-600">Logitech MX Master 3S</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Report</h3>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-700 italic">
                  "Defective / Damaged Product - The scroll wheel is completely stuck and not responding."
                </div>
              </div>

              
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Photos (2)</h3>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 border-2 border-slate-200 rounded-lg flex items-center justify-center text-blue-500 hover:border-blue-500 cursor-pointer transition-colors">
                    <ImageIcon size={24} />
                  </div>
                  <div className="w-16 h-16 border-2 border-slate-200 rounded-lg flex items-center justify-center text-blue-500 hover:border-blue-500 cursor-pointer transition-colors">
                    <ImageIcon size={24} />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                   <button className="p-1 border border-slate-200 rounded hover:bg-slate-50"><ChevronLeft size={16}/></button>
                   <button className="p-1 border border-slate-200 rounded hover:bg-slate-50"><ChevronRight size={16}/></button>
                </div>
              </div>
            </div>
          </div>

        </div>

        
        <div className="space-y-6">
          
          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Transaction Info</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Receipt ID</span>
                <span className="text-sm font-bold text-blue-600">TXN-88492A</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Customer</span>
                <span className="text-sm font-bold text-slate-800">Nimal Silva</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Purchase Date</span>
                <span className="text-sm font-bold text-slate-800">09 Jun 2026</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Requested Date</span>
                <span className="text-sm font-bold text-slate-800">09 Jun 2026, 10:30 AM</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Requested By</span>
                <div className="text-right">
                  <span className="block text-sm font-bold text-slate-800">Nuwan Silva</span>
                  <span className="block text-xs text-slate-400">Cashier</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-slate-500 font-medium">Total Requested Refund</span>
                <span className="text-base font-extrabold text-blue-600">Rs. 15,200.00</span>
              </div>
            </div>
          </div>

          
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Manager Action</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Internal Notes</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow min-h-[100px]"
                  placeholder="Enter approval/rejection notes..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                ></textarea>
              </div>
              
              <div className="space-y-3 pt-2">
                <button 
                  onClick={handleApprove}
                  className="w-full bg-green-800 hover:bg-green-900 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Approve Return
                </button>
                <button 
                  onClick={handleReject}
                  className="w-full bg-white hover:bg-red-50 text-red-600 font-bold py-3 px-4 rounded-lg transition-colors border border-red-200"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}