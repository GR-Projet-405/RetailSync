import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import Spinner from '../components/Spinner';

export default function ReturnSlipPage() {
  const { returnId } = useParams();
  const navigate = useNavigate();
  const [returnData, setReturnData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReturnDetails = async () => {
      try {
        const response = await api.get(`/returns-refunds/status/${returnId}`);
        if (response.data && response.data.data) {
          setReturnData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load return data");
      } finally {
        setIsLoading(false);
      }
    };
    if (returnId) fetchReturnDetails();
  }, [returnId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!returnData) {
    return <div className="py-10 text-center">Slip data not found.</div>;
  }

  const formatCurrency = (amount) => Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-GB');
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', '');
  };

  
  const subtotal = returnData.estimatedRefundTotal || 0;
  const taxAmount = subtotal * 0.15;
  const totalRefund = subtotal + taxAmount;
  const refundMethod = returnData.refundMethod || 'Original Method';

  
  const returnedItems = returnData.items?.length > 0 ? returnData.items : [
    { id: 1, name: 'Returned Item', qty: 1, price: subtotal, total: subtotal }
  ];

  
  const qrVerificationData = `Return ID: ${returnId}\nRefund Amount: Rs.${formatCurrency(totalRefund)}\nStatus: Refund Issued\nVerify: https://retailos.com/verify-return/${returnId}`;

  return (
    <div className="min-h-screen p-6 bg-slate-100 print:bg-white print:p-0 fade-in">
      
      {/* Top Action Bar (Hidden during print) */}
      <div className="flex items-center justify-between max-w-sm mx-auto mb-6 print:hidden">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-white border rounded-lg shadow-sm border-slate-300 hover:bg-slate-50 text-slate-700"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-colors bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
        >
          <Printer size={16} /> Print Slip
        </button>
      </div>

      {/* Thermal Receipt Container */}
      <div className="max-w-[380px] mx-auto bg-white p-8 rounded-xl shadow-xl print:shadow-none print:w-full border border-slate-100 print:border-none text-slate-800">

        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full text-emerald-600 bg-emerald-100 print:border print:border-slate-300">
            <RotateCcw size={24} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">RetailOS Pro</h1>
          <p className="text-sm font-bold tracking-wide uppercase text-emerald-600">Return & Refund Slip</p>
          <p className="mt-1 text-xs text-slate-500">Downtown Flagship Store</p>
          <p className="text-xs text-slate-500">123 Commerce Str, Colombo 03</p>
        </div>

        {/* Meta Info */}
        <div className="space-y-1 text-xs font-medium">
          <div className="flex justify-between"><span className="text-slate-500">Date & Time:</span> <span>{formatDate(returnData.updatedAt || returnData.createdAt)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Return ID:</span> <span className="font-bold">{returnId}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Orig. Receipt:</span> <span>{returnData.receiptId || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Manager:</span> <span>Authorized</span></div>
        </div>

        <div className="w-full my-4 border-b-2 border-dashed border-slate-200" />

        {/* Items Table Header */}
        <div className="flex justify-between mb-2 text-xs font-bold tracking-wider text-slate-400">
          <span>RETURNED ITEM</span>
          <span>AMOUNT (RS)</span>
        </div>

        {/* Items List */}
        <div className="space-y-3 text-sm">
          {returnedItems.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between">
              <div className="pr-2">
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-500">{item.returnQty || item.qty} x {formatCurrency(item.unitPrice || item.price)}</p>
              </div>
              <span className="font-semibold text-slate-800">{formatCurrency(item.total)}</span>
            </div>
          ))}
        </div>

        <div className="w-full my-4 border-b-2 border-dashed border-slate-200" />

        {/* Subtotals */}
        <div className="space-y-1.5 text-sm font-medium">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">VAT Refunded (15%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        </div>

        <div className="w-full my-4 border-b-2 border-dashed border-slate-200" />

        {/* Final Total */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-extrabold uppercase">TOTAL REFUND</span>
          <span className="text-xl font-extrabold text-blue-600">Rs. {formatCurrency(totalRefund)}</span>
        </div>

        {/* Payment Breakdown */}
        <div className="space-y-1 text-xs font-medium text-slate-600">
          <div className="flex justify-between">
            <span>Refund Method</span>
            <span className="font-bold uppercase text-slate-800">{refundMethod}</span>
          </div>
        </div>

        {/* Real Dynamic QR Code */}
        <div className="flex flex-col items-center mt-8">
          <div className="p-2 bg-white border rounded-lg border-slate-200">
            <QRCodeSVG
              value={qrVerificationData}
              size={96}
              level={"M"}
              includeMargin={false}
            />
          </div>
          <p className="mt-2 text-[10px] tracking-widest text-slate-500 font-mono">
            VERIFY-{returnId.split('-')[1]}
          </p>
        </div>

        {/* Footer Messages */}
        <div className="mt-6 space-y-1 text-center">
          <p className="text-xs font-semibold text-slate-800">We hope to see you again!</p>
          <p className="text-[10px] text-slate-500">Refund processing times may vary based on your bank.</p>
          <p className="text-[9px] text-slate-400 mt-2">System Generated Document</p>
        </div>

      </div>
    </div>
  );
}