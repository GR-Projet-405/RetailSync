import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { Search, Package, AlertCircle, Send, Barcode, HelpCircle, UploadCloud, Check, Save } from 'lucide-react';

// රූපයේ ඇති භාණ්ඩ 4 ම නිවැරදිව
const RECEIPT_ITEMS = [
  { sku: '1002', name: 'Logitech MX Master 3S', unitPrice: 11000.00, originalQty: 1 },
  { sku: '5044', name: 'Anker USB-C Braided Cable', unitPrice: 4200.00, originalQty: 2 },
  { sku: '2045', name: 'Keychron K2 Wireless Keyboard', unitPrice: 18500.00, originalQty: 1 },
  { sku: '3092', name: 'Ugreen 6-in-1 USB-C Hub', unitPrice: 7200.00, originalQty: 2 },
];

export default function ReturnsRefundsPage() {
  const [receiptId, setReceiptId] = useState('');
  
  // 'IDLE' | 'ERROR' | 'VALID'
  const [uiState, setUiState] = useState('IDLE');

  // රූපයේ පෙනෙන පරිදි මුල් භාණ්ඩ 2ක Checkbox සිලෙක්ට් වී ඇත
  const [selectedSkus, setSelectedSkus] = useState([]);

  const handleVerify = () => {
    const cleanId = receiptId.trim().toUpperCase();
    if (cleanId === 'TXN-88498B') {
      setUiState('ERROR');
    } else if (cleanId === 'TXN-88492A') {
      setUiState('VALID');
      // රූපයේ හැටියට මුල් අයිටම් 2 සිලෙක්ට් කර පෙන්වීමට
      setSelectedSkus(['1002', '5044']);
    } else {
      setUiState('IDLE');
    }
  };

  const handleTryAnother = () => {
    setUiState('IDLE');
    setReceiptId('');
    setSelectedSkus([]);
  };

  const toggleSelect = (sku) => {
    if (selectedSkus.includes(sku)) {
      setSelectedSkus(selectedSkus.filter(id => id !== sku));
    } else {
      setSelectedSkus([...selectedSkus, sku]);
    }
  };

  return (
    <div className="space-y-5 fade-up pt-2 pb-10">
      
      {/* 1. Page Header (No Breadcrumb) */}
      <PageHeader
        title="Initiate Return"
        description="Verify receipt ID, select items to return, and state the reason."
      />

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        {/* ── LEFT COLUMN (Spans 2) ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Verification Input Card */}
          <Card>
            <CardContent className="pt-6">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Scan or Enter Receipt ID
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  {(uiState === 'ERROR' || uiState === 'VALID') && (
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      <Barcode size={18} className="text-slate-400 opacity-70" />
                    </div>
                  )}
                  <input 
                    type="text" 
                    value={receiptId}
                    onChange={(e) => setReceiptId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder=""
                    className={`w-full text-sm rounded-lg border border-slate-200 bg-white py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono ${
                      uiState !== 'IDLE' ? 'pl-11 pr-3.5' : 'px-3.5'
                    }`}
                  />
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleVerify}
                  className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all focus:ring-0 focus:outline-none focus-visible:outline-none"
                >
                  <Search size={16} className="mr-2" />
                  Verify
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* ── ERROR ALERT STATE BAR ── */}
          {uiState === 'ERROR' && (
            <div className="bg-red-50/60 border border-red-200 rounded-xl p-4 flex gap-3 text-red-900 fade-up">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-red-950 tracking-wide">Validation Error: 30-Day Return Limit Exceeded</h4>
                <p className="text-xs text-red-700 font-medium leading-relaxed max-w-2xl">
                  The transaction associated with this receipt has exceeded the maximum 30-day return window. According to system policy, returns and refunds are only permitted within 30 days of the original purchase. Please verify the purchase date on the physical receipt.
                </p>
              </div>
            </div>
          )}

          {/* Select Items Card */}
          <Card className="flex-1 flex flex-col justify-between min-h-[460px]">
            <div>
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
                  <Package className="w-5 h-5 text-blue-600" />
                  Select Items
                </CardTitle>
                {uiState === 'VALID' && (
                  <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-md border border-blue-100">
                    Date: 09 Jun 2026
                  </span>
                )}
              </CardHeader>

              <CardContent className="p-0">
                {uiState === 'IDLE' && (
                  <div className="flex flex-col items-center justify-center text-center py-16 mt-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100/80 flex items-center justify-center mb-4">
                      <AlertCircle size={28} className="text-slate-400" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">Ready to Verify</h3>
                    <p className="text-sm text-slate-500 max-w-[320px] mx-auto leading-relaxed">
                      Please click the 'Verify' button to validate the entered Receipt ID and load the purchased items.
                    </p>
                  </div>
                )}

                {uiState === 'ERROR' && (
                  <div className="p-5">
                    <div className="bg-slate-100/70 border border-slate-200/50 rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[220px] mt-2 fade-up">
                      <AlertCircle size={26} className="text-red-500 mb-3" />
                      <p className="text-xs font-semibold text-slate-500 max-w-[340px] leading-relaxed">
                        This receipt cannot be loaded as it has exceeded the maximum 30-day return window.
                      </p>
                    </div>
                  </div>
                )}

                {uiState === 'VALID' && (
                  /* VALID RECEIPT TABLE VIEW */
                  <div className="overflow-x-auto fade-up">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 pl-5 pr-2 w-10"></th>
                          <th className="py-3 px-3 text-xs">Item Details</th>
                          <th className="py-3 px-3 text-center text-xs">Original Qty</th>
                          <th className="py-3 px-3 text-center text-xs">Return Qty</th>
                          <th className="py-3 px-3 text-right text-xs">Unit Price</th>
                          <th className="py-3 px-3 text-right text-xs">Total</th>
                          <th className="py-3 px-5 text-center text-xs">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {RECEIPT_ITEMS.map((item) => {
                          const isChecked = selectedSkus.includes(item.sku);
                          // රූපයේ හැටියට මුල් දෙක විතරක් Added, අනෙක්වා Add Details
                          const isAddedMode = item.sku === '1002' || item.sku === '5044';
                          
                          return (
                            <tr key={item.sku} className={`hover:bg-slate-50/40 transition-colors ${isChecked ? 'bg-blue-50/20' : ''}`}>
                              {/* Checkbox */}
                              <td className="py-4 pl-5 pr-2 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => toggleSelect(item.sku)}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              {/* Item Details */}
                              <td className="py-4 px-3">
                                <div className="font-bold text-slate-800">{item.name}</div>
                                <div className="text-[11px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</div>
                              </td>
                              {/* Original Qty */}
                              <td className="py-4 px-3 text-center font-medium text-slate-800">
                                {item.originalQty}
                              </td>
                              {/* Return Qty Dropdown */}
                              <td className="py-4 px-3 text-center">
                                <div className="inline-block relative">
                                  <select className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 min-w-[50px]">
                                    <option>1</option>
                                    {item.originalQty > 1 && <option>2</option>}
                                  </select>
                                  <div className="text-[9px] text-slate-400 mt-0.5">Max: {item.originalQty}</div>
                                </div>
                              </td>
                              {/* Unit Price */}
                              <td className="py-4 px-3 text-right font-medium text-slate-600">
                                Rs. {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              {/* Total Price */}
                              <td className="py-4 px-3 text-right font-bold text-blue-600">
                                Rs. {(isChecked ? item.unitPrice : 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              {/* Details Action Button */}
                              <td className="py-4 px-5 text-center">
                                {isAddedMode ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md border border-emerald-200">
                                    <Check size={11} strokeWidth={3} /> Added
                                  </span>
                                ) : (
                                  <button className="inline-flex items-center bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-200/60 transition-colors">
                                    🖊️ Add Details
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Bottom Selected Items Row */}
                    <div className="flex justify-between items-center px-5 py-4 bg-slate-50/50 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Items Selected</span>
                        <span className="font-bold text-slate-800">2 of 4 items</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Estimated Refund Total</span>
                        <span className="font-black text-sm text-blue-600">Rs. 15,200.00</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </div>

            {/* Bottom Action Buttons & Blue Info Tag */}
            <div className="p-5 pt-2 space-y-3">
              {uiState === 'VALID' && (
                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-center text-slate-600 text-xs font-medium fade-up">
                  <HelpCircle size={15} className="text-blue-500 flex-shrink-0" />
                  <span>You can return up to the original quantity purchased for each item.</span>
                </div>
              )}

              <Button 
                variant={uiState === 'VALID' ? 'primary' : 'outline'} 
                className={`w-full h-11 border-transparent font-semibold shadow-none text-sm transition-all ${
                  uiState === 'VALID' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-slate-400 text-white opacity-80 cursor-not-allowed hover:bg-slate-400'
                }`}
                disabled={uiState !== 'VALID'}
              >
                <Send size={16} className="mr-2" />
                Submit Return Request
              </Button>

              {uiState === 'ERROR' && (
                <Button 
                  onClick={handleTryAnother}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-all shadow-none fade-up"
                >
                  Try Another Receipt
                </Button>
              )}
            </div>
          </Card>

        </div>

        {/* ── RIGHT COLUMN (Sidebar Form) ── */}
        <div className="lg:col-span-1 flex flex-col">
          {uiState !== 'VALID' ? (
            /* IDLE OR ERROR SIDEBAR */
            <Card className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[460px] border-slate-200/80 bg-white">
              {uiState === 'IDLE' ? (
                <div className="fade-up">
                  <div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Package size={24} className="text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-500">No Item Selected</h3>
                </div>
              ) : (
                <div className="px-4 flex flex-col items-center fade-up">
                  <div className="w-11 h-11 rounded-full border border-blue-200 bg-blue-50 flex items-center justify-center mb-4">
                    <AlertCircle size={18} className="text-blue-500" />
                  </div>
                  <p className="text-xs font-medium text-slate-400 max-w-[220px] leading-relaxed">
                    Please enter a valid Receipt ID within the 30-day return window to view return details.
                  </p>
                </div>
              )}
            </Card>
          ) : (
            /* VALID STATE: DETAILED RETURN FORM SIDEBAR */
            <Card className="flex-1 flex flex-col justify-between p-5 min-h-[460px] border-slate-200/80 bg-white font-sans fade-up">
              <div className="space-y-4">
                
                {/* Info Text Box */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 flex gap-2 text-slate-700">
                  <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium leading-relaxed">
                    Please select an item from the list and click 'Add Details' to specify reasons and photo proofs.
                  </p>
                </div>

                {/* Return Target Header */}
                <div className="text-xs">
                  <span className="text-slate-800 font-bold">Return Details for : </span>
                  <span className="text-blue-600 font-extrabold text-sm">Logitech MX Master 3S</span>
                </div>

                {/* Reason Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                    Reason for Return <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full text-xs rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-medium text-slate-700 outline-none focus:border-blue-500">
                    <option>Defective/Damaged Product</option>
                    <option>Wrong Item Received</option>
                    <option>Changed Mind</option>
                  </select>
                </div>

                {/* Item Condition Toggle */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                    Item Condition
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2 px-4 rounded-lg text-xs font-bold border-2 border-blue-600 bg-blue-50/40 text-blue-600 transition-all">
                      Opened
                    </button>
                    <button className="py-2 px-4 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-all">
                      Sealed
                    </button>
                  </div>
                </div>

                {/* Photo Proof Upload Box */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                    Photo Proof (Optional)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-slate-50/30 hover:bg-slate-50 transition-all cursor-pointer">
                    <UploadCloud size={24} className="text-blue-500 mb-1.5" />
                    <span className="text-xs font-bold text-slate-700">Click or drag photos here</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                  </div>
                </div>

                {/* Customer Comments */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                    Customer Comments
                  </label>
                  <textarea 
                    rows={8}
                    placeholder="Enter any additional details from the customer..."
                    className="w-full text-xs rounded-lg border border-slate-200 p-3 outline-none focus:border-blue-500 font-medium text-slate-700 placeholder-slate-300 resize-none"
                  />
                </div>

              </div>

              {/* Sidebar Save Details Button */}
              <div className="pt-3">
                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-none flex items-center justify-center gap-2">
                  <Save size={18} />
                  Save Details
                </Button>
              </div>
            </Card>
          )}
        </div>

      </div>

    </div>
  );
}