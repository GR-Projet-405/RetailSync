import React, { useState, useMemo } from 'react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import Card, { CardContent } from '../../components/Card';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { Ticket, Plus, Copy, Check, Users, Calendar, Info, MapPin, ChevronDown, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function CouponManagementPage() {
  const { user, hasRole } = useAuth();
  const isBranchManager = hasRole('BRANCH_MANAGER');

  const [copiedId, setCopiedId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  
  // Stateful coupons list
  const [coupons, setCoupons] = useState([
    { id: 1, code: 'WELCOME20', discount: '20% OFF', type: 'Percentage', limit: '500 Usages', perCustomer: '1', minPurchase: 'Rs. 500', used: 142, status: 'Active', branch: 'All Branches' },
    { id: 2, code: 'WINTER500', discount: 'Rs. 500 OFF', type: 'Fixed Amount', limit: '100 Usages', perCustomer: '2', minPurchase: 'Rs. 2,000', used: 100, status: 'Expired', branch: 'Downtown Flagship' },
    { id: 3, code: 'FREESHIP', discount: 'Free Shipping', type: 'Free Shipping', limit: 'Unlimited', perCustomer: 'Unlimited', minPurchase: 'Rs. 1,000', used: 843, status: 'Active', branch: 'All Branches' },
  ]);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: '',
    usageLimit: 'Unlimited',
    perCustomerLimit: '1',
    startDate: '01 Jun 2026',
    endDate: '30 Jun 2026',
    minPurchase: '',
    branch: 'All Branches'
  });

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
    if (isBranchManager) {
      const managerBranch = user?.branchId?.name || 'Downtown Flagship';
      return coupons.filter(c => c.branch === managerBranch || c.branch === 'All Branches');
    }
    return coupons;
  }, [coupons, isBranchManager, user]);

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
      startDate: '01 Jun 2026',
      endDate: '30 Jun 2026',
      minPurchase: 'Rs. 500',
      branch: 'All Branches'
    });
    setIsCreateModalOpen(true);
  };

  const handleEditOpen = (coupon) => {
    setEditMode(true);
    setCurrentCoupon(coupon);
    
    // Parse discount label to numeric value
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
      startDate: '01 Jun 2026',
      endDate: '30 Jun 2026',
      minPurchase: coupon.minPurchase,
      branch: coupon.branch
    });
    setIsCreateModalOpen(true);
  };

  const toggleStatus = (id) => {
    setCoupons(coupons.map(c => 
      c.id === id ? { ...c, status: c.status === 'Active' ? 'Expired' : 'Active' } : c
    ));
  };

  const handleDeleteCoupon = (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      setCoupons(coupons.filter(c => c.id !== id));
    }
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!formData.code) {
      alert("Please enter a coupon code");
      return;
    }

    // Determine discount label
    let discountLabel = '';
    if (formData.discountType === 'Percentage') {
      discountLabel = `${formData.discountValue}% OFF`;
    } else if (formData.discountType === 'Fixed Amount') {
      discountLabel = `Rs. ${formData.discountValue} OFF`;
    } else {
      discountLabel = 'Free Shipping';
    }

    if (editMode) {
      setCoupons(coupons.map(c => c.id === currentCoupon.id ? {
        ...c,
        code: formData.code.toUpperCase().replace(/\s+/g, ''),
        discount: discountLabel,
        type: formData.discountType,
        limit: formData.usageLimit || 'Unlimited',
        perCustomer: formData.perCustomerLimit || 'Unlimited',
        minPurchase: formData.minPurchase || 'Rs. 0',
        branch: formData.branch
      } : c));
    } else {
      const newCoupon = {
        id: coupons.length > 0 ? Math.max(...coupons.map(c => c.id)) + 1 : 1,
        code: formData.code.toUpperCase().replace(/\s+/g, ''),
        discount: discountLabel,
        type: formData.discountType,
        limit: formData.usageLimit || 'Unlimited',
        perCustomer: formData.perCustomerLimit || 'Unlimited',
        minPurchase: formData.minPurchase || 'Rs. 0',
        used: 0,
        status: 'Active',
        branch: formData.branch
      };
      setCoupons([newCoupon, ...coupons]);
    }
    setIsCreateModalOpen(false);
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

      {/* Grid displaying created coupons */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCoupons.map((coupon) => (
          <Card key={coupon.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow select-none">
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
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
                Branch: <span className="text-slate-600 font-semibold">{coupon.branch}</span>
              </p>

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
                  onClick={() => toggleStatus(coupon.id)}
                  className="text-slate-600 hover:text-blue-600"
                  title={coupon.status === 'Active' ? 'Deactivate/Pause Coupon' : 'Activate Coupon'}
                >
                  {coupon.status === 'Active' ? <Pause size={14} className="mr-1" /> : <Play size={14} className="mr-1" />}
                  {coupon.status === 'Active' ? 'Pause' : 'Activate'}
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
        ))}
      </div>

      {/* Spec Mockup-Aligned Create Coupon Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editMode ? 'Edit Coupon' : 'Create Coupon'}
        size="md"
      >
        <form onSubmit={handleSaveCoupon} className="space-y-5 text-xs font-bold text-slate-700">
          
          {/* Coupon Code input */}
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold select-none">Coupon Code</label>
            <input
              type="text"
              required
              placeholder="Enter Coupon code here"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
            />
            <span className="text-[10px] text-slate-400 block font-medium select-none">Customers will use this code at checkout</span>
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-600 font-semibold select-none">Discount Type</label>
              <div className="relative">
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Free Shipping">Free Shipping</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-600 font-semibold select-none">Discount Value</label>
              <div className="relative">
                <input
                  type="text"
                  disabled={formData.discountType === 'Free Shipping'}
                  placeholder="Enter Value"
                  value={formData.discountType === 'Free Shipping' ? '0' : formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  {formData.discountType === 'Percentage' ? '%' : formData.discountType === 'Fixed Amount' ? 'Rs.' : ''}
                </span>
              </div>
            </div>
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
              <label className="block text-slate-500 select-none">Start Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="01 Jun 2026"
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500 select-none">End Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
                  placeholder="30 Jun 2026"
                />
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Minimum purchase Amount */}
          <div className="space-y-1">
            <label className="block text-slate-600 font-semibold select-none">Minimum purchase Amount</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Rs. 500 (optional)"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
            </div>
          </div>

          {/* Apply To Branch */}
          <div className="space-y-1">
            <label className="block text-slate-500 select-none">Apply To Branch</label>
            <div className="relative">
              <select
                disabled={isBranchManager}
                value={isBranchManager ? (user?.branchId?.name || 'Downtown Flagship') : formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all ${
                  isBranchManager 
                    ? 'opacity-85 cursor-not-allowed bg-slate-100 border-slate-200' 
                    : 'bg-slate-50/75 border-slate-200 focus:border-blue-500 focus:bg-white cursor-pointer'
                }`}
              >
                <option value="All Branches">All Branches</option>
                <option value="Downtown Flagship">Downtown Flagship</option>
                <option value="North Branch">North Branch</option>
                <option value="South Branch">South Branch</option>
              </select>
              {!isBranchManager && <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
            </div>
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
              className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md rounded-xl transition-all cursor-pointer outline-none"
            >
              {editMode ? 'Save Changes' : 'Save Coupon'}
            </button>
          </div>

        </form>
      </Modal>
    </div>
  );
}
