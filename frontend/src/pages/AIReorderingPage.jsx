import React, { useState, useEffect } from 'react';
import { Brain, DollarSign, Package, AlertTriangle, ShieldCheck, RefreshCw, Plus, X, ArrowUpRight, CheckCircle2, ChevronRight, Truck, Info, Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { toast } from '../utils/toast';

// Mock Reordering Suggestions Data
const MOCK_REORDER_SUGGESTIONS = [
  { id: 1, name: 'Whole Wheat Bread', sku: 'BAK-WWB-002', currentStock: 12, minLevel: 30, suggestedQty: 50, supplier: 'BakeCraft Distributors', unitCost: 3.00, estCost: 150.00, urgency: 'High', leadTime: 3 },
  { id: 2, name: 'Chocolate Chip Cookie', sku: 'BAK-CCC-005', currentStock: 8, minLevel: 25, suggestedQty: 100, supplier: 'BakeCraft Distributors', unitCost: 2.00, estCost: 200.00, urgency: 'High', leadTime: 3 },
  { id: 3, name: 'Organic Bananas (kg)', sku: 'FRU-BAN-003', currentStock: 120, minLevel: 150, suggestedQty: 200, supplier: 'GreenGrow Farms', unitCost: 2.00, estCost: 400.00, urgency: 'Medium', leadTime: 5 },
  { id: 4, name: 'Greek Yogurt (500g)', sku: 'DY-GRY-004', currentStock: 64, minLevel: 50, suggestedQty: 40, supplier: 'DairyLand Co.', unitCost: 3.00, estCost: 120.00, urgency: 'Low', leadTime: 4 },
  { id: 5, name: 'Espresso Blend Coffee', sku: 'COF-ESP-001', currentStock: 45, minLevel: 40, suggestedQty: 80, supplier: 'BeanDrop Imports', unitCost: 8.00, estCost: 640.00, urgency: 'Low', leadTime: 7 }
];

const MOCK_REORDER_HISTORY = [
  { poId: 'PO-2026-0042', date: '2026-07-06', supplier: 'BakeCraft Distributors', itemsCount: 3, totalCost: '$520.00', status: 'Approved' },
  { poId: 'PO-2026-0041', date: '2026-07-04', supplier: 'DairyLand Co.', itemsCount: 2, totalCost: '$180.00', status: 'Pending' }
];

export default function AIReorderingPage() {
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState(MOCK_REORDER_SUGGESTIONS);
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal Configuration States
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalQty, setModalQty] = useState('');
  const [modalLeadDays, setModalLeadDays] = useState(3);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const openConfigureModal = (item) => {
    setActiveModalItem(item);
    setModalQty(String(item.suggestedQty));
    setModalLeadDays(item.leadTime);
  };

  const handleConfirmOrder = () => {
    if (!activeModalItem) return;
    const qty = parseInt(modalQty, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Please enter a valid positive quantity.');
      return;
    }
    setSuggestions(prev => prev.filter(item => item.id !== activeModalItem.id));
    toast.success(`Generated Purchase Order for ${qty}x ${activeModalItem.name}!`);
    setActiveModalItem(null);
  };

  const handleDismiss = (id, productName) => {
    setSuggestions(prev => prev.filter(item => item.id !== id));
    toast.info(`Suggestion for ${productName} dismissed.`);
  };

  const handleGenerateAllPO = () => {
    const counts = filteredSuggestions.length;
    if (counts === 0) {
      toast.info('No suggestions to order.');
      return;
    }
    setSuggestions(prev => prev.filter(item => !filteredSuggestions.some(f => f.id === item.id)));
    toast.success(`Generated PO requests for ${counts} items successfully!`);
  };

  const filteredSuggestions = suggestions.filter(item => {
    if (urgencyFilter === 'All') return true;
    return item.urgency === urgencyFilter;
  });

  const totalEstCost = filteredSuggestions.reduce((sum, item) => sum + item.estCost, 0);
  const urgentCount = suggestions.filter(item => item.urgency === 'High').length;

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Calculating Supplier Expense Distribution percentages
  const supplierCosts = suggestions.reduce((acc, curr) => {
    acc[curr.supplier] = (acc[curr.supplier] || 0) + curr.estCost;
    return acc;
  }, {});

  const totalSuggestionsCost = Object.values(supplierCosts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 fade-in">
      {/* Title Card */}
      <Card className="overflow-hidden rounded-[20px] border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]">
              <Brain className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2563EB]">AI & Analytics</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0F172A]">AI Reordering</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 font-bold bg-white text-slate-700 h-10 px-4 rounded-xl shadow-sm"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              Recalculate Suggestions
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="text-center">
            <Spinner className="h-10 w-10 text-[#2563EB] mx-auto" />
            <p className="mt-4 text-sm font-semibold text-slate-500">Analyzing current inventory and demand patterns...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Items</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{suggestions.length}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Package className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Reorder Cost</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">${totalEstCost.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Urgent Items</p>
                  <p className="mt-2 text-3xl font-extrabold text-red-600">{urgentCount}</p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Replenishment Status</p>
                  <p className="mt-2 text-xl font-extrabold text-slate-900 flex items-center gap-1.5 mt-3 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs w-fit">
                    <ShieldCheck className="w-4 h-4" /> Healthy Supply
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Supplier Expense Distribution Tracker */}
          <Card className="border-slate-200 bg-white rounded-2xl p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800">Supplier Allocation Profile</CardTitle>
              <p className="text-xs text-slate-500">Distribution of projected reorder expenditures across active vendors</p>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(supplierCosts).map(([supplier, cost]) => {
                const percentage = totalSuggestionsCost > 0 ? Math.round((cost / totalSuggestionsCost) * 100) : 0;
                return (
                  <div key={supplier} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {supplier}
                      </span>
                      <span className="font-extrabold text-slate-900">${cost.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Suggestions List & History Section */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* recommendations table */}
            <Card className="xl:col-span-2 border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">AI Replenishment Recommendations</CardTitle>
                  <p className="text-xs text-slate-500">Smart reorder sizes optimized using forecasting models and safety stock parameters</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={urgencyFilter}
                    onChange={(e) => setUrgencyFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All">All Urgency</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <Button
                    size="sm"
                    onClick={handleGenerateAllPO}
                    className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold h-9 px-3.5 rounded-xl text-xs shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filteredSuggestions.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-slate-500">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No reorder recommendations matching criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-4 font-bold">Product</th>
                          <th className="py-3 px-4 font-bold text-right">Stock Status</th>
                          <th className="py-3 px-4 font-bold text-right">Suggested Qty</th>
                          <th className="py-3 px-4 font-bold text-right">Est. Cost</th>
                          <th className="py-3 px-4 font-bold text-center">Urgency</th>
                          <th className="py-3 px-4 font-bold text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm">
                        {filteredSuggestions.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              <div>{item.name}</div>
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.supplier}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                              <div className="text-xs font-bold">{item.currentStock} units left</div>
                              <span className="text-[11px] text-slate-400">Min: {item.minLevel}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-blue-600">+{item.suggestedQty}</td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">${item.estCost.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${getUrgencyBadge(item.urgency)}`}>
                                {item.urgency}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => openConfigureModal(item)}
                                  className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition border border-blue-100"
                                >
                                  Configure
                                </button>
                                <button
                                  onClick={() => handleDismiss(item.id, item.name)}
                                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reorder History / Recent POs */}
            <Card className="border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Recent Automated Orders</CardTitle>
                <p className="text-xs text-slate-500">Recently processed AI-initiated replenishment requests</p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {MOCK_REORDER_HISTORY.map((hist) => (
                  <div key={hist.poId} className="p-4 border border-slate-100 rounded-xl space-y-3 hover:bg-slate-50/50 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{hist.poId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        hist.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {hist.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 space-y-1">
                      <div>Supplier: <span className="text-slate-700 font-bold">{hist.supplier}</span></div>
                      <div>Quantity: <span className="text-slate-700 font-bold">{hist.itemsCount} items</span></div>
                      <div>Total Cost: <span className="text-slate-700 font-bold">{hist.totalCost}</span></div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{hist.date}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Interactive PO Configuration Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md mx-4 overflow-hidden fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Configure Purchase Order</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{activeModalItem.sku}</p>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs font-medium text-blue-700 leading-relaxed">
                  Adjust replenishment parameters. Estimates are calculated based on forecasted supplier delivery schedules.
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Product Details</label>
                <p className="text-sm font-extrabold text-slate-800">{activeModalItem.name}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{activeModalItem.supplier}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Current Stock</label>
                  <p className="text-sm font-bold text-slate-700">{activeModalItem.currentStock} units</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Min Threshold</label>
                  <p className="text-sm font-bold text-slate-700">{activeModalItem.minLevel} units</p>
                </div>
              </div>

              <div className="border-t border-slate-100 my-4" />

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Order Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={modalQty}
                    onChange={(e) => setModalQty(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Unit Cost</span>
                    <span className="text-slate-800 text-sm font-extrabold">${activeModalItem.unitCost.toFixed(2)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-slate-400 block mb-0.5">Estimated Total</span>
                    <span className="text-[#2563EB] text-sm font-extrabold">
                      ${((parseInt(modalQty, 10) || 0) * activeModalItem.unitCost).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery calculator */}
              <div className="text-[11px] font-bold text-slate-500 uppercase bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 flex items-center justify-between">
                <span>Standard Delivery Lead</span>
                <span className="text-slate-800">{modalLeadDays} Days ({new Date(Date.now() + modalLeadDays * 24 * 60 * 60 * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })})</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveModalItem(null)}
                className="flex-1 border-slate-200 text-slate-600 font-bold bg-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmOrder}
                className="flex-1 bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
              >
                Confirm Order
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
