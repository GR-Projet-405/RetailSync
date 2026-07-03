import React, { useState } from 'react';
import { Calculator, Check, ChevronDown, Banknote, CreditCard, Info, RotateCcw } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

export default function ProcessRefundPage() {
  const { returnId = "RET-0091" } = useParams();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('');

  
  const handleIssueRefund = () => {
    if (!selectedMethod) {
      Swal.fire({
        icon: 'warning',
        title: 'Method Not Selected',
        text: 'Please select a refund destination method to proceed.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    
    Swal.fire({
      title: 'Refund Processed!',
      text: `Processing Rs. 17,480.00 refund via ${selectedMethod.toUpperCase()}...`,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#2563eb',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/returns/status/${returnId}`, { 
          state: { status: 'Completed' } 
        });
      }
    });

  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto fade-up">
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Process Refund</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Calculate amount and select refund destination.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5 font-bold text-slate-800 text-base">
              <Calculator size={20} className="text-blue-600" />
              <span>Refund Calculation</span>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
              <Check size={14} strokeWidth={3} /> Return Approved
            </span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Receipt ID: <span className="text-blue-600 font-bold cursor-pointer hover:underline">TXN-88492A</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden mt-3 text-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ITEM & SKU</th>
                  <th className="py-3 px-4 text-center">ORIGINAL QTY</th>
                  <th className="py-3 px-4 text-center">RETURN QTY</th>
                  <th className="py-3 px-4 text-right">UNIT PRICE</th>
                  <th className="py-3 px-4 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">Logitech MX Master 3S</div>
                    <div className="text-xs text-slate-400 font-normal">SKU: 1002</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">1</td>
                  <td className="py-3.5 px-4 text-center">1</td>
                  <td className="py-3.5 px-4 text-right">Rs. 11,000.00</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800">Rs. 11,000.00</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">Anker USB-C Braided Cable</div>
                    <div className="text-xs text-slate-400 font-normal">SKU: 5044</div>
                  </td>
                  <td className="py-3.5 px-4 text-center">2</td>
                  <td className="py-3.5 px-4 text-center">1</td>
                  <td className="py-3.5 px-4 text-right">Rs. 4,200.00</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-800">Rs. 4,200.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 pt-3 px-1 text-sm">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Returned Items Subtotal</span>
              <span className="font-bold text-slate-800">Rs. 15,200.00</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Tax Refundable (VAT 15%)</span>
              <span className="font-bold text-slate-800">Rs. 2,280.00</span>
            </div>
          </div>

          <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 flex items-center justify-between mt-4">
            <span className="font-bold text-xs uppercase tracking-wider text-blue-600">TOTAL REFUND</span>
            <span className="font-bold text-xl text-blue-600">Rs. 17,480.00</span>
          </div>

        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          
          <div>
            <h2 className="text-lg font-bold text-slate-800">Refund Destination</h2>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2">
              SELECT METHOD
            </label>

            <div className="border border-blue-400 rounded-t-xl bg-blue-50/20 px-4 py-3 flex justify-between items-center text-slate-600 text-sm font-medium">
              <span>Select refund method</span>
              <ChevronDown size={18} className="text-slate-500" />
            </div>

            <div className="border-x border-b border-slate-200 rounded-b-xl p-3 space-y-4 max-h-[360px] overflow-y-auto">
              
              <div>
                <div className="text-xs font-bold text-blue-600 px-1 mb-1.5">Cash Methods</div>
                <div 
                  onClick={() => setSelectedMethod('cash')}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'cash' ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    <Banknote size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Cash</div>
                    <div className="text-xs text-slate-400 font-medium">Refund via cash</div>
                  </div>
                </div>
              </div>

            
              <div>
                <div className="text-xs font-bold text-blue-600 px-1 mb-1.5">Card Methods</div>
                <div 
                  onClick={() => setSelectedMethod('card')}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-slate-50'}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Card (Visa *****4242)</div>
                    <div className="text-xs text-slate-400 font-medium">Refund to the original card</div>
                  </div>
                </div>
              </div>

            
              <div>
                <div className="text-xs font-bold text-blue-600 px-1 mb-1.5">Digital Wallets</div>
                <div className="space-y-1">
                  
                
                  <div 
                    onClick={() => setSelectedMethod('ezcash')}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'ezcash' ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-yellow-400 text-red-900 flex items-center justify-center shrink-0 font-extrabold text-[10px] italic tracking-tighter">
                      EzCash
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">EzCash</div>
                      <div className="text-xs text-slate-400 font-medium">Refund via EzCash wallet</div>
                    </div>
                  </div>

            
                  <div 
                    onClick={() => setSelectedMethod('mcash')}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'mcash' ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
                      mCash
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">mCash</div>
                      <div className="text-xs text-slate-400 font-medium">Refund via mCash wallet</div>
                    </div>
                  </div>

                
                  <div 
                    onClick={() => setSelectedMethod('frimi')}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'frimi' ? 'border-blue-500 bg-blue-50/30' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 font-extrabold text-[11px] italic">
                      FriMi
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">FriMi</div>
                      <div className="text-xs text-slate-400 font-medium">Refund via FriMi wallet</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          <div className="space-y-4 pt-2">
        
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600 font-medium">
              <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <span>Please select a refund destination method to view the processing timeline.</span>
            </div>

            
            <button 
              type="button"
              onClick={handleIssueRefund}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm transition-colors cursor-pointer"
            >
              <RotateCcw size={18} />
              <span>Issue Rs. 17,480.00 Refund</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}