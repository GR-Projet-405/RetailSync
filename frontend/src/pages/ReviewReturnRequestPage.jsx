import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from '../utils/toast';

export default function ReviewReturnRequestPage() {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [internalNotes, setInternalNotes] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/returns-refunds/status/${returnId}`);
        if (response.data.success) {
          setRequestData(response.data.data);
          if (response.data.data.internalNotes) {
            setInternalNotes(response.data.data.internalNotes);
          }
        }
      } catch (error) {
        toast.error('Failed to load return request details.');
        navigate('/returns-refunds');
      } finally {
        setIsLoading(false);
      }
    };

    if (returnId) {
      fetchRequestDetails();
    } else {
      setIsLoading(false);
      toast.error('No Return ID provided in the URL.');
    }
  }, [returnId, navigate]);

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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Approving...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

          await api.patch(`/returns-refunds/review/${returnId}`, {
            status: 'Approved',
            internalNotes: internalNotes,
            managerId: user?._id
          });

          Swal.close(); 
          toast.success('The return request has been successfully approved.');
          navigate(-1);

        } catch (error) {
          Swal.close();
          toast.error(error.response?.data?.message || 'Failed to approve request.');
        }
      }
    });
  };

  const handleReject = () => {
    if (!internalNotes.trim()) {
      toast.error('Please provide internal notes before rejecting. (Reason for rejection)');
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({ title: 'Rejecting...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

          await api.patch(`/returns-refunds/review/${returnId}`, {
            status: 'Rejected',
            internalNotes: internalNotes,
            managerId: user?._id
          });

          Swal.close(); 
          toast.success('The return request has been rejected.');
          navigate(-1);

        } catch (error) {
          Swal.close();
          toast.error(error.response?.data?.message || 'Failed to reject request.');
        }
      }
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>;
  }

  if (!requestData) {
    return <div className="p-10 font-bold text-center text-red-500">Invalid Return ID or Data not found.</div>;
  }

  const firstItem = requestData.items?.[0] || {};

  return (
    <div className="p-6 mx-auto space-y-6 max-w-7xl fade-up">

      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">Review Return Request</h1>
        </div>
        {requestData.status === 'Pending' ? (
          <div className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 border border-amber-200">
            <AlertTriangle size={16} /> Action Required
          </div>
        ) : (
          <div className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 border border-slate-200">
            Status: {requestData.status}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        <div className="space-y-6 lg:col-span-2">

          <div className="overflow-hidden bg-white border shadow-sm border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Items to Inspect ({requestData.items?.length || 0} items)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-bold uppercase bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-6 py-3">SKU</th>
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3 text-center">Original Qty</th>
                    <th className="px-6 py-3 text-center">Return Qty</th>
                    <th className="px-6 py-3">Condition / Reason</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="font-medium divide-y divide-slate-100">
                  {requestData.items?.map((item, index) => (
                    <tr key={index} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-400">{item.sku}</td>
                      <td className="px-6 py-4 text-slate-800">{item.name}</td>
                      <td className="px-6 py-4 text-center">{item.originalQty}</td>
                      <td className="px-6 py-4 font-bold text-center text-blue-600">{item.returnQty}</td>
                      <td className="px-6 py-4 font-semibold text-red-500">{item.condition} - {item.reason}</td>
                      <td className="px-6 py-4 font-bold text-right text-slate-800">Rs. {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end px-6 py-4 border-t bg-slate-50 border-slate-100">
              <div className="text-right">
                <p className="mb-1 text-xs font-bold uppercase text-slate-500">Total Requested Refund:</p>
                <p className="text-xl font-extrabold text-blue-600">Rs. {requestData.estimatedRefundTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl">
            <h2 className="mb-6 text-lg font-bold text-slate-800">Provided Evidence for: <span className="text-blue-600">{firstItem.name}</span></h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Customer Report</h3>
                <div className="p-4 text-sm italic border rounded-lg bg-slate-50 border-slate-100 text-slate-700">
                  "{firstItem.reason} - {firstItem.comments || 'No additional comments provided.'}"
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400">Attached Photos (1)</h3>
                <div className="flex items-center gap-3">
                  {firstItem.photoProofUrl ? (
                    <img src={firstItem.photoProofUrl} alt="Proof" className="object-cover w-16 h-16 border rounded-lg shadow-sm border-slate-200" />
                  ) : (
                    <div className="flex items-center justify-center w-16 h-16 border-2 border-dashed rounded-lg border-slate-200 text-slate-400">
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">

          <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Transaction Info</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Receipt ID</span>
                <span className="text-sm font-bold text-blue-600">{requestData.receiptId}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Customer</span>
                <span className="text-sm font-bold text-slate-800">{requestData.customerName}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Purchase Date</span>
                <span className="text-sm font-bold text-slate-800">
                  {new Date(requestData.purchaseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Requested Date</span>
                <span className="text-sm font-bold text-slate-800">
                  {new Date(requestData.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Original Cashier</span>
                <div className="text-right">
                  <span className="block text-sm font-bold text-slate-800">{requestData.cashierName}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-slate-500">Total Requested Refund</span>
                <span className="text-base font-extrabold text-blue-600">Rs. {requestData.estimatedRefundTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border shadow-sm border-slate-200 rounded-xl">
            <h2 className="mb-4 text-lg font-bold text-slate-800">Manager Action</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-xs font-bold text-slate-500">Internal Notes</label>
                <textarea
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow min-h-[100px]"
                  placeholder="Enter approval/rejection notes..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  disabled={requestData.status !== 'Pending'}
                ></textarea>
              </div>

              {requestData.status === 'Pending' && (
                <div className="pt-2 space-y-3">
                  <button
                    onClick={handleApprove}
                    className="w-full px-4 py-3 font-bold text-white transition-colors bg-green-800 rounded-lg shadow-sm hover:bg-green-900"
                  >
                    Approve Return
                  </button>
                  <button
                    onClick={handleReject}
                    className="w-full px-4 py-3 font-bold text-red-600 transition-colors bg-white border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}