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

// Helper to parse condition string from database into form states
const parseCondition = (type, conditionStr) => {
  const result = {
    minCartValue: '',
    category: 'Beverages',
    customerType: 'Regular',
    days: [],
    minQuantity: ''
  };

  if (!conditionStr) return result;

  if (type === 'Cart Total') {
    const match = conditionStr.match(/(?:Min\.\s*Order|Minimum\s*Cart\s*Value):\s*Rs\.?\s*([0-9,]+)/i);
    if (match) result.minCartValue = match[1].replace(/,/g, '');
  } else if (type === 'Product Category') {
    const match = conditionStr.match(/Category:\s*(.+)/i);
    if (match) result.category = match[1].trim();
  } else if (type === 'Customer Type') {
    const match = conditionStr.match(/(?:Customer\s*Type|Customer):\s*(.+)/i);
    if (match) {
      const val = match[1].trim();
      if (['Regular', 'Silver', 'Gold', 'VIP'].includes(val)) {
        result.customerType = val;
      } else {
        if (val === 'New') result.customerType = 'Regular';
        else result.customerType = val;
      }
    }
  } else if (type === 'Day Based') {
    const match = conditionStr.match(/Days:\s*(.+)/i);
    if (match) {
      const parsedDays = match[1].split(',').map(d => d.trim());
      const dayMap = {
        'Mon': 'Monday', 'Tue': 'Tuesday', 'Wed': 'Wednesday', 'Thu': 'Thursday', 'Fri': 'Friday', 'Sat': 'Saturday', 'Sun': 'Sunday'
      };
      result.days = parsedDays.map(d => dayMap[d] || d);
    }
  } else if (type === 'Quantity Based') {
    const match = conditionStr.match(/(?:Min\.\s*Qty|Minimum\s*Quantity):\s*([0-9,]+)/i);
    if (match) result.minQuantity = match[1].replace(/,/g, '');
  }

  return result;
};

