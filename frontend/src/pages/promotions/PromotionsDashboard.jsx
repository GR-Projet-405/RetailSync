import React, { useState, useMemo } from 'react';
import { 
  Tag, Ticket, TrendingUp, ShoppingCart, Sparkles, X, Check, 
  ArrowUpRight, ArrowLeft, Calendar, Clock, MapPin, Layers, 
  Cpu, FileText, ChevronDown, Plus, Info 
} from 'lucide-react';
import PromotionHeader from '../../components/promotions/PromotionHeader';
import StatCard from '../../components/promotions/StatCard';
import PromotionChart from '../../components/promotions/PromotionChart';
import PromotionTable from '../../components/promotions/PromotionTable';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Base mock promotions data
const INITIAL_PROMOTIONS = [
  { id: 1, name: 'Summer sale', discount: '20 %', type: 'Percentage', revenue: 215450, orders: 615, usage: 320, roi: '3.2x', status: 'Active', branch: 'All Branches', startDate: '2026-06-01', startTime: '08:00 AM', endDate: '2026-06-15', endTime: '23:00 PM', minOrderValue: 'Rs. 500', maxUses: '1000', description: 'Annual summer campaign for seasonal inventory.', categories: ['All categories', 'Beverages'] },
  { id: 2, name: 'New Year Sale', discount: '20 %', type: 'Percentage', revenue: 128750, orders: 384, usage: 210, roi: '2.4x', status: 'Expired', branch: 'Downtown Flagship', startDate: '2026-01-01', startTime: '08:00 AM', endDate: '2026-01-10', endTime: '23:00 PM', minOrderValue: 'Rs. 500', maxUses: '1000', description: 'New year checkout discounts.', categories: ['All categories', 'Beverages'] },
  { id: 3, name: 'Flash Sale', discount: '30 %', type: 'Percentage', revenue: 81050, orders: 219, usage: 164, roi: '2.4x', status: 'Scheduled', branch: 'North Branch', startDate: '2026-07-15', startTime: '08:00 AM', endDate: '2026-07-20', endTime: '23:00 PM', minOrderValue: 'Rs. 500', maxUses: '500', description: 'Limited time flash clearance discount.', categories: ['Beverages'] },
  { id: 4, name: 'Weekend Offer', discount: 'Rs.500', type: 'Fixed Amount', revenue: 48000, orders: 120, usage: 95, roi: '2.1x', status: 'Active', branch: 'Downtown Flagship', startDate: '2026-06-12', startTime: '08:00 AM', endDate: '2026-06-14', endTime: '23:00 PM', minOrderValue: 'Rs. 2,000', maxUses: '200', description: 'Special weekend voucher rules.', categories: ['All categories'] },
  { id: 5, name: 'Mid-Year Clearance', discount: '50 %', type: 'Percentage', revenue: 185000, orders: 490, usage: 290, roi: '2.8x', status: 'Active', branch: 'South Branch', startDate: '2026-06-15', startTime: '08:00 AM', endDate: '2026-06-30', endTime: '23:00 PM', minOrderValue: 'Rs. 0', maxUses: '1000', description: 'Mid-season warehouse clearance discount.', categories: ['All categories', 'Beverages', 'Snacks', 'Others'] },
  { id: 6, name: 'BOGO Shoes', discount: 'Buy 1 Get 1', type: 'Percentage', revenue: 72000, orders: 180, usage: 110, roi: '1.9x', status: 'Scheduled', branch: 'Downtown Flagship', startDate: '2026-07-05', startTime: '08:00 AM', endDate: '2026-07-12', endTime: '23:00 PM', minOrderValue: 'Rs. 1,000', maxUses: '300', description: 'Footwear BOGO promotions.', categories: ['Others'] },
  { id: 7, name: 'VIP Loyalty Discount', discount: '15 %', type: 'Percentage', revenue: 95000, orders: 240, usage: 155, roi: '2.5x', status: 'Active', branch: 'All Branches', startDate: '2026-05-01', startTime: '08:00 AM', endDate: '2026-08-01', endTime: '23:00 PM', minOrderValue: 'Rs. 500', maxUses: '2000', description: 'VIP group discounts.', categories: ['All categories'] },
  { id: 8, name: 'End of Season Sale', discount: '40 %', type: 'Percentage', revenue: 310000, orders: 850, usage: 530, roi: '3.5x', status: 'Expired', branch: 'North Branch', startDate: '2026-02-01', startTime: '08:00 AM', endDate: '2026-02-28', endTime: '23:00 PM', minOrderValue: 'Rs. 500', maxUses: '2500', description: 'Winter season exit discounts.', categories: ['All categories', 'Snacks'] },
  { id: 9, name: 'Spring Fresh Kickoff', discount: 'Rs.300', type: 'Fixed Amount', revenue: 32000, orders: 90, usage: 75, roi: '1.7x', status: 'Expired', branch: 'South Branch', startDate: '2026-04-10', startTime: '08:00 AM', endDate: '2026-04-15', endTime: '23:00 PM', minOrderValue: 'Rs. 1,500', maxUses: '500', description: 'Spring fresh grocery discount vouchers.', categories: ['Beverages'] },
  { id: 10, name: 'Back to School BOGO', discount: 'Buy 1 Get 1', type: 'Percentage', revenue: 140000, orders: 360, usage: 220, roi: '2.2x', status: 'Active', branch: 'North Branch', startDate: '2026-08-15', startTime: '08:00 AM', endDate: '2026-09-05', endTime: '23:00 PM', minOrderValue: 'Rs. 1,000', maxUses: '800', description: 'Stationery and school supply specials.', categories: ['All categories', 'Others'] },
  { id: 11, name: 'Midnight Flash Promo', discount: '35 %', type: 'Percentage', revenue: 58000, orders: 145, usage: 115, roi: '2.0x', status: 'Expired', branch: 'Downtown Flagship', startDate: '2026-05-18', startTime: '08:00 AM', endDate: '2026-05-19', endTime: '23:00 PM', minOrderValue: 'Rs. 500', maxUses: '150', description: 'Midnight flash checkout rules.', categories: ['Beverages', 'Others'] },
  { id: 12, name: 'Beverage Extravaganza', discount: '23 %', type: 'Percentage', revenue: 122000, orders: 310, usage: 198, roi: '2.6x', status: 'Active', branch: 'All Branches', startDate: '2026-06-18', startTime: '08:00 AM', endDate: '2026-06-25', endTime: '23:00 PM', minOrderValue: 'Rs. 500', maxUses: '1200', description: 'AI insight-optimized beverage sale.', categories: ['Beverages'] }
];

