import React, { useState, useEffect } from 'react';
import { Calculator, Check, Banknote, CreditCard, Info, RotateCcw, Loader2, ShieldAlert, Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '../services/api';
import toast from '../utils/toast'; 

export default function ProcessRefundPage() {
  const { returnId } = useParams();
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRefundDetails = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/returns-refunds/status/${returnId}`);
        if (response.data.success) {
          const data = response.data.data;
          if (data.status === 'Refund Issued' || data.status === 'Completed') {
            toast.info(`This return (${returnId}) has already been refunded.`);
            navigate(`/returns/status/${returnId}`);
            return;
          }
          setRequestData(data);
          if (data.originalPaymentMethod) {
            setSelectedMethod(data.originalPaymentMethod);
          } else {
            setSelectedMethod('cash'); 
          }
        }
      } catch (error) {
        toast.error('Failed to load refund details.');
        navigate('/returns/history');
      } finally {
        setIsLoading(false);
      }
    };

    if (returnId) fetchRefundDetails();
  }, [returnId, navigate]);

  const handleIssueRefund = async () => {
    if (!selectedMethod) {
      toast.warning('Please select a refund destination method to proceed.');
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Manager Authorization Required',
      icon: 'warning',
      html: `
        <div style="text-align: left; font-size: 13px; color: #475569; margin-bottom: 15px; background: #fef2f2; padding: 10px; border-radius: 8px; border: 1px solid #fecaca;">
          <strong>Security Notice:</strong> Issuing refunds requires a branch manager's verification. Please ask the manager to enter their credentials below.
        </div>
        <input id="swal-email" type="email" class="swal2-input" placeholder="Manager Email" style="font-size: 14px;">
        <input id="swal-password" type="password" class="swal2-input" placeholder="Manager Password" style="font-size: 14px;">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Authorize & Refund',
      confirmButtonColor: '#166534',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
        const email = document.getElementById('swal-email').value;
        const password = document.getElementById('swal-password').value;
        if (!email || !password) {
          Swal.showValidationMessage('Both email and password are required!');
        }
        return { email, password };
      }
    });

    if (!formValues) return;

    try {
      Swal.fire({ title: 'Authorizing & Processing...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      await api.patch(`/returns-refunds/refund/${returnId}`, {
        refundMethod: selectedMethod,
        managerEmail: formValues.email,
        managerPassword: formValues.password
      });

      Swal.close(); 
      toast.success(`Successfully processed Rs. ${requestData?.estimatedRefundTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} refund via ${selectedMethod.toUpperCase()}.`);

      navigate(`/returns/status/${returnId}`, {
        state: { status: 'Refund Issued' }
      });

    } catch (error) {
      Swal.close();
      toast.error(error.response?.data?.message || 'Invalid manager credentials or failed to process refund.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>;
  }

  if (!requestData) return null;

  const total = requestData.estimatedRefundTotal || 0;
  const subtotal = total / 1.15;
  const taxAmount = total - subtotal;

  const origMethod = requestData.originalPaymentMethod || 'cash';

  return (
    <div className="p-6 mx-auto space-y-6 max-w-7xl fade-up">

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Process Refund</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Calculate amount and verify refund destination.
        </p>
      </div>

      <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-12">

        <div className="p-6 space-y-4 bg-white border shadow-sm lg:col-span-7 border-slate-200 rounded-xl">

          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5 font-bold text-slate-800 text-base">
              <Calculator size={20} className="text-blue-600" />
              <span>Refund Calculation</span>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">
              <Check size={14} strokeWidth={3} /> Return Approved
            </span>
          </div>

          <div className="text-xs font-medium text-slate-500">
            Receipt ID: <span className="font-bold text-blue-600 cursor-pointer hover:underline">{requestData.receiptId}</span>
          </div>

          <div className="mt-3 overflow-hidden text-sm border border-slate-200 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ITEM & SKU</th>
                  <th className="px-4 py-3 text-center">ORIGINAL QTY</th>
                  <th className="px-4 py-3 text-center">RETURN QTY</th>
                  <th className="px-4 py-3 text-right">UNIT PRICE</th>
                  <th className="px-4 py-3 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="font-medium divide-y divide-slate-100 text-slate-700">
                {requestData.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-xs font-normal text-slate-400">SKU: {item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">{item.originalQty}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600">{item.returnQty}</td>
                    <td className="py-3.5 px-4 text-right">Rs. {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">Rs. {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-1 pt-3 space-y-2 text-sm">
            <div className="flex justify-between font-medium text-slate-500">
              <span>Returned Items Subtotal</span>
              <span className="font-bold text-slate-800">Rs. {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-500">
              <span>Tax Refundable (VAT 15%)</span>
              <span className="font-bold text-slate-800">Rs. {taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 mt-4 border border-blue-200 bg-blue-50/40 rounded-xl">
            <span className="text-xs font-bold tracking-wider text-blue-600 uppercase">TOTAL REFUND</span>
            <span className="text-xl font-bold text-blue-600">Rs. {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

        </div>

        <div className="flex flex-col justify-between p-6 space-y-4 bg-white border shadow-sm lg:col-span-5 border-slate-200 rounded-xl">

          <div>
            <h2 className="text-lg font-bold text-slate-800">Refund Destination</h2>

            <div className="flex items-start gap-2 p-3 mt-3 text-xs text-blue-800 border border-blue-100 rounded-lg bg-blue-50">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>
                To prevent fraud and maintain financial integrity, refunds are strictly locked to the original payment method used during the transaction.
              </p>
            </div>

            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">
              AUTHORIZED METHOD
            </label>

            <div className="flex items-center justify-between px-4 py-3 text-sm font-bold border border-emerald-400 rounded-t-xl bg-emerald-50/40 text-emerald-700">
              <span>Locked to Original Method</span>
              <Lock size={16} className="text-emerald-600" />
            </div>

            <div className="p-3 space-y-4 border-b border-x border-slate-200 rounded-b-xl bg-slate-50/30">

              {origMethod === 'cash' && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-500 bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 font-bold rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                      <Banknote size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Cash Refund</div>
                      <div className="text-xs font-medium text-slate-500">Issue from cash drawer</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold uppercase">Original</span>
                </div>
              )}

              {origMethod === 'card' && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-500 bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 font-bold text-blue-600 bg-blue-100 rounded-lg shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Card Reversal</div>
                      <div className="text-xs font-medium text-slate-500">Card {requestData.cardLastFourDigits ? `(****${requestData.cardLastFourDigits})` : ''}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold uppercase">Original</span>
                </div>
              )}

              {['ezcash', 'mcash', 'frimi', 'qr'].includes(origMethod) && (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-500 bg-blue-50/50">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 font-bold text-purple-600 bg-purple-100 rounded-lg shrink-0">
                      {origMethod.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">Digital Wallet Reversal</div>
                      <div className="text-xs font-medium text-slate-500">Refund to {origMethod.toUpperCase()} wallet</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold uppercase">Original</span>
                </div>
              )}

            </div>
          </div>

          <div className="pt-2 space-y-4">
            <button
              type="button"
              onClick={handleIssueRefund}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
            >
              <ShieldAlert size={18} className="text-white/80" />
              <span>Authorize & Issue Rs. {total.toLocaleString('en-US', { minimumFractionDigits: 2 })} Refund</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}