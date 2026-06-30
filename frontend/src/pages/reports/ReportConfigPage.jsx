import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BarChart2,
  Package,
  DollarSign,
  Users,
  UserCheck,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Download,
  Save,
  Calendar,
  RefreshCw,
  Tag,
  X,
  BarChart,
  AlertTriangle,
  Layers,
  Star,
  Sliders,
} from 'lucide-react';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import { cn } from '../../utils/cn';

// ─── Config map ───────────────────────────────────────────────────────────────

const REPORT_TYPE_MAP = {
  sales: {
    label: 'Sales Report',
    icon: BarChart2,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
    estimatedRows: 1240,
    sections: ['dateRange', 'branch', 'productCategory', 'comparePeriod'],
  },
  inventory: {
    label: 'Inventory Report',
    icon: Package,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    estimatedRows: 856,
    sections: ['dateRange', 'branch', 'productCategory', 'stockStatus', 'warehouse'],
  },
  finance: {
    label: 'Finance Report',
    icon: DollarSign,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    estimatedRows: 320,
    sections: ['dateRange', 'branch', 'financeSubType', 'comparePeriod'],
  },
  employee: {
    label: 'Employee Report',
    icon: Users,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    badgeClass: 'bg-violet-50 text-violet-700 border border-violet-200',
    estimatedRows: 48,
    sections: ['dateRange', 'branch', 'roleFilter', 'performanceMetrics'],
  },
  customer: {
    label: 'Customer Report',
    icon: UserCheck,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
    estimatedRows: 2100,
    sections: ['dateRange', 'branch', 'customerSegment', 'loyaltyTier', 'comparePeriod'],
  },
};

const BRANCHES = ['Main Terminal', 'North Wing', 'South Plaza', 'East Market'];

const DATE_PRESETS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

const FINANCE_SUB_TYPES = [
  { id: 'revenue', label: 'Revenue Summary' },
  { id: 'tax', label: 'Tax Report' },
  { id: 'pnl', label: 'Profit & Loss' },
  { id: 'cashflow', label: 'Cash Flow' },
];

const STOCK_STATUSES = [
  { id: 'all', label: 'All Items' },
  { id: 'in_stock', label: 'In Stock' },
  { id: 'low_stock', label: 'Low Stock Only' },
  { id: 'out_of_stock', label: 'Out of Stock' },
];

const PERFORMANCE_METRICS = [
  { id: 'sales', label: 'Sales Revenue' },
  { id: 'transactions', label: 'Transaction Count' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'returns', label: 'Returns Handled' },
];

const CUSTOMER_SEGMENTS = [
  { id: 'all', label: 'All Customers' },
  { id: 'new', label: 'New Customers' },
  { id: 'regular', label: 'Regular Customers' },
  { id: 'vip', label: 'VIP Customers' },
  { id: 'inactive', label: 'Inactive (90+ days)' },
];

