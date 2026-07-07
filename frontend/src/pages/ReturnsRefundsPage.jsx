import ReturnStatusPage from './ReturnStatusPage';
import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { Search, Package, AlertCircle, Send, Barcode, HelpCircle, UploadCloud, Check, Save, Trash2, Edit2 } from 'lucide-react';
import api from '../services/api';
import Swal from 'sweetalert2';

export default function ReturnsRefundsPage() {
  const [receiptId, setReceiptId] = useState('');
  const [uiState, setUiState] = useState('IDLE'); 
  const [receiptItems, setReceiptItems] = useState([]); 
  
  const [selectedSkus, setSelectedSkus] = useState([]);
  const [returnQuantities, setReturnQuantities] = useState({});
  const [activeDetailSku, setActiveDetailSku] = useState(null);
  const [formStates, setFormStates] = useState({});
  const [activeCondition, setActiveCondition] = useState('Opened');

  useEffect(() => {
    if (activeDetailSku) {
      const savedCondition = formStates[activeDetailSku]?.condition;
      setActiveCondition(savedCondition || 'Opened');
    }
  }, [activeDetailSku, formStates]);

  const handleVerify = async () => {
    const cleanId = receiptId.trim().toUpperCase();
    if (!cleanId) return;

    try {
      const response = await api.get(`/returns-refunds/verify/${cleanId}`);
      
      if (response.data.success) {
        const returnData = response.data.data;
        setReceiptItems(returnData.items || []);
        setUiState('VALID');
        setSelectedSkus([]); 
        setReturnQuantities({});
        setActiveDetailSku(null);
        setFormStates({});
      }
    } catch (error) {
      console.error("API Error:", error);
      if (error.response?.data?.isExpired) {
        setUiState('ERROR');
        setActiveDetailSku(null);
      } else {
        setUiState('IDLE');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Receipt ID not found or server error.',
          confirmButtonColor: '#2563eb'
        });
      }
    }
  };

  const handleTryAnother = () => {
    setUiState('IDLE');
    setReceiptId('');
    setReceiptItems([]);
    setSelectedSkus([]);
    setReturnQuantities({});
    setActiveDetailSku(null);
    setFormStates({});
  };

  const toggleSelect = (sku) => {
    if (selectedSkus.includes(sku)) {
      setSelectedSkus(selectedSkus.filter(id => id !== sku));
      if (activeDetailSku === sku) setActiveDetailSku(null);
      
      const updatedQuantities = { ...returnQuantities };
      delete updatedQuantities[sku];
      setReturnQuantities(updatedQuantities);

      const updatedForms = { ...formStates };
      delete updatedForms[sku];
      setFormStates(updatedForms);
    } else {
      setSelectedSkus([...selectedSkus, sku]);
      setReturnQuantities({ ...returnQuantities, [sku]: 1 });
    }
  };

  const handleQtyChange = (sku, qty) => {
    setReturnQuantities({ ...returnQuantities, [sku]: parseInt(qty) });
  };

  const handleSaveSidebarDetails = (sku, reason, condition, comments) => {
    setFormStates(prev => ({
      ...prev,
      [sku]: { reason, condition, comments, isSaved: true }
    }));
  };

  const handleEditSidebarDetails = (sku) => {
    setFormStates(prev => ({
      ...prev,
      [sku]: { ...prev[sku], isSaved: false }
    }));
  };

  const calculateRefundTotal = () => {
    return receiptItems.filter(item => selectedSkus.includes(item.sku))
      .reduce((sum, item) => {
        const qty = returnQuantities[item.sku] || 1;
        return sum + (item.unitPrice * qty);
      }, 0);
  };

  const activeItemInfo = receiptItems.find(item => item.sku === activeDetailSku);
  const activeFormInfo = formStates[activeDetailSku] || { reason: 'Defective/Damaged Product', condition: 'Opened', comments: '', isSaved: false };

  if (uiState === 'TRACKING') {
      return (
        <ReturnStatusPage 
          returnId="RET-0091" 
          onGoBack={() => setUiState('IDLE')} 
        />
      );
    }

  return (
    <div className="space-y-5 fade-up pt-2 pb-10">
      
      <PageHeader
        title="Initiate Return"
        description="Verify receipt ID, select items to return, and state the reason."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

        
        <div className="lg:col-span-2 flex flex-col gap-5">
          
          <Card>
            <CardContent className="pt-6">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Scan or Enter Receipt ID
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  {uiState !== 'IDLE' && (
                    <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                      <Barcode size={18} className="text-slate-400 opacity-70" />
                    </div>
                  )}
                  <input 
                    type="text" 
                    value={receiptId}
                    placeholder=""
                    onChange={(e) => setReceiptId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    className={`w-full text-sm rounded-lg border border-slate-200 bg-white py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono ${
                      uiState === 'IDLE' ? 'px-3.5' : 'pl-11 pr-3.5'
                    }`}
                  />
                </div>
                <Button variant="primary" onClick={handleVerify} className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-none focus:outline-none focus:ring-0">
                  <Search size={16} className="mr-2" /> Verify
                </Button>
              </div>
            </CardContent>
          </Card>

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

          <Card className="flex-1 flex flex-col justify-between min-h-[460px]">
            <div className="flex-1 flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Package className="w-4 h-4 text-blue-600" /> Select Items
                </CardTitle>
                {uiState === 'VALID' && (
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md border border-blue-100">
                    Date: 09 Jun 2026
                  </span>
                )}
              </CardHeader>

              <CardContent className="p-0 flex-1 flex flex-col justify-between">
                
                
                {uiState === 'IDLE' && (
                  <div className="p-5 pb-0 flex-1 flex flex-col">
                    <div className="bg-slate-50/70 rounded-xl flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[280px]">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <AlertCircle size={20} className="text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">Ready to Verify</h3>
                      <p className="text-[13px] text-slate-500 max-w-[290px] mx-auto leading-relaxed">
                        Please click the 'Verify' button to validate the entered Receipt ID and load the purchased items.
                      </p>
                    </div>
                  </div>
                )}

                
                {uiState === 'ERROR' && (
                  <div className="p-5 pb-0 flex-1 flex flex-col">
                    <div className="bg-slate-50/70 rounded-xl flex-1 flex flex-col items-center justify-center text-center p-8 min-h-[280px]">
                      <div className="w-10 h-10 rounded-full border border-red-200 bg-white flex items-center justify-center mb-4 shadow-sm">
                        <AlertCircle size={18} className="text-red-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 max-w-[340px] leading-relaxed">
                        This receipt cannot be loaded as it has exceeded the<br/>maximum 30-day return window.
                      </p>
                    </div>
                  </div>
                )}

                
                {uiState === 'VALID' && (
                  <div className="overflow-x-auto fade-up flex-1 flex flex-col justify-between">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                          <th className="py-3 pl-5 pr-2 w-10"></th>
                          <th className="py-3 px-3">Item Details</th>
                          <th className="py-3 px-3 text-center">Original Qty</th>
                          <th className="py-3 px-3 text-center">Return Qty</th>
                          <th className="py-3 px-3 text-right">Unit Price</th>
                          <th className="py-3 px-3 text-right">Total</th>
                          <th className="py-3 px-5 text-center">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                        {receiptItems.map((item) => {
                          const isChecked = selectedSkus.includes(item.sku);
                          const itemForm = formStates[item.sku] || { isSaved: false };
                          const isActiveRow = activeDetailSku === item.sku;
                          const currentQty = returnQuantities[item.sku] || 1;
                          const rowTotal = isChecked ? (item.unitPrice * currentQty) : 0;
                          
                          return (
                            <tr key={item.sku} className={`transition-colors ${isActiveRow ? 'bg-slate-50/50' : ''}`}>
                              <td className="py-4 pl-5 pr-2 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => toggleSelect(item.sku)}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-4 px-3">
                                <div className="font-bold text-slate-800">{item.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">SKU: {item.sku}</div>
                              </td>
                              <td className="py-4 px-3 text-center font-bold text-slate-600">{item.originalQty}</td>
                              <td className="py-4 px-3 text-center">
                                <select 
                                  value={currentQty}
                                  disabled={!isChecked}
                                  onChange={(e) => handleQtyChange(item.sku, e.target.value)}
                                  className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50"
                                >
                                  <option value="1">1</option>
                                  {item.originalQty > 1 && <option value="2">2</option>}
                                </select>
                              </td>
                              <td className="py-4 px-3 text-right font-medium text-slate-600">
                                Rs. {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-3 text-right font-bold text-blue-600">
                                Rs. {rowTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-4 px-5 text-center">
                                {itemForm.isSaved ? (
                                  <button 
                                    onClick={() => setActiveDetailSku(item.sku)} 
                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-600 transition-colors"
                                  >
                                    <Check size={12} strokeWidth={3} /> Added
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => setActiveDetailSku(item.sku)}
                                    disabled={!isChecked}
                                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-md border transition-all ${
                                      !isChecked 
                                        ? 'bg-white text-slate-300 border-slate-200 cursor-not-allowed' 
                                        : 'bg-white text-slate-800 border-slate-700 hover:bg-slate-50 shadow-sm'
                                    }`}
                                  >
                                    <Edit2 size={12} strokeWidth={2.5} /> Add Details
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <div className="flex justify-between items-center px-5 py-4 bg-slate-50/50 border-t border-slate-100 text-xs mt-auto">
                      <div>
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Items Selected</span>
                        <span className="font-bold text-slate-800">{selectedSkus.length} of {receiptItems.length} items</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider block">Estimated Refund Total</span>
                        <span className="font-black text-sm text-blue-600">
                          Rs. {calculateRefundTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                
              <div className="p-5 space-y-3">
                {uiState === 'VALID' && (
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-center text-slate-600 text-xs font-medium mb-1">
                    <HelpCircle size={15} className="text-blue-500 flex-shrink-0" />
                    <span>You can return up to the original quantity purchased for each item.</span>
                  </div>
                )}
                
                
                <button 
                  disabled={uiState !== 'VALID' || selectedSkus.length === 0}
                  onClick={() => setUiState('TRACKING')}
                  className={`w-full h-10 font-bold text-[13px] flex items-center justify-center gap-2 rounded-lg transition-all ${
                    uiState === 'VALID' && selectedSkus.length > 0
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer' 
                      : 'bg-slate-400 text-white cursor-not-allowed' 
                  }`} 
                >
                  <Send size={15} /> Submit Return Request
                </button>

                {uiState === 'ERROR' && (
                  <Button 
                    onClick={handleTryAnother} 
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] rounded-lg transition-all shadow-none flex items-center justify-center"
                  >
                    Try Another Receipt
                  </Button>
                )}
              </div>

              </CardContent>
            </div>
          </Card>

        </div>

        
        <div className="lg:col-span-1 flex flex-col">
          {uiState === 'VALID' && activeDetailSku && activeItemInfo ? (
            <Card className="flex-1 flex flex-col justify-between p-6 min-h-[460px] border-slate-200/80 bg-white font-sans fade-up">
              <div className="space-y-6">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex gap-2.5 text-slate-700">
                  <AlertCircle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium leading-relaxed">
                    Please select an item from the list and click 'Add Details' to specify reasons and photo proofs.
                  </p>
                </div>

                <div className="text-xs">
                  <span className="text-slate-800 font-bold">Return Details for : </span>
                  <span className="text-blue-600 font-bold block mt-0.5">{activeItemInfo.name}</span>
                </div>

                {activeFormInfo.isSaved ? (
                  <div className="space-y-5 fade-up pt-1">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Reason for Return</label>
                      <div className="text-[13px] font-bold text-slate-800">{activeFormInfo.reason}</div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">Item Condition</label>
                      <span className="inline-block py-1.5 px-4 rounded-full text-xs font-bold border border-blue-300 bg-white text-blue-600">
                        {activeFormInfo.condition}
                      </span>
                    </div>


                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-2">Photo Proof (Optional)</label>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img 
                            src="https://images.unsplash.com/photo-1527814050087-37938154791f?auto=format&fit=crop&w=100&q=80" 
                            alt="Proof" 
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm"
                          />
                          <div>
                            <div className="text-[11px] font-bold text-slate-700">image_proof.jpg</div>
                            <div className="text-[10px] font-medium text-slate-400 mt-0.5">156 KB</div>
                          </div>
                        </div>
                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1.5">Customer Comments</label>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed pr-1">
                        {activeFormInfo.comments || "No comments added."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 fade-up pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                        Reason for Return <span className="text-red-500">*</span>
                      </label>
                      <select 
                        id={`reason-${activeDetailSku}`}
                        defaultValue={activeFormInfo.reason || "Defective/Damaged Product"}
                        className="w-full text-xs rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-medium text-slate-700 outline-none focus:border-blue-500 shadow-sm"
                      >
                        <option>Defective/Damaged Product</option>
                        <option>Wrong Item Received</option>
                        <option>Changed Mind</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Item Condition</label>
                      <div className="flex">
                        <button 
                          type="button"
                          onClick={() => setActiveCondition('Opened')}
                          className={`flex-1 py-2 text-xs rounded-l-lg transition-colors ${
                            activeCondition === 'Opened'
                              ? 'font-bold border border-blue-500 bg-white text-blue-600 z-10'
                              : 'font-medium border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 z-0'
                          }`}
                        >
                          Opened
                        </button>
                        <button 
                          type="button"
                          onClick={() => setActiveCondition('Sealed')}
                          className={`flex-1 py-2 text-xs rounded-r-lg -ml-px transition-colors ${
                            activeCondition === 'Sealed'
                              ? 'font-bold border border-blue-500 bg-white text-blue-600 z-10'
                              : 'font-medium border border-slate-200 bg-white text-slate-400 hover:bg-slate-50 z-0'
                          }`}
                        >
                          Sealed
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Photo Proof (Optional)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center bg-slate-50/30 hover:bg-slate-50 transition-all cursor-pointer">
                        <UploadCloud size={24} className="text-blue-500 mb-2" />
                        <span className="text-[11px] font-bold text-slate-700">Click or drag photos here</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Customer Comments</label>
                      <textarea 
                        id={`comments-${activeDetailSku}`}
                        rows={3}
                        defaultValue={activeFormInfo.comments}
                        placeholder="Enter any additional details from the customer..."
                        className="w-full text-xs rounded-lg border border-slate-200 p-3 outline-none focus:border-blue-500 font-medium text-slate-700 placeholder-slate-400 resize-none shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                {activeFormInfo.isSaved ? (
                  <Button 
                    onClick={() => handleEditSidebarDetails(activeDetailSku)} 
                    className="w-full h-10 bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-none flex items-center justify-center gap-2 transition-colors rounded-lg"
                  >
                    <Edit2 size={14} /> Edit Details
                  </Button>
                ) : (
              <Button 
                onClick={() => {
                  const reasonEl = document.getElementById(`reason-${activeDetailSku}`);
                  const commentsEl = document.getElementById(`comments-${activeDetailSku}`);
                  handleSaveSidebarDetails(
                    activeDetailSku, 
                    reasonEl ? reasonEl.value : "Defective/Damaged Product", 
                    activeCondition, 
                    commentsEl ? commentsEl.value : ""
                  );
                }} 
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-none flex items-center justify-center gap-2 rounded-lg"
              >
                <Save size={14} /> Save Details
              </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[460px] border-slate-200/80 bg-white">
              
              {uiState === 'VALID' && (
                <div className="fade-up flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center mb-4">
                    <AlertCircle size={18} className="text-blue-500" />
                  </div>
                  <p className="text-[11px] font-medium text-slate-400 max-w-[200px] leading-relaxed">
                    Select a checkbox and click 'Add Details' to specify return reasons.
                  </p>
                </div>
              )}
              
              
              {uiState === 'ERROR' && (
                <div className="fade-up flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center mb-4">
                    <AlertCircle size={18} className="text-blue-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 max-w-[220px] leading-relaxed">
                    Please enter a valid Receipt ID within the 30-day return window to view return details.
                  </p>
                </div>
              )}

              
              {uiState === 'IDLE' && (
                <div className="fade-up flex flex-col items-center justify-center">
                  <div className="w-14 h-14 border border-dashed border-slate-300 rounded-full flex items-center justify-center mb-4 bg-slate-50/50">
                    <Package size={20} className="text-slate-400" />
                  </div>
                  <h3 className="text-[13px] font-bold text-slate-500 tracking-wide">No Item Selected</h3>
                </div>
              )}
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}