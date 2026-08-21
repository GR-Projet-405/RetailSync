import React, { useState, useMemo } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Card, { CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { Ticket, Plus, Copy, Check, Users, Calendar, Info, MapPin, ChevronDown, Edit2, Trash2, Play, Pause, Eye, Tag, Search, X, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CouponManagementPage() {
  const { user, hasRole } = useAuth();
  const isBranchManager = hasRole('BRANCH_MANAGER');
  const location = useLocation();
  const navigate = useNavigate();

  const [copiedId, setCopiedId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPromoFilter, setSelectedPromoFilter] = useState('All');
  const [branches, setBranches] = useState([]);
  const [highlightedCouponId, setHighlightedCouponId] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleViewOpen = (coupon) => {
    setCurrentCoupon(coupon);
    setIsDetailModalOpen(true);
  };
  
  // Stateful coupons list
  const [coupons, setCoupons] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    usageLimit: 'Unlimited',
    perCustomerLimit: '1',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    minPurchase: '',
    branch: 'All Branches',
    promotionId: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]);

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/promotions-discounts', { params: { limit: 1000 }, timeout: 45000 });
      setPromotions(response.data?.data?.promotions || []);
    } catch (err) {
      console.error('Failed to fetch promotions mapping:', err);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await api.get('/branch-management/active', { timeout: 45000 });
      setBranches(response.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch active branches list:', err);
    }
  };

  const fetchCoupons = async () => {
    console.log('[DEBUG] fetchCoupons started');
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/promotions-discounts/coupons', { params: { limit: 1000 }, timeout: 45000 });
      console.log('[DEBUG] fetchCoupons response received:', response.status, response.data);
      const fetchedData = response.data?.data?.coupons || [];
      console.log('[DEBUG] fetchedData count:', fetchedData.length);
      const mappedData = fetchedData.map(c => {
        let discountLabel = '';
        if (c.discountType === 'Percentage') {
          discountLabel = `${c.discountValue}% OFF`;
        } else if (c.discountType === 'Fixed Amount') {
          discountLabel = `Rs. ${c.discountValue} OFF`;
        } else {
          discountLabel = 'Free Shipping';
        }

        try {
          return {
            ...c,
            id: c._id,
            code: c.code,
            discount: discountLabel,
            type: c.discountType,
            limit: c.usageLimit !== null && c.usageLimit !== undefined ? `${c.usageLimit} Usages` : 'Unlimited',
            perCustomer: c.perCustomerLimit !== null && c.perCustomerLimit !== undefined ? c.perCustomerLimit.toString() : 'Unlimited',
            minPurchase: c.minPurchaseAmount ? `Rs. ${c.minPurchaseAmount}` : 'Rs. 0',
            used: c.usageCount || 0,
            branch: c.branchId ? c.branchId.name : 'All Branches',
            startDate: c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '',
            endDate: c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : ''
          };
        } catch (mapErr) {
          console.error('[DEBUG] Error mapping coupon:', c, mapErr);
          throw mapErr;
        }
      });
      console.log('[DEBUG] mappedData successfully created:', mappedData);
      setCoupons(mappedData);
    } catch (err) {
      console.error('[DEBUG] Failed to fetch coupons error caught:', err);
      setError(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCoupons();
    fetchPromotions();
    fetchBranches();
  }, []);

  React.useEffect(() => {
    if (location.state?.openCreateModal) {
      setEditMode(false);
      setFormData({
        code: '',
        discountType: 'Percentage',
        discountValue: '20',
        usageLimit: '500 Usages',
        perCustomerLimit: '1',
        startDate: '2026-06-01',
        endDate: '2026-06-30',
        minPurchase: 'Rs. 500',
        branch: 'All Branches',
        promotionId: location.state.promotionId || ''
      });
      setIsCreateModalOpen(true);
      // Clear location state to prevent reopening on reload
      navigate(location.pathname, { replace: true, state: {} });
    } else if (location.state?.selectedPromoId) {
      setSelectedPromoFilter(location.state.selectedPromoId);
      // Clear location state to prevent locking the filter on page reload
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  React.useEffect(() => {
    if (formData.promotionId) {
      const promo = promotions.find(p => p._id === formData.promotionId || p.id === formData.promotionId);
      if (promo) {
        const promoBranch = promo.branchId?.name || promo.branchId || 'All Branches';
        const promoStart = promo.startDate ? new Date(promo.startDate).toISOString().split('T')[0] : '';
        const promoEnd = promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '';
        setFormData(prev => {
          if (prev.branch !== promoBranch || prev.startDate !== promoStart || prev.endDate !== promoEnd) {
            return {
              ...prev,
              branch: promoBranch,
              startDate: promoStart,
              endDate: promoEnd
            };
          }
          return prev;
        });
      }
    }
  }, [formData.promotionId, promotions]);

  const getCouponFormErrors = (data) => {
    const errs = {};
    if (!data.code.trim()) {
      errs.code = "Coupon code is required";
    } else if (data.code.trim().length < 3) {
      errs.code = "Coupon code must be at least 3 characters";
    }

    if (data.discountType !== 'Free Shipping') {
      const discVal = Number(data.discountValue.toString().replace(/[^0-9.]/g, '')) || 0;
      if (!data.discountValue) {
        errs.discountValue = "Discount value is required";
      } else if (isNaN(discVal) || discVal <= 0) {
        errs.discountValue = "Discount value must be a positive number";
      } else if (data.discountType === 'Percentage' && discVal > 100) {
        errs.discountValue = "Percentage discount cannot exceed 100%";
      }
    }

    if (!data.startDate) {
      errs.startDate = "Start date is required";
    }
    if (!data.endDate) {
      errs.endDate = "End date is required";
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        errs.endDate = "End date must be on or after the start date";
      }
    }

    // Fixed Discount Limit
    if (data.discountType === 'Fixed Amount') {
      const discVal = Number(data.discountValue.toString().replace(/[^0-9.]/g, '')) || 0;
      const minPurchAmount = Number(data.minPurchase.toString().replace(/[^0-9]/g, '')) || 0;
      if (discVal > minPurchAmount) {
        errs.discountValue = "Fixed discount cannot exceed the minimum purchase amount";
      }
    }

    return errs;
  };

  React.useEffect(() => {
    setFormErrors(getCouponFormErrors(formData));
  }, [formData, promotions]);

  // Sync inherited values (dates, minPurchase) from selected promotion
  React.useEffect(() => {
    if (formData.promotionId) {
      const selectedPromo = promotions.find(p => p._id === formData.promotionId || p.id === formData.promotionId);
      if (selectedPromo) {
        const startD = selectedPromo.startDate ? new Date(selectedPromo.startDate).toISOString().split('T')[0] : '';
        const endD = selectedPromo.endDate ? new Date(selectedPromo.endDate).toISOString().split('T')[0] : '';
        
        // Format minOrderValue clean as numeric string (layout renders Rs. prefix via prefix span)
        const minVal = selectedPromo.minOrderValue !== undefined && selectedPromo.minOrderValue !== null
          ? selectedPromo.minOrderValue.toString()
          : '0';

        setFormData(prev => {
          if (prev.startDate !== startD || prev.endDate !== endD || prev.minPurchase !== minVal) {
            return {
              ...prev,
              startDate: startD,
              endDate: endD,
              minPurchase: minVal
            };
          }
          return prev;
        });
      }
    }
  }, [formData.promotionId, promotions]);

  // BR-SALE-002: Coupon threshold warning memo
  const showThresholdWarning = useMemo(() => {
    const rawVal = parseFloat(formData.discountValue) || 0;
    if (formData.discountType === 'Percentage') {
      return rawVal > 50;
    } else if (formData.discountType === 'Fixed Amount') {
      return rawVal > 1000;
    }
    return false;
  }, [formData.discountValue, formData.discountType]);

  // BR-ACC-003: Filter coupons list for branch manager visibility
  const filteredCoupons = useMemo(() => {
    let result = coupons;
    if (isBranchManager) {
      const managerBranch = user?.branchId?.name || 'Downtown Flagship';
      result = result.filter(c => c.branch === managerBranch || c.branch === 'All Branches');
    }

    // Search filter (Coupon Code or Promotion Name)
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(c => {
        const promoName = c.promotionId?.name || promotions.find(p => p._id === (c.promotionId?._id || c.promotionId))?.name || 'Standalone';
        return (
          c.code.toLowerCase().includes(query) ||
          promoName.toLowerCase().includes(query)
        );
      });
    }

    // Promotion dropdown filter
    if (selectedPromoFilter !== 'All') {
      result = result.filter(c => {
        const promoId = c.promotionId?._id || c.promotionId || null;
        if (selectedPromoFilter === 'Standalone') {
          return !promoId;
        }
        return promoId === selectedPromoFilter;
      });
    }

    return result;
  }, [coupons, isBranchManager, user, searchTerm, selectedPromoFilter, promotions]);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreateModal = () => {
    setEditMode(false);
    setFormData({
      code: '',
      discountType: 'Percentage',
      discountValue: '20',
      usageLimit: '500 Usages',
      perCustomerLimit: '1',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      minPurchase: 'Rs. 500',
      branch: 'All Branches',
      promotionId: ''
    });
    setIsCreateModalOpen(true);
  };

  const handleEditOpen = (coupon) => {
    setEditMode(true);
    setCurrentCoupon(coupon);
    
    let discountVal = '20';
    if (coupon.discount.includes('%')) {
      discountVal = coupon.discount.replace('% OFF', '').trim();
    } else if (coupon.discount.includes('Rs.')) {
      discountVal = coupon.discount.replace('Rs.', '').replace('OFF', '').trim();
    }

    setFormData({
      code: coupon.code,
      discountType: coupon.type,
      discountValue: discountVal,
      usageLimit: coupon.limit,
      perCustomerLimit: coupon.perCustomer,
      startDate: coupon.startDate || '2026-06-01',
      endDate: coupon.endDate || '2026-06-30',
      minPurchase: coupon.minPurchase,
      branch: coupon.branch,
      promotionId: coupon.promotionId?._id || coupon.promotionId || ''
    });
    setIsCreateModalOpen(true);
  };

  const toggleStatus = async (coupon) => {
    const nextStatus = coupon.status === 'Active' ? 'Paused' : 'Active';
    try {
      setLoading(true);
      await api.put(`/promotions-discounts/coupons/${coupon.id}`, { status: nextStatus });
      await fetchCoupons();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        setLoading(true);
        await api.delete(`/promotions-discounts/coupons/${id}`);
        alert("Coupon deleted successfully");
        await fetchCoupons();
      } catch (err) {
        console.error('Failed to delete coupon:', err);
        alert(err.response?.data?.message || err.message || 'Failed to delete coupon');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (Object.keys(formErrors).length > 0) {
      alert("Please fix the validation errors in the form before saving.");
      return;
    }

    // Build branch lookup map
    const map = {};
    if (user?.branchId) {
      map[user.branchId.name] = user.branchId._id;
    }
    coupons.forEach(c => {
      if (c.branchId) {
        map[c.branchId.name] = c.branchId._id;
      }
    });

    const targetBranchId = formData.branch === 'All Branches' ? null : map[formData.branch];

    // Convert values
    const discValue = formData.discountType === 'Free Shipping' ? 0 : Number(formData.discountValue.toString().replace(/[^0-9]/g, '')) || 0;
    const minPurchAmount = Number(formData.minPurchase.toString().replace(/[^0-9]/g, '')) || 0;
    
    let usageLimitNum = null;
    if (formData.usageLimit && formData.usageLimit !== 'Unlimited') {
      usageLimitNum = Number(formData.usageLimit.toString().replace(/[^0-9]/g, ''));
    }

    let perCustLimitNum = 1;
    if (formData.perCustomerLimit && formData.perCustomerLimit !== 'Unlimited') {
      perCustLimitNum = Number(formData.perCustomerLimit.toString().replace(/[^0-9]/g, '')) || 1;
    } else if (formData.perCustomerLimit === 'Unlimited') {
      perCustLimitNum = 999999;
    }

    const payload = {
      name: `Coupon ${formData.code.toUpperCase().replace(/\s+/g, '')}`,
      code: formData.code.toUpperCase().replace(/\s+/g, ''),
      discountType: formData.discountType,
      discountValue: discValue,
      usageLimit: usageLimitNum,
      perCustomerLimit: perCustLimitNum,
      minPurchaseAmount: minPurchAmount,
      branchId: targetBranchId,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      promotionId: formData.promotionId || null
    };

    try {
      setLoading(true);
      let response;
      if (editMode) {
        response = await api.put(`/promotions-discounts/coupons/${currentCoupon.id}`, payload, { timeout: 45000 });
        const updatedId = response.data?.data?._id || currentCoupon.id;
        setHighlightedCouponId(updatedId);
        setTimeout(() => setHighlightedCouponId(null), 5000);
      } else {
        response = await api.post('/promotions-discounts/coupons', payload, { timeout: 45000 });
        const newCouponId = response.data?.data?._id;
        if (newCouponId) {
          setHighlightedCouponId(newCouponId);
          setTimeout(() => setHighlightedCouponId(null), 5000);
        }
      }
      setIsCreateModalOpen(false);
      setSelectedPromoFilter(formData.promotionId || 'All');
      await fetchCoupons();
    } catch (err) {
      console.error('Failed to save coupon:', err);
      alert(err.response?.data?.message || err.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupon Management"
        description="Create and track coupon codes and promotional campaigns."
        actions={
          <Button 
            onClick={handleOpenCreateModal}
            variant="primary" 
            className="rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Generate Coupon</span>
          </Button>
        }
      />

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search coupons or promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter by Promotion:</span>
          <div className="relative">
            <select
              value={selectedPromoFilter}
              onChange={(e) => setSelectedPromoFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none text-xs font-semibold text-slate-700 appearance-none pr-9 cursor-pointer focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="All">All Campaigns</option>
              <option value="Standalone">Standalone Only</option>
              {promotions.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid displaying created coupons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCoupons.map((coupon) => {
          const isHighlighted = highlightedCouponId === coupon.id || highlightedCouponId === coupon._id;
          return (
            <Card 
              key={coupon.id} 
              className={`overflow-hidden shadow-sm hover:shadow-md select-none transition-all duration-500 ${
                isHighlighted 
                  ? 'ring-2 ring-blue-500 border-blue-400 scale-[1.02] shadow-xl shadow-blue-500/10 bg-blue-50/5' 
                  : 'border-slate-200'
              }`}
            >
              <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Ticket size={20} />
                </div>
                <Badge variant={coupon.status === 'Active' ? 'success' : 'neutral'}>
                  {coupon.status}
                </Badge>
              </div>

              {/* Coupon Code Block */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4">
                <code className="text-sm font-bold text-slate-800 tracking-wider font-mono">{coupon.code}</code>
                <button
                  onClick={() => copyToClipboard(coupon.code, coupon.id)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  title="Copy Coupon Code"
                >
                  {copiedId === coupon.id ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{coupon.discount}</h3>
              <div className="space-y-1.5 mb-3 font-semibold select-none">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={12} className="text-blue-500 shrink-0" />
                  <span>Promotion:</span>
                  {(() => {
                    const parentPromo = promotions.find(p => p._id === (coupon.promotionId?._id || coupon.promotionId));
                    return parentPromo ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-extrabold normal-case leading-none">
                        {parentPromo.name}
                      </span>
                    ) : (
                      <Badge variant="neutral">Standalone</Badge>
                    );
                  })()}
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Branch: <span className="text-slate-600 font-semibold">{coupon.branch}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-500 mb-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Min Purchase</span>
                  <span className="text-slate-700">{coupon.minPurchase}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Per Customer</span>
                  <span className="text-slate-700">{coupon.perCustomer} limit</span>
                </div>
              </div>

              {/* Usages statistics */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-slate-400" />
                  <span>{coupon.used} used</span>
                </div>
                <div>
                  <span className="text-slate-400">Limit: </span>
                  <span className="font-semibold text-slate-700">{coupon.limit}</span>
                </div>
              </div>

              {/* Administrative Actions Block */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4 mt-4 select-none">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewOpen(coupon)}
                  className="text-blue-605 text-blue-650 hover:bg-blue-50 font-bold"
                  title="View Coupon Details"
                >
                  <Eye size={14} />
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditOpen(coupon)}
                  className="text-slate-600 hover:text-blue-600"
                  title="Edit Coupon"
                >
                  <Edit2 size={14} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteCoupon(coupon.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  title="Delete Coupon"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

            </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 animate-pulse select-none">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                <div className="w-16 h-5 bg-slate-100 rounded-full" />
              </div>
              <div className="h-12 bg-slate-50 border border-slate-100 rounded-xl" />
              <div className="h-6 bg-slate-100 rounded w-2/3" />
              <div className="grid grid-cols-2 gap-2.5 h-12 bg-slate-50 border border-slate-50 rounded-xl" />
              <div className="flex justify-between items-center pt-2">
                <div className="w-1/3 h-4 bg-slate-100 rounded" />
                <div className="w-1/4 h-4 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredCoupons.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm select-none">
          <Ticket className="mx-auto w-12 h-12 text-slate-300 mb-3 animate-pulse" />
          <h3 className="text-sm font-bold text-slate-800">No Coupons Found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 font-medium leading-relaxed">
            Generate your first checkout coupon code or select another promotion campaign filter to display coupons.
          </p>
        </div>
      )}

      {/* Spec Mockup-Aligned Create Coupon Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editMode ? 'Edit Coupon' : 'Create Coupon'}
        size="md"
      >
        <form onSubmit={handleSaveCoupon} onKeyDown={handleFormKeyDown} className="space-y-5 text-xs font-bold text-slate-700">
          
          {/* Promotion Campaign dropdown */}
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold select-none">Promotion Campaign</label>
            <div className="relative">
              <select
                required
                value={formData.promotionId}
                onChange={(e) => setFormData({ ...formData, promotionId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="">Standalone Coupon (No Promotion)</option>
                {promotions.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Campaign Information Card */}
          {formData.promotionId && (() => {
            const selectedPromo = promotions.find(p => p._id === formData.promotionId || p.id === formData.promotionId);
            if (!selectedPromo) return null;
            return (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 select-none space-y-2.5 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2 border-b border-slate-200/60 pb-1.5 mb-1 text-slate-800 font-bold">
                  <Info size={14} className="text-blue-500 shrink-0" />
                  <span>Campaign Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Campaign Name</span>
                    <span className="text-slate-800 font-extrabold">{selectedPromo.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Status</span>
                    <span className="text-slate-850 font-extrabold">{selectedPromo.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Branch</span>
                    <span className="text-slate-850 font-extrabold">{selectedPromo.branch || selectedPromo.branchId?.name || 'All Branches'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Duration</span>
                    <span className="text-slate-850 font-extrabold font-mono">
                      {selectedPromo.startDate ? new Date(selectedPromo.startDate).toISOString().split('T')[0] : ''} to {selectedPromo.endDate ? new Date(selectedPromo.endDate).toISOString().split('T')[0] : ''}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Eligible Categories</span>
                    <span className="text-slate-850 font-extrabold">
                      {selectedPromo.categories ? selectedPromo.categories.map(c => c.name || c).join(', ') || 'All' : 'All'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Coupon Code input */}
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold select-none">Coupon Code</label>
            <input
              type="text"
              required
              placeholder="Enter Coupon code here"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className={`w-full px-4 py-2.5 bg-slate-50/75 border rounded-xl outline-none font-semibold text-slate-800 placeholder-slate-400 focus:ring-1 transition-all uppercase ${
                formErrors.code ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {formErrors.code ? (
              <span className="text-[10px] text-red-500 font-bold block mt-1">{formErrors.code}</span>
            ) : (
              <span className="text-[10px] text-slate-400 block font-medium select-none">Customers will use this code at checkout</span>
            )}
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-600 font-semibold select-none">Discount Type</label>
              <div className="relative">
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value, discountValue: e.target.value === 'Free Shipping' ? '0' : formData.discountValue })}
                  className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Free Shipping">Free Shipping</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {formData.discountType !== 'Free Shipping' ? (
              <div className="space-y-1">
                <label className="block text-slate-600 font-semibold select-none">Discount Value</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Enter Value"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className={`w-full py-2.5 bg-slate-50/75 border rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 transition-all ${
                      formData.discountType === 'Percentage' ? 'pl-4 pr-10' : 'pl-10 pr-4'
                    } ${
                      formErrors.discountValue ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                  {formData.discountType === 'Percentage' ? (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-sans">
                      %
                    </span>
                  ) : (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-sans">
                      Rs.
                    </span>
                  )}
                </div>
                {formErrors.discountValue && (
                  <span className="text-[10px] text-red-500 font-bold block mt-1">{formErrors.discountValue}</span>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-slate-405 font-semibold select-none">Discount Value</label>
                <input
                  type="text"
                  disabled
                  value="N/A (Free Shipping)"
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-205 rounded-xl outline-none font-semibold text-slate-400"
                />
              </div>
            )}
          </div>

          {showThresholdWarning && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[10px] font-bold select-none leading-relaxed">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                !
              </div>
              <p className="flex-1">
                BR-SALE-002: Coupon discounts exceeding 50% or Rs. 1,000 require Branch Manager approval.
              </p>
            </div>
          )}

          {/* Usage Limit & Per Customer Limit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-600 font-semibold select-none">Usage limit</label>
              <div className="relative">
                <select
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="Unlimited">Unlimited</option>
                  <option value="100 Usages">100 Usages</option>
                  <option value="500 Usages">500 Usages</option>
                  <option value="1000 Usages">1000 Usages</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-600 font-semibold select-none">Per Customer limit</label>
              <input
                type="text"
                placeholder="Enter Value"
                value={formData.perCustomerLimit}
                onChange={(e) => setFormData({ ...formData, perCustomerLimit: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Start Date & End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="block text-slate-500 select-none font-semibold">Start Date</label>
                {formData.promotionId && <Lock size={12} className="text-slate-400 shrink-0" />}
              </div>
              <div className="relative">
                <input
                  type="date"
                  disabled={!!formData.promotionId}
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 transition-all ${
                    formData.promotionId 
                      ? 'opacity-85 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-500 font-mono'
                      : 'bg-slate-50/75 border-slate-200 focus:border-blue-500 focus:ring-blue-500 cursor-pointer font-mono'
                  }`}
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
              </div>
              {formData.promotionId ? (
                <span className="text-[10px] text-slate-400 block font-medium select-none mt-1">
                  Inherited from the selected promotion.
                </span>
              ) : formErrors.startDate ? (
                <span className="text-[10px] text-red-500 font-bold block mt-1">{formErrors.startDate}</span>
              ) : null}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="block text-slate-500 select-none font-semibold">End Date</label>
                {formData.promotionId && <Lock size={12} className="text-slate-400 shrink-0" />}
              </div>
              <div className="relative">
                <input
                  type="date"
                  disabled={!!formData.promotionId}
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 transition-all ${
                    formData.promotionId 
                      ? 'opacity-85 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-500 font-mono'
                      : 'bg-slate-50/75 border-slate-200 focus:border-blue-500 focus:ring-blue-500 cursor-pointer font-mono'
                  }`}
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
              </div>
              {formData.promotionId ? (
                <span className="text-[10px] text-slate-400 block font-medium select-none mt-1">
                  Inherited from the selected promotion.
                </span>
              ) : formErrors.endDate ? (
                <span className="text-[10px] text-red-500 font-bold block mt-1">{formErrors.endDate}</span>
              ) : null}
            </div>
          </div>

          {/* Minimum purchase Amount */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <label className="block text-slate-600 font-semibold select-none">Minimum purchase Amount</label>
              {formData.promotionId && <Lock size={12} className="text-slate-400 shrink-0" />}
            </div>
            <div className="relative">
              <input
                type="text"
                disabled={!!formData.promotionId}
                placeholder="Rs. 500 (optional)"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                className={`w-full pl-11 pr-4 py-2.5 border rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 transition-all ${
                  formData.promotionId 
                    ? 'opacity-85 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-500 font-mono'
                    : 'bg-slate-50/75 border-slate-200 focus:border-blue-500 focus:bg-white'
                }`}
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
            </div>
            {formData.promotionId && (
              <span className="text-[10px] text-slate-400 block font-medium select-none mt-1">
                Inherited from the selected promotion.
              </span>
            )}
          </div>

          {/* Apply To Branch */}
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <label className="block text-slate-550 select-none font-semibold">Apply To Branch</label>
              {formData.promotionId && <Lock size={12} className="text-slate-400 shrink-0" />}
            </div>
            <div className="relative">
              <select
                disabled={isBranchManager || !!formData.promotionId}
                value={isBranchManager ? (user?.branchId?.name || 'Downtown Flagship') : formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all ${
                  (isBranchManager || !!formData.promotionId)
                    ? 'opacity-85 cursor-not-allowed bg-slate-100 border-slate-205' 
                    : 'bg-slate-50/75 border-slate-200 focus:border-blue-500 focus:bg-white cursor-pointer'
                }`}
              >
                <option value="All Branches">All Branches</option>
                {branches.map(b => (
                  <option key={b._id} value={b.name}>{b.name}</option>
                ))}
              </select>
              {!(isBranchManager || !!formData.promotionId) && <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
            </div>
            {formData.promotionId && (
              <span className="text-[10px] text-slate-400 block font-medium select-none mt-1">
                Inherited from the selected promotion.
              </span>
            )}
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-slate-200/85 mt-6 select-none">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(formErrors).length > 0}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl transition-all outline-none cursor-pointer ${
                Object.keys(formErrors).length > 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-md'
              }`}
            >
              {editMode ? 'Save Changes' : 'Save Coupon'}
            </button>
          </div>

        </form>
      </Modal>

      {/* 6. View Coupon Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Coupon Details"
        size="md"
      >
        {currentCoupon && (
          <div className="space-y-6 text-sm text-slate-600 select-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">Coupon: {currentCoupon.code}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Target Branch: <span className="font-semibold text-slate-600">{currentCoupon.branch}</span></p>
              </div>
              <Badge variant={currentCoupon.status === 'Active' ? 'success' : 'neutral'}>
                {currentCoupon.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Discount Amount / Value</span>
                <span className="text-sm font-bold text-slate-800">{currentCoupon.discount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Discount Type</span>
                <span className="text-sm font-bold text-slate-800">{currentCoupon.type}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Start Date</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{currentCoupon.startDate || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">End Date</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{currentCoupon.endDate || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Min Purchase Amount</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{currentCoupon.minPurchase || 'Rs. 0'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Per Customer Limit</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{currentCoupon.perCustomer || 'Unlimited'}</span>
              </div>
            </div>

            {/* Usage Indicators */}
            <div className="border-t border-slate-100 pt-4">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Usage Statistics</h5>
              <div className="grid grid-cols-2 gap-3 text-center font-bold">
                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Usages Count</span>
                  <span className="text-sm text-slate-700 font-mono">{currentCoupon.used}</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Usage Limit</span>
                  <span className="text-sm text-slate-700 font-mono">{currentCoupon.limit}</span>
                </div>
              </div>
            </div>

            {/* Parent Promotion details */}
            <div className="border-t border-slate-100 pt-4 select-none">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Parent Promotion</h5>
              {(() => {
                const parentPromo = promotions.find(p => p._id === (currentCoupon.promotionId?._id || currentCoupon.promotionId));
                return parentPromo ? (
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3 font-semibold text-xs text-slate-650">
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
                      <span className="text-slate-400">Promotion Name</span>
                      <span className="text-slate-800 font-bold">{parentPromo.name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
                      <span className="text-slate-400">Status</span>
                      <Badge variant={parentPromo.status === 'Active' ? 'success' : parentPromo.status === 'Scheduled' ? 'primary' : 'danger'}>
                        {parentPromo.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/50">
                      <span className="text-slate-400">Discount Type</span>
                      <span className="text-slate-800 font-bold">{parentPromo.discountType || parentPromo.type || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Active Period</span>
                      <span className="text-slate-800 font-mono font-bold">
                        {parentPromo.startDate ? new Date(parentPromo.startDate).toLocaleDateString() : ''} - {parentPromo.endDate ? new Date(parentPromo.endDate).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                    Standalone Coupon (No linked promotion)
                  </div>
                );
              })()}
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
    </div>
  );
}