const LOYALTY_TIERS = [
  { id: 'all', label: 'All Tiers' },
  { id: 'bronze', label: 'Bronze' },
  { id: 'silver', label: 'Silver' },
  { id: 'gold', label: 'Gold' },
  { id: 'platinum', label: 'Platinum' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

function getPresetDates(preset) {
  const today = new Date();
  switch (preset) {
    case 'today':
      return { from: toIso(today), to: toIso(today) };
    case 'yesterday': {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return { from: toIso(d), to: toIso(d) };
    }
    case 'last7': {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      return { from: toIso(d), to: toIso(today) };
    }
    case 'last30': {
      const d = new Date(today);
      d.setDate(d.getDate() - 29);
      return { from: toIso(d), to: toIso(today) };
    }
    case 'thisMonth': {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toIso(d), to: toIso(today) };
    }
    default:
      return null;
  }
}

function fmtChipDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Section components ───────────────────────────────────────────────────────

function SectionCard({ icon: Icon, iconBg, iconColor, label, rightSlot, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(15,23,42,0.04)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
            <Icon className={cn('w-3.5 h-3.5', iconColor)} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
        </div>
        {rightSlot}
      </div>
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        checked ? 'bg-blue-600' : 'bg-slate-200'
      )}
    >
      <span
        className={cn(
          'inline-block w-4 h-4 mt-1 rounded-full bg-white shadow-md transition-transform duration-200',
          checked ? 'translate-x-7' : 'translate-x-1'
        )}
      />
    </button>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150',
        checked
          ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700'
      )}
    >
      <span className={cn(
        'w-4 h-4 rounded-[5px] flex items-center justify-center flex-shrink-0 border-2 transition-all duration-150',
        checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
      )}>
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportConfigPage() {
  const { reportType } = useParams();
  const navigate = useNavigate();
  const config = REPORT_TYPE_MAP[reportType];

  // Redirect if unknown type
  useEffect(() => {
    if (!config) navigate('/reports', { replace: true });
  }, [config, navigate]);

  if (!config) return null;

  const Icon = config.icon;
  const sections = config.sections;

  // ── Date Range state ──
  const [datePreset, setDatePreset] = useState('last7');
  const initialDates = getPresetDates('last7');
  const [dateFrom, setDateFrom] = useState(initialDates.from);
  const [dateTo, setDateTo] = useState(initialDates.to);

  const handlePreset = (id) => {
    setDatePreset(id);
    if (id !== 'custom') {
      const range = getPresetDates(id);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  };

  // ── Branch state ──
  const [allBranches, setAllBranches] = useState(true);
  const [selectedBranches, setSelectedBranches] = useState(new Set(BRANCHES));

  const toggleBranch = (b) => {
    setSelectedBranches((prev) => {
      const next = new Set(prev);
      next.has(b) ? next.delete(b) : next.add(b);
      return next;
    });
  };

  const handleAllBranchesToggle = (val) => {
    setAllBranches(val);
    if (val) setSelectedBranches(new Set(BRANCHES));
  };

  // ── Product category state ──
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [allCategories, setAllCategories] = useState(true);

  // ── Finance sub-type ──
  const [financeSubType, setFinanceSubType] = useState('revenue');

  // ── Stock status ──
  const [stockStatus, setStockStatus] = useState('all');

  // ── Warehouse ──
  const [warehouseFilter, setWarehouseFilter] = useState('all');

  // ── Role filter ──
  const [roleFilter, setRoleFilter] = useState('all');

  // ── Performance metrics ──
  const [perfMetrics, setPerfMetrics] = useState(new Set(['sales', 'transactions']));
  const toggleMetric = (id) => {
    setPerfMetrics((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Customer segment ──
  const [customerSegment, setCustomerSegment] = useState('all');

  // ── Loyalty tier ──
  const [loyaltyTier, setLoyaltyTier] = useState('all');

  // ── Compare period ──
  const [comparePeriod, setComparePeriod] = useState(false);

  // ── Derived filter chips for preview panel ──
  const filterChips = [];

  if (dateFrom && dateTo) {
    const label = dateFrom === dateTo
      ? fmtChipDate(dateFrom)
      : `${fmtChipDate(dateFrom)} - ${fmtChipDate(dateTo)}`;
    filterChips.push({ key: 'date', icon: Calendar, label });
  }

  if (allBranches) {
    filterChips.push({ key: 'branch', icon: null, label: 'All Branches' });
  } else if (selectedBranches.size > 0) {
    filterChips.push({
      key: 'branch',
      icon: null,
      label: selectedBranches.size === 1
        ? [...selectedBranches][0]
        : `${selectedBranches.size} Branches`,
    });
  }

  if (sections.includes('productCategory')) {
    filterChips.push({ key: 'cat', icon: Tag, label: allCategories ? 'All Categories (12)' : 'Selected Categories' });
  }

  if (sections.includes('stockStatus') && stockStatus !== 'all') {
    const s = STOCK_STATUSES.find((x) => x.id === stockStatus);
    filterChips.push({ key: 'stock', icon: AlertTriangle, label: s?.label });
  }

  if (sections.includes('financeSubType')) {
    const s = FINANCE_SUB_TYPES.find((x) => x.id === financeSubType);
    filterChips.push({ key: 'fsub', icon: null, label: s?.label });
  }

  if (sections.includes('customerSegment') && customerSegment !== 'all') {
    const s = CUSTOMER_SEGMENTS.find((x) => x.id === customerSegment);
    filterChips.push({ key: 'seg', icon: null, label: s?.label });
  }

  if (sections.includes('loyaltyTier') && loyaltyTier !== 'all') {
    const s = LOYALTY_TIERS.find((x) => x.id === loyaltyTier);
    filterChips.push({ key: 'tier', icon: Star, label: s?.label });
  }

  // ── Compare period label ──
  const comparePeriodLabel = () => {
    switch (datePreset) {
      case 'today': return 'Compare vs. yesterday';
      case 'yesterday': return 'Compare vs. 2 days ago';
      case 'last7': return 'Compare vs. previous 7 days';
      case 'last30': return 'Compare vs. previous 30 days';
      case 'thisMonth': return 'Compare vs. last month';
      default: return 'Compare vs. previous period';
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link to="/reports" className="text-slate-500 hover:text-blue-600 transition-colors duration-150 font-medium">
          Reports
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/reports" className="text-slate-500 hover:text-blue-600 transition-colors duration-150 font-medium">
          {config.label}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-900 font-semibold">Configure</span>
      </nav>

      {/* ── Two-panel layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-5 items-start">

        {/* ── Left: Configure Panel ── */}
        <div className="flex flex-col gap-4">

          {/* Panel header card */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.iconBg)}>
                  <Icon className={cn('w-5 h-5', config.iconColor)} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Configure Report</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Customize filters and parameters</p>
                </div>
              </div>
              <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border', config.badgeClass)}>
                {config.label}
              </span>
            </div>
          </Card>

          {/* DATE RANGE */}
          {sections.includes('dateRange') && (
            <SectionCard icon={Calendar} iconBg="bg-blue-100" iconColor="text-blue-600" label="Date Range">
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePreset(p.id)}
                    className={cn(
                      'px-2 py-3 text-sm font-medium rounded-xl border transition-all duration-150',
                      datePreset === p.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setDatePreset('custom'); }}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:bg-white outline-none transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setDatePreset('custom'); }}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-700 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 focus:bg-white outline-none transition-all duration-150"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* BRANCH */}
          {sections.includes('branch') && (
            <SectionCard
              icon={Layers}
              iconBg="bg-indigo-100"
              iconColor="text-indigo-600"
              label="Branch"
              rightSlot={
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-slate-500">All Branches</span>
                  <Toggle checked={allBranches} onChange={handleAllBranchesToggle} />
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-2.5">
                {BRANCHES.map((b) => (
                  <Checkbox
                    key={b}
                    checked={selectedBranches.has(b)}
                    onChange={() => toggleBranch(b)}
                    label={b}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {/* PRODUCT CATEGORY */}
          {sections.includes('productCategory') && (
            <SectionCard icon={Tag} iconBg="bg-violet-100" iconColor="text-violet-600" label="Product Category">
              <div className="relative">
                <button
                  onClick={() => setCategoryOpen(!categoryOpen)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm border border-slate-200 rounded-xl text-slate-700 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-150"
                >
                  <span className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="font-medium">{allCategories ? 'All Categories Selected (12)' : 'Select Categories'}</span>
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-150', categoryOpen && 'rotate-180')} />
                </button>
                {categoryOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCategoryOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 py-2 overflow-hidden">
                      <button
                        onClick={() => { setAllCategories(true); setCategoryOpen(false); }}
                        className={cn('w-full text-left px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors', allCategories ? 'text-blue-700 font-semibold bg-blue-50/60' : 'text-slate-700')}
                      >
                        All Categories (12)
                      </button>
                      {['Electronics', 'Beverages', 'Bakery', 'Dairy', 'Produce', 'Snacks'].map((c) => (
                        <button
                          key={c}
                          onClick={() => { setAllCategories(false); setCategoryOpen(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </SectionCard>
          )}

          {/* STOCK STATUS (Inventory) */}
          {sections.includes('stockStatus') && (
            <SectionCard icon={AlertTriangle} iconBg="bg-amber-100" iconColor="text-amber-600" label="Stock Status">
              <div className="grid grid-cols-2 gap-2.5">
                {STOCK_STATUSES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStockStatus(s.id)}
                    className={cn(
                      'px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-150 text-left',
                      stockStatus === s.id
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* WAREHOUSE (Inventory) */}
          {sections.includes('warehouse') && (
            <SectionCard icon={Layers} iconBg="bg-emerald-100" iconColor="text-emerald-600" label="Warehouse">
              <div className="grid grid-cols-2 gap-2.5">
                {['All Warehouses', 'Main Depot', 'North Store', 'City Hub'].map((w) => (
                  <button
                    key={w}
                    onClick={() => setWarehouseFilter(w)}
                    className={cn(
                      'px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-150 text-left',
                      warehouseFilter === w
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-700'
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* FINANCE SUB-TYPE */}
          {sections.includes('financeSubType') && (
            <SectionCard icon={DollarSign} iconBg="bg-amber-100" iconColor="text-amber-600" label="Report Type">
              <div className="space-y-2.5">
                {FINANCE_SUB_TYPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFinanceSubType(s.id)}
                    className={cn(
                      'w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 text-left',
                      financeSubType === s.id
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 hover:text-amber-700'
                    )}
                  >
                    <span className={cn(
                      'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-150',
                      financeSubType === s.id ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                    )} />
                    {s.label}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* ROLE FILTER (Employee) */}
          {sections.includes('roleFilter') && (
            <SectionCard icon={Users} iconBg="bg-violet-100" iconColor="text-violet-600" label="Role / Department">
              <div className="grid grid-cols-2 gap-2.5">
                {['All Roles', 'Cashier', 'Branch Manager', 'Inventory Manager', 'Supervisor', 'Support'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={cn(
                      'px-4 py-3 text-sm font-medium rounded-xl border transition-all duration-150 text-left',
                      roleFilter === r
                        ? 'bg-violet-50 border-violet-400 text-violet-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 hover:text-violet-700'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* PERFORMANCE METRICS (Employee) */}
          {sections.includes('performanceMetrics') && (
            <SectionCard icon={Sliders} iconBg="bg-violet-100" iconColor="text-violet-600" label="Performance Metrics">
              <div className="grid grid-cols-2 gap-2.5">
                {PERFORMANCE_METRICS.map((m) => (
                  <Checkbox
                    key={m.id}
                    checked={perfMetrics.has(m.id)}
                    onChange={() => toggleMetric(m.id)}
                    label={m.label}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {/* CUSTOMER SEGMENT */}
          {sections.includes('customerSegment') && (
            <SectionCard icon={UserCheck} iconBg="bg-rose-100" iconColor="text-rose-600" label="Customer Segment">
              <div className="space-y-2.5">
                {CUSTOMER_SEGMENTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCustomerSegment(s.id)}
                    className={cn(
                      'w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all duration-150 text-left',
                      customerSegment === s.id
                        ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 hover:text-rose-700'
                    )}
                  >
                    <span className={cn(
                      'w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-150',
                      customerSegment === s.id ? 'border-rose-500 bg-rose-500' : 'border-slate-300'
                    )} />
                    {s.label}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* LOYALTY TIER */}
          {sections.includes('loyaltyTier') && (
            <SectionCard icon={Star} iconBg="bg-rose-100" iconColor="text-rose-600" label="Loyalty Tier">
              <div className="grid grid-cols-3 gap-2.5">
                {LOYALTY_TIERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLoyaltyTier(t.id)}
                    className={cn(
                      'px-3 py-3 text-sm font-medium rounded-xl border transition-all duration-150 text-center',
                      loyaltyTier === t.id
                        ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50/40 hover:text-rose-700'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}

          {/* COMPARE PERIOD */}
          {sections.includes('comparePeriod') && (
            <div className="flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-slate-200 shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Compare Period</p>
                  <p className="text-xs text-slate-500 mt-0.5">{comparePeriodLabel()}</p>
                </div>
              </div>
              <Toggle checked={comparePeriod} onChange={setComparePeriod} />
            </div>
          )}

        </div>

        {/* ── Right: Preview Panel ── */}
        <Card className="overflow-hidden">
          {/* Preview header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Report Preview</h2>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
              <BarChart className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">
                Estimated {config.estimatedRows.toLocaleString()} rows
              </span>
            </div>
          </div>

          <div className="px-6 py-5">
            {/* Active filter chips */}
            {filterChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filterChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {chip.icon && <chip.icon className="w-3 h-3" />}
                    {chip.label}
                    <button className="w-3.5 h-3.5 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors duration-150 ml-0.5">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Skeleton table */}
            <div className="rounded-xl border border-slate-200 overflow-hidden mb-6">
              {/* Header row */}
              <div className="flex gap-4 px-4 py-3 bg-slate-100 border-b border-slate-200">
                {[48, 28, 20, 16, 24].map((w, i) => (
                  <div key={i} className="h-3 rounded-full bg-slate-300 animate-pulse" style={{ width: `${w}%`, flexShrink: 0 }} />
                ))}
              </div>
              {/* Data rows */}
              {Array.from({ length: 7 }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4 px-4 py-3.5 border-b border-slate-100 last:border-0">
                  {[44, 22, 18, 14, 20].map((w, i) => (
                    <div
                      key={i}
                      className="h-2.5 rounded-full bg-slate-200 animate-pulse"
                      style={{ width: `${w - (rowIdx % 3) * 3}%`, flexShrink: 0, animationDelay: `${rowIdx * 80 + i * 30}ms` }}
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Preview message */}
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Detailed preview will update as you refine filters</p>
                <p className="text-xs text-slate-400 mt-1">Currently showing data structure only</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <Link
          to="/reports"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="md" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Configuration
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex items-center gap-2"
            onClick={() => navigate(`/reports/view/${reportType}`, {
              state: {
                dateFrom,
                dateTo,
                allBranches,
                selectedBranches: [...selectedBranches],
              }
            })}
          >
            Generate Report
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