// Helper to format form states into condition string for database
const formatCondition = (type, state) => {
  if (type === 'Cart Total') {
    return `Minimum Cart Value: Rs.${state.minCartValue}`;
  } else if (type === 'Product Category') {
    return `Category: ${state.category}`;
  } else if (type === 'Customer Type') {
    return `Customer Type: ${state.customerType}`;
  } else if (type === 'Day Based') {
    return `Days: ${state.days.join(', ')}`;
  } else if (type === 'Quantity Based') {
    return `Minimum Quantity: ${state.minQuantity}`;
  }
  return '';
};

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
    discountLimit: '',
    status: 'Active',
    description: '',
    minCartValue: '1000',
    category: 'Beverages',
    customerType: 'Regular',
    days: [],
    minQuantity: '5',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/promotions-discounts/discount-rules');
      const fetchedData = response.data?.data?.rules || response.data?.data || [];
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

  // Validation function
  const validateForm = (data) => {
    const errs = {};
    if (!data.name || data.name.trim().length < 3) {
      errs.name = 'Rule name must be at least 3 characters';
    }

    const dl = (data.discountLimit || '').trim();
    if (!dl) {
      errs.discountLimit = 'Discount value is required';
    } else {
      const isPercentage = dl.endsWith('%');
      const isRupees = dl.toLowerCase().startsWith('rs.');
      const isNumeric = !isNaN(parseFloat(dl)) && isFinite(dl);
      if (!isPercentage && !isRupees && !isNumeric) {
        errs.discountLimit = 'Must be a percentage (e.g. 15%) or Rupee amount (e.g. Rs.500)';
      } else {
        const val = parseFloat(dl.replace(/[^0-9.]/g, ''));
        if (isNaN(val) || val <= 0) {
          errs.discountLimit = 'Discount value must be a positive number';
        } else if (isPercentage && val > 100) {
          errs.discountLimit = 'Percentage discount cannot exceed 100%';
        }
      }
    }

    if (data.type === 'Cart Total') {
      const val = parseFloat(data.minCartValue);
      if (!data.minCartValue || isNaN(val) || val <= 0) {
        errs.minCartValue = 'Minimum cart value must be a positive number';
      }
    } else if (data.type === 'Quantity Based') {
      const val = parseInt(data.minQuantity, 10);
      if (!data.minQuantity || isNaN(val) || val <= 0) {
        errs.minQuantity = 'Minimum quantity must be a positive integer';
      }
    } else if (data.type === 'Day Based') {
      if (!data.days || data.days.length === 0) {
        errs.days = 'Select at least one weekday';
      }
    }

    return errs;
  };

  React.useEffect(() => {
    if (isModalOpen) {
      setErrors(validateForm(formData));
    }
  }, [formData, isModalOpen]);

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

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Pagination calculations
  const totalItems = filteredRules.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedRules = useMemo(() => {
    return filteredRules.slice(startIndex, startIndex + pageSize);
  }, [filteredRules, startIndex, pageSize]);

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
      discountLimit: '10%',
      status: 'Active',
      description: '',
      minCartValue: '1000',
      category: 'Beverages',
      customerType: 'Regular',
      days: [],
      minQuantity: '5',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditMode(true);
    setErrorMessage('');
    setCurrentRule(rule);
    
    // Parse condition string back into sub-form fields
    const parsed = parseCondition(rule.type, rule.condition);
    
    setFormData({ 
      ...rule,
      description: rule.description || '',
      minCartValue: parsed.minCartValue || '1000',
      category: parsed.category || 'Beverages',
      customerType: parsed.customerType || 'Regular',
      days: parsed.days || [],
      minQuantity: parsed.minQuantity || '5',
    });
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

    const validationErrs = validateForm(formData);
    if (Object.keys(validationErrs).length > 0) {
      setErrorMessage("Please correct the errors in the form before submitting.");
      return;
    }

    // Format dynamic inputs back to database condition string
    const conditionString = formatCondition(formData.type, formData);

    const payload = {
      name: formData.name.trim(),
      type: formData.type,
      condition: conditionString,
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
    <div className="space-y-6 fade-up pb-8">
      
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
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col select-none min-h-[480px]">
        
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
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4 font-bold w-[22%]">Rule Name</th>
                <th className="px-6 py-4 font-bold w-[18%]">Rule Type</th>
                <th className="px-6 py-4 font-bold w-[25%]">Condition</th>
                <th className="px-6 py-4 font-bold w-[15%]">Discount Value</th>
                <th className="px-6 py-4 font-bold text-center w-[10%]">Status</th>
                <th className="px-6 py-4 font-bold text-center w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 select-none">
                    Loading discount rules...
                  </td>
                </tr>
              ) : paginatedRules.length > 0 ? (
                paginatedRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-blue-50/10 transition-colors duration-150">
                    <td className="px-6 py-5 whitespace-nowrap font-bold text-slate-800">
                      {rule.name}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-slate-500 font-semibold">
                      {rule.type}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-slate-600 font-medium font-mono text-[11px]">
                      {rule.condition}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap font-extrabold text-slate-800">
                      {rule.discountLimit}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <Badge variant={rule.status === 'Active' ? 'success' : 'danger'}>
                        {rule.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center relative">
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
                              <div className="absolute right-0 bottom-full mb-1.5 w-28 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden text-xs text-left">
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
          <span>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} Rules
          </span>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 flex items-center justify-center transition-colors hover:bg-slate-50"
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors shadow-sm ${
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-50 flex items-center justify-center transition-colors hover:bg-slate-50"
            >
              &gt;
            </button>
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
        <form onSubmit={handleFormSubmit} className="space-y-6 text-xs font-bold text-slate-700">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-3">
              Section 1: Basic Information
            </h4>
            
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
              {formData.name.trim().length > 0 && errors.name && (
                <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.name}</span>
              )}
            </div>

            {/* Rule Type */}
            <div className="space-y-1">
              <label className="block text-slate-500 mb-1">Rule Type</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFormData({
                    ...formData,
                    type: newType,
                    minCartValue: newType === 'Cart Total' ? '1000' : formData.minCartValue,
                    category: newType === 'Product Category' ? 'Beverages' : formData.category,
                    customerType: newType === 'Customer Type' ? 'Regular' : formData.customerType,
                    days: newType === 'Day Based' ? [] : formData.days,
                    minQuantity: newType === 'Quantity Based' ? '5' : formData.minQuantity,
                  });
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="Cart Total">Cart Total</option>
                <option value="Product Category">Product Category</option>
                <option value="Customer Type">Customer Type</option>
                <option value="Day Based">Day Based</option>
                <option value="Quantity Based">Quantity Based</option>
              </select>
              <span className="text-[10px] text-slate-400 font-medium block mt-1 select-none">
                The discount will automatically apply when this condition is satisfied.
              </span>
            </div>

            {/* Optional Description (frontend only) */}
            <div className="space-y-1">
              <label className="block text-slate-500 mb-1">Description (Optional)</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Brief notes about this discount rule policy..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all resize-none font-semibold text-slate-700"
              />
            </div>
          </div>

          {/* Section 2: Rule Configuration */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-black text-blue-600 uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-3">
              Section 2: Rule Configuration
            </h4>

            {/* Dynamic Condition Inputs */}
            {formData.type === 'Cart Total' && (
              <div className="space-y-1">
                <label className="block text-slate-500 mb-1">Minimum Cart Value</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minCartValue}
                    onChange={(e) => setFormData({ ...formData, minCartValue: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                    placeholder="10000"
                  />
                </div>
                {formData.minCartValue.trim().length > 0 && errors.minCartValue && (
                  <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.minCartValue}</span>
                )}
              </div>
            )}

            {formData.type === 'Product Category' && (
              <div className="space-y-1">
                <label className="block text-slate-500 mb-1">Product Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="Beverages">Beverages</option>
                  <option value="Dairy">Dairy</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Home Care">Home Care</option>
                </select>
              </div>
            )}

            {formData.type === 'Customer Type' && (
              <div className="space-y-1">
                <label className="block text-slate-500 mb-1">Customer Type</label>
                <select
                  value={formData.customerType}
                  onChange={(e) => setFormData({ ...formData, customerType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
                >
                  <option value="Regular">Regular</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            )}

            {formData.type === 'Day Based' && (
              <div className="space-y-1.5">
                <label className="block text-slate-500 mb-1">Select Weekdays</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const isChecked = (formData.days || []).includes(day);
                    return (
                      <label key={day} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer select-none font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            let updatedDays = [...formData.days];
                            if (isChecked) {
                              updatedDays = updatedDays.filter(d => d !== day);
                            } else {
                              updatedDays.push(day);
                            }
                            setFormData({ ...formData, days: updatedDays });
                          }}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{day.substring(0, 3)}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.days && (
                  <span className="text-[10px] text-amber-600 font-bold block mt-1">{errors.days}</span>
                )}
              </div>
            )}

            {formData.type === 'Quantity Based' && (
              <div className="space-y-1">
                <label className="block text-slate-500 mb-1">Minimum Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                  placeholder="5"
                />
                {formData.minQuantity.trim().length > 0 && errors.minQuantity && (
                  <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.minQuantity}</span>
                )}
              </div>
            )}

            {/* Discount Value */}
            <div className="space-y-1">
              <label className="block text-slate-500 mb-1">Discount Value</label>
              <input
                type="text"
                required
                value={formData.discountLimit}
                onChange={(e) => setFormData({ ...formData, discountLimit: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. 20% or Rs.500"
              />
              {formData.discountLimit.trim().length > 0 && errors.discountLimit && (
                <span className="text-[10px] text-red-500 font-bold block mt-1">{errors.discountLimit}</span>
              )}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-slate-500 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 outline-none transition-all cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            {/* Read-only Execution Priority */}
            <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Execution Priority</span>
                <span className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5 block select-none">
                  Assigned automatically based on rule order.
                </span>
              </div>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
                {editMode ? `#${formData.priority}` : 'Next Rank'}
              </span>
            </div>
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
              disabled={Object.keys(errors).length > 0 || !formData.name.trim() || !formData.discountLimit.trim()}
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
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Discount Value</span>
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
                <span className="font-semibold text-slate-400">Discount Value</span>
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