// Branch Specific statistics mapping
const BRANCH_STATS = {
  'All Branches': { active: 12, coupons: 3420, revenue: 425250, orders: 1248 },
  'Downtown Flagship': { active: 5, coupons: 1540, revenue: 180400, orders: 512 },
  'North Branch': { active: 4, coupons: 980, revenue: 115200, orders: 320 },
  'South Branch': { active: 3, coupons: 900, revenue: 129650, orders: 416 }
};

export default function PromotionsDiscountsPage() {
  const { user, hasRole } = useAuth();
  const isBranchManager = hasRole('BRANCH_MANAGER');
  const isAdmin = hasRole('ADMIN') || hasRole('SUPER_ADMIN');
  const navigate = useNavigate();

  const [promotions, setPromotions] = useState(INITIAL_PROMOTIONS);
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [dateRange, setDateRange] = useState({ label: '01 Jun 2026 - 14 Jun 2026', value: 'custom_june' });

  React.useEffect(() => {
    if (isBranchManager) {
      const managerBranch = user?.branchId?.name || 'Downtown Flagship';
      setSelectedBranch(managerBranch);
    }
  }, [isBranchManager, user]);
  
  // Toggles for page views and modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAIInsightsModalOpen, setIsAIInsightsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  
  const [currentPromo, setCurrentPromo] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Success summary details state
  const [successDetails, setSuccessDetails] = useState({
    name: '',
    couponCode: '',
    discount: '',
    validity: '',
    branch: '',
    rawPromo: null
  });

  // Form State for creating/editing promotion
  const [formData, setFormData] = useState({
    name: '',
    discount: '',
    type: 'Percentage',
    revenue: 0,
    orders: 0,
    usage: 0,
    roi: '1.0x',
    status: 'Draft',
    branch: 'All Branches',
    startDate: '',
    startTime: '08:00 AM',
    endDate: '',
    endTime: '11:00 PM',
    minOrderValue: '',
    maxUses: '',
    description: '',
    categories: ['All categories', 'Beverages']
  });

  const branchesList = ['All Branches', 'Downtown Flagship', 'North Branch', 'South Branch'];

  // Handle branch stats override
  const stats = useMemo(() => {
    return BRANCH_STATS[selectedBranch] || BRANCH_STATS['All Branches'];
  }, [selectedBranch]);

  // Filter promotions by branch selection
  const filteredPromotions = useMemo(() => {
    if (selectedBranch === 'All Branches') return promotions;
    return promotions.filter(p => p.branch === selectedBranch || p.branch === 'All Branches');
  }, [promotions, selectedBranch]);

  // BR-SALE-002 threshold warning memo
  const showThresholdWarning = useMemo(() => {
    const rawVal = parseFloat(formData.discount) || 0;
    if (formData.type === 'Percentage') {
      return rawVal > 50;
    } else {
      return rawVal > 1000;
    }
  }, [formData.discount, formData.type]);

  // Open form view for creating promotion
  const handleCreateOpen = () => {
    setEditMode(false);
    setFormData({
      name: '',
      discount: '20 %',
      type: 'Percentage',
      revenue: 0,
      orders: 0,
      usage: 0,
      roi: '2.5x',
      status: 'Draft',
      branch: selectedBranch === 'All Branches' ? 'All Branches' : selectedBranch,
      startDate: '01 Jun 2026',
      startTime: '08:00 AM',
      endDate: '20 Jun 2026',
      endTime: '11:00 PM',
      minOrderValue: 'Rs. 500',
      maxUses: '1000',
      description: '',
      categories: ['All categories', 'Beverages']
    });
    setIsFormOpen(true);
  };

  // Open form view for editing promotion
  const handleEditOpen = (promo) => {
    setEditMode(true);
    setCurrentPromo(promo);
    setFormData({ 
      ...promo,
      minOrderValue: promo.minOrderValue || 'Rs. 500',
      maxUses: promo.maxUses || '1000',
      startTime: promo.startTime || '08:00 AM',
      endTime: promo.endTime || '11:00 PM',
      categories: promo.categories || ['All categories', 'Beverages']
    });
    setIsFormOpen(true);
  };

  // Open detail view modal
  const handleViewOpen = (promo) => {
    setCurrentPromo(promo);
    setIsDetailModalOpen(true);
  };

  // Handle Delete Promotion
  const handleDeletePromo = (id) => {
    if (window.confirm("Are you sure you want to delete this promotion?")) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  // Toggle categories checkboxes
  const handleCategoryToggle = (category) => {
    let updatedCats = [...formData.categories];
    if (category === 'All categories') {
      if (updatedCats.includes('All categories')) {
        updatedCats = [];
      } else {
        updatedCats = ['All categories', 'Beverages', 'Snacks', 'Others'];
      }
    } else {
      if (updatedCats.includes(category)) {
        updatedCats = updatedCats.filter(c => c !== category && c !== 'All categories');
      } else {
        updatedCats.push(category);
        if (updatedCats.includes('Beverages') && updatedCats.includes('Snacks') && updatedCats.includes('Others')) {
          updatedCats.push('All categories');
        }
      }
    }
    setFormData({ ...formData, categories: updatedCats });
  };

  // Handle Form Submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.discount) {
      alert("Please fill in the required fields");
      return;
    }

    let finalPromo = null;

    if (editMode) {
      finalPromo = { ...formData, id: currentPromo.id };
      setPromotions(promotions.map(p => p.id === currentPromo.id ? finalPromo : p));
      setIsFormOpen(false);
    } else {
      // Create mode
      finalPromo = {
        ...formData,
        id: promotions.length > 0 ? Math.max(...promotions.map(p => p.id)) + 1 : 1,
        revenue: Math.floor(Math.random() * 120000) + 15000,
        orders: Math.floor(Math.random() * 320) + 40,
        usage: Math.floor(Math.random() * 200) + 10,
        roi: `${(Math.random() * 1.5 + 1.8).toFixed(1)}x`,
      };
      setPromotions([finalPromo, ...promotions]);

      // Generate coupon code algorithm: e.g. "Summer Sale" -> "SUMMER20"
      const discountNumeric = formData.discount.replace(/[^0-9]/g, '') || '20';
      const cleanName = formData.name.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const codePrefix = cleanName.substring(0, Math.min(cleanName.length, 6)) || 'PROMO';
      const generatedCoupon = `${codePrefix}${discountNumeric}`;

      setSuccessDetails({
        name: formData.name,
        couponCode: generatedCoupon,
        discount: formData.discount,
        validity: `${formData.startDate} - ${formData.endDate}`,
        branch: formData.branch,
        rawPromo: finalPromo
      });
      
      setIsFormOpen(false);
      setIsSuccessModalOpen(true); // Open the requested success screen dialog!
    }
  };

  // Dynamic AI prediction recalculations
  const aiPrediction = useMemo(() => {
    const rawVal = parseFloat(formData.discount) || 20;
    const isPercentage = formData.discount.includes('%') || formData.type === 'Percentage';
    
    let revLift = 15;
    let orderLift = 120;
    let confidence = 88;

    if (isPercentage) {
      revLift = Math.round(rawVal * 0.75);
      orderLift = Math.round(rawVal * 6);
      confidence = Math.min(Math.round(98 - (rawVal / 3)), 98);
    } else {
      const ratio = Math.min(rawVal / 1000, 1.5);
      revLift = Math.round(ratio * 12);
      orderLift = Math.round(ratio * 90);
      confidence = Math.round(92 - (ratio * 5));
    }

    return {
      revenue: `+ ${revLift} %`,
      orders: `+ ${orderLift}`,
      confidence: `+ ${confidence}%`,
      barWidth: `${confidence}%`
    };
  }, [formData.discount, formData.type]);

  return (
    <div className="space-y-6 fade-up">
      {/* 1. Form View */}
      {isFormOpen ? (
        <div className="space-y-6 fade-up">
          <div className="flex items-center gap-3 select-none">
            <button 
              onClick={() => setIsFormOpen(false)}
              className="p-2 hover:bg-slate-100 border border-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                {editMode ? 'Edit Promotion' : 'Create Promotion'}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {editMode ? 'Modify promotional campaign parameters and values' : 'set up a new promotion to drive sales and engage customers'}
              </p>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column (w-2/3) - Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                  
                  <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100 select-none">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <FileText size={20} />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">Promotion Details</h3>
                  </div>

                  <div className="space-y-5 text-xs font-bold text-slate-700">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="block text-slate-600 font-semibold select-none">Promotion Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter promotion name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <span className="text-[10px] text-slate-400 block font-medium select-none">Choose a name that describe your promotion</span>
                    </div>

                    {/* Type */}
                    <div className="space-y-1">
                      <label className="block text-slate-600 font-semibold select-none">Promotion Type</label>
                      <div className="relative">
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer cursor-pointer"
                        >
                          <option value="Percentage">Percentage Discount (%)</option>
                          <option value="Fixed Amount">Fixed Amount Discount (Rs.)</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium select-none">Choose the type of promotion you want to create</span>
                    </div>

                    {/* Value & Discount Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-slate-600 font-semibold select-none">Discount Value</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 font-sans">
                            {formData.type === 'Percentage' ? '%' : 'Rs.'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium select-none">Set a discount value for this promotion</span>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-600 font-semibold select-none">Discount Type</label>
                        <div className="relative">
                          <select
                            value={formData.type === 'Percentage' ? 'percentage' : 'fixed'}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value === 'percentage' ? 'Percentage' : 'Fixed Amount' })}
                            className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                          >
                            <option value="percentage">Percentage Discount</option>
                            <option value="fixed">Fixed Amount Discount</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                        <span className="text-[10px] text-slate-400 block font-medium select-none">Select the Discount Type</span>
                      </div>
                    </div>

                    {showThresholdWarning && (
                      <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-semibold select-none leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                          !
                        </div>
                        <p className="flex-1">
                          <strong>BR-SALE-002:</strong> Discounts exceeding 50% or Rs. 1,000 require Branch Manager approval before activation.
                        </p>
                      </div>
                    )}

                    {/* Min Order & Max Uses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-slate-600 font-semibold select-none">Minimum Order Value (Optional)</label>
                        <input
                          type="text"
                          placeholder="Rs. 500"
                          value={formData.minOrderValue}
                          onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-600 font-semibold select-none">Maximum Uses (Optional)</label>
                        <input
                          type="text"
                          placeholder="1000"
                          value={formData.maxUses}
                          onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center select-none">
                        <label className="block text-slate-600 font-semibold">Description (optional)</label>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {formData.description.length}/500
                        </span>
                      </div>
                      <textarea
                        placeholder="Enter a brief description about this promotion"
                        maxLength={500}
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                      />
                      <span className="text-[10px] text-slate-400 block font-medium select-none">This description will help you understand the promotion better</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (w-1/3) - Status & Schedule */}
              <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 select-none">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                    Status
                  </h3>
                  <div className="flex flex-col gap-3.5 text-xs font-semibold text-slate-600">
                    {['Draft', 'Active', 'Scheduled', 'Expired'].map((st) => (
                      <label key={st} className="flex items-center gap-2.5 cursor-pointer hover:text-slate-800 transition-colors">
                        <input
                          type="radio"
                          name="status"
                          checked={formData.status === st}
                          onChange={() => setFormData({ ...formData, status: st })}
                          className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <span>{st}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Schedule Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 select-none">
                    Schedule
                  </h3>
                  <div className="space-y-4 text-xs font-bold text-slate-700">
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
                      <label className="block text-slate-500 select-none">Start Time</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
                          placeholder="8.00 AM"
                        />
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
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
                          placeholder="20 Jun 2026"
                        />
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-500 select-none">End Time</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 transition-all"
                          placeholder="11.00 PM"
                        />
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row: Apply To, Categories, AI Prediction */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Apply To */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4 select-none">
                    Apply To
                  </h3>
                  <div className="space-y-3.5 text-xs font-bold text-slate-700">
                    <div className="space-y-1">
                      <label className="block text-slate-500 select-none">Apply to Branch</label>
                      <div className="relative">
                        <select
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          className="w-full px-4 py-2.5 bg-slate-50/75 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold text-slate-800 appearance-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                        >
                          {branchesList.map(b => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs select-none">V</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-medium select-none">Select the branch that promotion will be apply to</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 select-none">
                <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                  Eligible Categories
                </h3>
                <div className="flex flex-col gap-3.5 text-xs font-semibold text-slate-600">
                  {[
                    { name: 'All categories', label: 'All categories' },
                    { name: 'Beverages', label: 'Beverages' },
                    { name: 'Snacks', label: 'Snacks' },
                    { name: 'Others', label: 'Others' }
                  ].map((cat) => {
                    const isChecked = formData.categories.includes(cat.name);
                    return (
                      <label key={cat.name} className="flex items-center gap-3.5 cursor-pointer hover:text-slate-800 transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCategoryToggle(cat.name)}
                          className="w-4 h-4 border-slate-300 text-blue-600 focus:ring-blue-500 rounded cursor-pointer"
                        />
                        <span>{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* AI Prediction */}
              {isAdmin && (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between select-none">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Cpu size={16} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">AI Prediction</h3>
                    </div>

                    <div className="space-y-4 text-xs font-bold text-slate-500">
                      <div className="flex justify-between items-center">
                        <span>Expected Revenue</span>
                        <span className="text-emerald-600 font-bold font-mono">{aiPrediction.revenue}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Expected Orders</span>
                        <span className="text-emerald-600 font-bold font-mono">{aiPrediction.orders}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                        <span>Confidence Score</span>
                        <span className="text-emerald-600 font-black font-mono">{aiPrediction.confidence}</span>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-200/50">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                          style={{ width: aiPrediction.barWidth }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3.5 pt-4 border-t border-slate-200/80 mt-6 select-none">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all cursor-pointer outline-none"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/10 rounded-full transition-all cursor-pointer outline-none"
              >
                Save Promotion
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* 2. Dashboard View */
        <div className="space-y-6">
          <PromotionHeader
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            branches={branchesList}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onCreatePromotion={handleCreateOpen}
            isBranchLocked={isBranchManager}
          />

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 select-none">
            <StatCard
              icon={Tag}
              label="Active promotions"
              value={stats.active}
              trend="↑ 20% vs last 7 days"
              colorVariant="blue"
            />
            <StatCard
              icon={Ticket}
              label="Total Coupon used"
              value={stats.coupons.toLocaleString()}
              trend="↑ 56% vs last 7 days"
              colorVariant="amber"
            />
            <StatCard
              icon={TrendingUp}
              label="Revenue Generated"
              value={`Rs. ${stats.revenue.toLocaleString()}`}
              trend="↑ 22% vs last 7 days"
              colorVariant="indigo"
            />
            <StatCard
              icon={ShoppingCart}
              label="Orders Influenced"
              value={stats.orders.toLocaleString()}
              trend="↑ 16% vs last 7 days"
              colorVariant="emerald"
            />
          </div>

          {/* Revenue Chart & AI Insight Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PromotionChart />
            </div>

            {isAdmin ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between select-none card-hover transition-all duration-200">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                      <h3 className="text-base font-bold text-slate-800">AI Insight</h3>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      New
                    </span>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                      Weekend Promotions increase beverage sales by <span className="text-emerald-600">23%</span>.
                    </p>
                    
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Confidence Score
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800">89</span>
                        <span className="text-lg font-bold text-slate-500">%</span>
                      </div>
                      
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                          style={{ width: '89%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsAIInsightsModalOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-end gap-1 mt-6 border-t border-slate-50 pt-4"
                >
                  <span>View all AI insights</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between select-none card-hover transition-all duration-200">
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <h3 className="text-base font-bold text-slate-800">Quick Actions</h3>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <button
                        onClick={handleCreateOpen}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl text-left transition-all hover:border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Plus size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Create Campaign</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Create a new promotion</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        onClick={() => navigate('/coupon-management')}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl text-left transition-all hover:border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Ticket size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Manage Coupons</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Generate and view codes</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        onClick={() => navigate('/discount-rules')}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 rounded-xl text-left transition-all hover:border-blue-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <Tag size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">Configure Rules</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Define stacking logic</p>
                          </div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50/40 border border-blue-100/70 rounded-xl p-3.5 mt-6 flex items-start gap-2.5">
                    <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-700 block">System Guideline</span>
                      <p className="text-[9px] text-slate-400 font-medium leading-normal mt-0.5">
                        Ensure discount rule constraints are active before distributing custom checkout coupons.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between select-none">
              <h2 className="text-lg font-bold text-slate-800">Recent promotions</h2>
              <span className="text-xs text-blue-600 hover:underline cursor-pointer font-semibold">View all promotions &gt;</span>
            </div>

            <PromotionTable
              promotions={filteredPromotions}
              onView={handleViewOpen}
              onEdit={handleEditOpen}
              onDelete={handleDeletePromo}
            />
          </div>
        </div>
      )}

      {/* 3. Success Modal Dialog (Matches spec screenshot exactly) */}
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
            Promotion Created Successfully!
          </h3>

          {/* Info Details Panel */}
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-xs font-bold text-slate-500 mb-5 space-y-3.5 text-left">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Promotion Name</span>
              <span className="text-slate-800 font-extrabold">{successDetails.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Coupon Code</span>
              <span className="text-slate-800 font-extrabold font-mono text-[13px] tracking-wide">{successDetails.couponCode}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Discount</span>
              <span className="text-slate-800 font-extrabold">{successDetails.discount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Validity</span>
              <span className="text-slate-800 font-extrabold font-mono">{successDetails.validity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-400">Apply TO</span>
              <span className="text-slate-800 font-extrabold">{successDetails.branch}</span>
            </div>
          </div>

          {/* Alert Informative Banner */}
          <div className="flex items-start gap-3 p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl text-emerald-700 text-[11px] font-semibold text-left mb-6 leading-relaxed">
            <div className="w-5 h-5 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 select-none">
              <Info className="w-3 h-3 stroke-[3]" />
            </div>
            <p className="flex-1">
              This promotion will be applied automatically during checkout when the conditions are met
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3.5 w-full">
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="w-1/2 px-5 py-2.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer outline-none"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                setCurrentPromo(successDetails.rawPromo);
                setIsDetailModalOpen(true);
              }}
              className="w-1/2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md rounded-xl transition-all cursor-pointer outline-none"
            >
              View Promotion
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. View Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Promotion Details"
        size="md"
      >
        {currentPromo && (
          <div className="space-y-6 text-sm text-slate-600 select-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h4 className="text-lg font-bold text-slate-800">{currentPromo.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">Campaign Target: <span className="font-semibold text-slate-600">{currentPromo.branch}</span></p>
              </div>
              <Badge variant={currentPromo.status === 'Active' ? 'success' : currentPromo.status === 'Scheduled' ? 'primary' : 'danger'}>
                {currentPromo.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Discount Amount</span>
                <span className="text-sm font-bold text-slate-800">{currentPromo.discount}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Discount Type</span>
                <span className="text-sm font-bold text-slate-800">{currentPromo.type}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Campaign Start</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{currentPromo.startDate || '—'}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Campaign End</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{currentPromo.endDate || '—'}</span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="border-t border-slate-100 pt-4">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Performance Indicators</h5>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Revenue</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">Rs. {currentPromo.revenue.toLocaleString()}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Orders</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">{currentPromo.orders}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Usages</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">{currentPromo.usage}</span>
                </div>
                <div className="p-2 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">ROI</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{currentPromo.roi}</span>
                </div>
              </div>
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

      {/* 5. AI Recommendations Modal */}
      <Modal
        isOpen={isAIInsightsModalOpen}
        onClose={() => setIsAIInsightsModalOpen(false)}
        title="AI Recommendations & Insights"
        size="md"
      >
        <div className="space-y-4 select-none">
          <div className="flex items-start gap-3 p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Active Recommendation</h5>
              <p className="text-xs text-slate-600 mt-1">
                Weekend Promotions increase beverage sales by <span className="font-bold text-emerald-600">23%</span>. Setting up a percentage discount of 15%-25% yields maximum engagement.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confidence Score:</span>
                <span className="text-xs font-bold text-purple-700 bg-purple-100/50 px-2 py-0.5 rounded-md">89% Match</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Dairy Stock Waste Mitigation</h5>
              <p className="text-xs text-slate-600 mt-1">
                Offering a BOGO discount on dairy products before Tuesday could prevent <span className="font-semibold text-slate-800">Rs. 12,000</span> of stock waste due to shelf expiration.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confidence Score:</span>
                <span className="text-xs font-bold text-slate-600 bg-slate-200/50 px-2 py-0.5 rounded-md">94% Match</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-800 text-sm">Downtown Branch Holiday Lift</h5>
              <p className="text-xs text-slate-600 mt-1">
                Holiday-themed marketing & discount rules in the Downtown Flagship branch is projected to raise sales by <span className="font-semibold text-slate-800">15%</span> next weekend.
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Confidence Score:</span>
                <span className="text-xs font-bold text-slate-600 bg-slate-200/50 px-2 py-0.5 rounded-md">81% Match</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsAIInsightsModalOpen(false)}
              className="px-5 py-2"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
