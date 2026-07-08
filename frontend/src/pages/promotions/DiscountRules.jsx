import React, { useState, useMemo } from 'react';
import { 
  Plus, Eye, Pencil, Trash2, ChevronUp, ChevronDown, MoreVertical, 
  Columns, LayoutGrid, Check, Settings, Sparkles, Sliders, Info 
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Card, { CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import api from '../../services/api';

// Base mock discount rules matching the spec layout
const INITIAL_RULES = [
  { id: 1, name: 'Max Cart Discount', type: 'Cart Total', condition: 'Min. Order: Rs.10,000', discountLimit: '20 %', status: 'Active', priority: 1 },
  { id: 2, name: 'Category Discount Limit', type: 'Product Category', condition: 'Category: Beverages', discountLimit: '15%', status: 'Expired', priority: 2 },
  { id: 3, name: 'New Customer Discount', type: 'Customer Type', condition: 'Customer: New', discountLimit: 'Rs.500', status: 'Active', priority: 3 },
  { id: 4, name: 'Weekend Special Limit', type: 'Day Based', condition: 'Days: Sat, Sun', discountLimit: '25%', status: 'Active', priority: 4 },
  { id: 5, name: 'Bulk Purchase Discount', type: 'Quantity Based', condition: 'Min. Qty: 10', discountLimit: '30%', status: 'Active', priority: 5 }
];

export default function DiscountRulesPage() {
  const [rules, setRules] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successDetails, setSuccessDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Settings switches states
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [applyHighest, setApplyHighest] = useState(true);
  const [overrideLower, setOverrideLower] = useState(false);

  // Active priority menu triggers
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Form input state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Cart Total',
    condition: '',
    discountLimit: '',
    status: 'Active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/promotions-discounts/discount-rules');
      const fetchedData = response.data?.data || [];
      const mappedData = fetchedData.map(r => ({
        ...r,
        id: r._id,
        name: r.name,
        type: r.type,
        condition: r.condition,
        discountLimit: r.discountLimit,
        status: r.status,
        priority: r.priority
      }));
      setRules(mappedData);
    } catch (err) {
      console.error('Failed to fetch discount rules:', err);
      setError(err.message || 'Failed to fetch discount rules');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRules();
  }, []);

  // Filters by rule type tabs
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      if (activeTab === 'All') return true;
      if (activeTab === 'Promotion Rules') return rule.type === 'Day Based' || rule.type === 'Quantity Based';
      if (activeTab === 'Coupon Rules') return rule.type === 'Customer Type';
      if (activeTab === 'Cart Rules') return rule.type === 'Cart Total' || rule.type === 'Product Category';
      return true;
    }).sort((a, b) => a.priority - b.priority);
  }, [rules, activeTab]);

  // BR-SALE-002: Discount threshold warning check
  const showThresholdWarning = useMemo(() => {
    const rawVal = parseFloat(formData.discountLimit) || 0;
    const hasPercent = typeof formData.discountLimit === 'string' && formData.discountLimit.includes('%');
    if (hasPercent) {
      return rawVal > 50;
    } else {
      return rawVal > 1000;
    }
  }, [formData.discountLimit]);

  const movePriority = async (index, direction) => {
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= sortedRules.length) return;

    // Swap priorities locally
    const temp = sortedRules[index];
    sortedRules[index] = sortedRules[targetIdx];
    sortedRules[targetIdx] = temp;

    const ruleIds = sortedRules.map(r => r.id);

    try {
      setLoading(true);
      await api.put('/promotions-discounts/discount-rules/reorder', { ruleIds });
      await fetchRules();
    } catch (err) {
      console.error('Failed to reorder priorities:', err);
      alert(err.message || 'Failed to reorder priorities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditMode(false);
    setErrorMessage('');
    setFormData({
      name: '',
      type: 'Cart Total',
      condition: 'Min. Order: Rs.1,000',
      discountLimit: '10%',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditMode(true);
    setErrorMessage('');
    setCurrentRule(rule);
    setFormData({ ...rule });
    setIsModalOpen(true);
  };

  const handleOpenViewModal = (rule) => {
    setCurrentRule(rule);
    setIsDetailModalOpen(true);
  };

  const handleDeleteRule = async (id) => {
    if (window.confirm("Are you sure you want to delete this rule?")) {
      try {
        setLoading(true);
        await api.delete(`/promotions-discounts/discount-rules/${id}`);
        alert("Discount rule deleted successfully");
        await fetchRules();
      } catch (err) {
        console.error('Failed to delete discount rule:', err);
        alert(err.message || 'Failed to delete discount rule');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.condition.trim() || !formData.discountLimit.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    const dl = formData.discountLimit.trim();
    const isPercentage = dl.endsWith('%');
    const isRupees = dl.toLowerCase().startsWith('rs.');
    const isNumeric = !isNaN(parseFloat(dl)) && isFinite(dl);

    if (!isPercentage && !isRupees && !isNumeric) {
      setErrorMessage("Discount Limit must be a percentage (e.g. 15%) or Rupee amount (e.g. Rs.500).");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      condition: formData.condition.trim(),
      discountLimit: formData.discountLimit.trim(),
      status: formData.status,
      ...(editMode ? { priority: currentRule.priority } : {})
    };

    try {
      setLoading(true);
      if (editMode) {
        await api.put(`/promotions-discounts/discount-rules/${currentRule.id}`, payload);
        setSuccessMessage("Discount rule updated successfully!");
        setSuccessDetails({ ...payload, id: currentRule.id });
      } else {
        const response = await api.post('/promotions-discounts/discount-rules', payload);
        const newRule = response.data?.data || {};
        setSuccessMessage("Discount rule created successfully!");
        setSuccessDetails({ ...newRule, id: newRule._id });
      }
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
      await fetchRules();
    } catch (err) {
      console.error('Failed to save discount rule:', err);
      setErrorMessage(err.message || 'Failed to save discount rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-up">
      
      {/* Page Header */}
      <PageHeader
        title="Discount Rules"
        description="Create and manage discount rules that can be applied to promotions and coupons"
        actions={
          <Button 
            onClick={handleOpenAddModal}
            variant="primary" 
            className="rounded-full px-5 py-2.5 text-xs font-bold shadow-sm flex items-center gap-1.5"
          >
            <Plus size={15} />
            <span>Add Rule</span>
          </Button>
        }
      />

      {/* Tab Segment Filters */}
      <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit select-none shadow-sm">
        {['All Rules', 'Promotion Rules', 'Coupon Rules', 'Cart Rules'].map((tab) => {
          const apiTab = tab === 'All Rules' ? 'All' : tab;
          const isActive = activeTab === apiTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(apiTab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Discount Rules Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col select-none">
        
        {/* Table Title Block */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-800">All Discount Rules</h3>
          
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400">
              <LayoutGrid size={15} />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-sm">
              <Columns size={14} />
              <span>Columns</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4 font-bold">Rule Name</th>
                <th className="px-6 py-4 font-bold">Rule Type</th>
                <th className="px-6 py-4 font-bold">Condition</th>
                <th className="px-6 py-4 font-bold">Discount limit</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 select-none">
                    Loading discount rules...
                  </td>
                </tr>
              ) : filteredRules.length > 0 ? (
                filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-blue-50/10 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">
                      {rule.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-semibold">
                      {rule.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium font-mono text-[11px]">
                      {rule.condition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-extrabold text-slate-800">
                      {rule.discountLimit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={rule.status === 'Active' ? 'success' : 'danger'}>
                        {rule.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center relative">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenViewModal(rule)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(rule)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Rule"
                        >
                          <Pencil size={15} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === rule.id ? null : rule.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <MoreVertical size={15} />
                          </button>
                          
                          {activeMenuId === rule.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                              <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden text-xs text-left">
                                <button
                                  onClick={() => {
                                    handleDeleteRule(rule.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 font-semibold"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 select-none">
                    No rules found matching this segment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Page Indicators */}
        <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/20 flex items-center justify-between text-xs font-bold text-slate-400 select-none">
          <span>Showing 1 to {filteredRules.length} of {rules.length} Rules</span>
          
          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 flex items-center justify-center transition-colors hover:bg-slate-50" disabled>&lt;</button>
            <button className="w-7 h-7 rounded-lg border border-blue-600 bg-blue-600 text-white flex items-center justify-center shadow-sm">1</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors">2</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors">3</button>
            <button className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors">&gt;</button>
          </div>
        </div>

      </div>

      {/* Priority & Settings Bottom Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        
        {/* Left Priority Column */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3.5 mb-4">
              Rule priority
            </h3>
            
            <div className="space-y-3">
              {rules
                .sort((a, b) => a.priority - b.priority)
                .map((rule, idx) => (
                  <div 
                    key={rule.id} 
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 font-extrabold text-[10px] flex items-center justify-center">
                        {rule.priority}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{rule.name}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Priority Up Arrow */}
                      <button
                        onClick={() => movePriority(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      
                      {/* Priority Down Arrow */}
                      <button
                        onClick={() => movePriority(idx, 'down')}
                        disabled={idx === rules.length - 1}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Settings Switch Column */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 select-none flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3.5 mb-5">
              Rule Settings
            </h3>
            
            <div className="space-y-6">
              
              {/* Setting 1: Allow Multiple */}
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800">Allow Multiple Discounts</h5>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">Allow stacking of multiple discounts on the same order</p>
                </div>
                <button
                  onClick={() => setAllowMultiple(!allowMultiple)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    allowMultiple ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      allowMultiple ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 2: Apply Highest */}
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800">Apply Highest Priority Rule</h5>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">Apply only the highest priority rule that matches</p>
                </div>
                <button
                  onClick={() => setApplyHighest(!applyHighest)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    applyHighest ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      applyHighest ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Setting 3: Override Lower */}
              <div className="flex items-center justify-between gap-6">
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-slate-800">Override Lower Priority</h5>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">Allow higher priority rules to override lower ones</p>
                </div>
                <button
                  onClick={() => setOverrideLower(!overrideLower)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    overrideLower ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      overrideLower ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

            </div>
          </div>

          {/* Guidelines banner to utilize vertical space nicely */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mt-8 flex items-start gap-2.5">
            <Info size={15} className="text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-slate-700 block">Priority Precedence</span>
              <p className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5">
                Rules are evaluated sequentially from highest priority (Rank 1) to lowest. Ensure stacking settings align with your active store policies.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editMode ? 'Edit Discount Rule' : 'Create Discount Rule'}
        size="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5 text-xs font-bold text-slate-700">
          {/* Rule Name */}
          <div className="space-y-1">
            <label className="block text-slate-500 mb-1">Rule Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. Bulk Purchase Discount"
            />
          </div>

          {/* Rule Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-500 mb-1">Rule Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
              >
                <option value="Cart Total">Cart Total</option>
                <option value="Product Category">Product Category</option>
                <option value="Customer Type">Customer Type</option>
                <option value="Day Based">Day Based</option>
                <option value="Quantity Based">Quantity Based</option>
              </select>
            </div>

            {/* Discount limit value */}
            <div className="space-y-1">
              <label className="block text-slate-500 mb-1">Discount Limit</label>
              <input
                type="text"
                required
                value={formData.discountLimit}
                onChange={(e) => setFormData({ ...formData, discountLimit: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. 20% or Rs.500"
              />
            </div>
          </div>

          {/* Rule Condition */}
          <div className="space-y-1">
            <label className="block text-slate-500 mb-1">Rule Condition</label>
            <input
              type="text"
              required
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all font-mono"
              placeholder="e.g. Min. Order: Rs.10,000"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="block text-slate-500 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[10px] font-bold select-none leading-relaxed">
              <div className="w-3.5 h-3.5 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                !
              </div>
              <p className="flex-1">
                {errorMessage}
              </p>
            </div>
          )}

          {showThresholdWarning && (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[10px] font-bold select-none leading-relaxed">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                !
              </div>
              <p className="flex-1">
                BR-SALE-002: Discount limits exceeding 50% or Rs. 1,000 require Branch Manager approval.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-5 py-2"
            >
              {editMode ? 'Save Changes' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Discount Rule Details"
        size="md"
      >
        {currentRule && (
          <div className="space-y-6 text-sm text-slate-600 select-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-base font-bold text-slate-800">{currentRule.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Priority Rank: <span className="font-semibold text-slate-600">{currentRule.priority}</span></p>
              </div>
              <Badge variant={currentRule.status === 'Active' ? 'success' : 'danger'}>
                {currentRule.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Rule Type</span>
                <span className="text-sm font-bold text-slate-800">{currentRule.type}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Discount Limit</span>
                <span className="text-sm font-bold text-slate-800">{currentRule.discountLimit}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Matching Condition</span>
              <span className="text-xs font-bold text-slate-700 font-mono">{currentRule.condition}</span>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Modal Dialog */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title=""
        size="md"
      >
        <div className="text-center pt-8 pb-3 px-2 select-none">
          {/* Green Check Icon */}
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-5 animate-bounce">
            <Check className="w-8 h-8 stroke-[3.5]" />
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-6">
            {successMessage}
          </h3>

          {successDetails && (
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-xs font-bold text-slate-500 mb-5 space-y-3.5 text-left">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Rule Name</span>
                <span className="text-slate-800 font-extrabold">{successDetails.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Rule Type</span>
                <span className="text-slate-800 font-extrabold">{successDetails.type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Discount Limit</span>
                <span className="text-slate-800 font-extrabold">{successDetails.discountLimit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Condition</span>
                <span className="text-slate-800 font-extrabold font-mono text-[11px]">{successDetails.condition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400">Status</span>
                <Badge variant={successDetails.status === 'Active' ? 'success' : 'danger'}>
                  {successDetails.status}
                </Badge>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3.5 w-full">
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-full px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/10 rounded-xl transition-all cursor-pointer outline-none"
            >
              Okay, Close
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
