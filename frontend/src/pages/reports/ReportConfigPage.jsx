import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Calendar,
  RefreshCw,
  Tag,
  X,
  BarChart,
  AlertTriangle,
  Layers,
  Star,
  Sliders,
  Loader2,
} from 'lucide-react';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { cn } from '../../utils/cn';
import { reportService, REPORT_KEYS } from '../../services/reportService';

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

const DATE_PRESETS = [
  { id: 'today',     label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7',     label: 'Last 7 days' },
  { id: 'last30',    label: 'Last 30 days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'custom',    label: 'Custom' },
];

const FINANCE_SUB_TYPES = [
  { id: 'revenue',  label: 'Revenue Summary' },
  { id: 'tax',      label: 'Tax Report' },
  { id: 'pnl',      label: 'Profit & Loss' },
  { id: 'cashflow', label: 'Cash Flow' },
];

const STOCK_STATUSES = [
  { id: 'all',          label: 'All Items' },
  { id: 'in_stock',     label: 'In Stock' },
  { id: 'low_stock',    label: 'Low Stock Only' },
  { id: 'out_of_stock', label: 'Out of Stock' },
];

const PERFORMANCE_METRICS = [
  { id: 'sales',        label: 'Sales Revenue' },
  { id: 'transactions', label: 'Transaction Count' },
  { id: 'attendance',   label: 'Attendance' },
  { id: 'returns',      label: 'Returns Handled' },
];

const CUSTOMER_SEGMENTS = [
  { id: 'all',      label: 'All Customers' },
  { id: 'new',      label: 'New Customers' },
  { id: 'regular',  label: 'Regular Customers' },
  { id: 'vip',      label: 'VIP Customers' },
  { id: 'inactive', label: 'Inactive (90+ days)' },
];

const LOYALTY_TIERS = [
  { id: 'all',      label: 'All Tiers' },
  { id: 'bronze',   label: 'Bronze' },
  { id: 'silver',   label: 'Silver' },
  { id: 'gold',     label: 'Gold' },
  { id: 'platinum', label: 'Platinum' },
];

const WAREHOUSES = ['All Warehouses', 'Main Depot', 'North Store', 'City Hub'];
const ROLES = ['All Roles', 'Cashier', 'Branch Manager', 'Inventory Manager', 'Supervisor', 'Support'];

// ─── Seed data + helpers for dynamic preview computation ─────────────────────

const INV_SEED = [
  { sku: 'SKU-1042', name: 'Premium Espresso',  cat: 'Beverages',   qty: 240, status: 'In Stock' },
  { sku: 'SKU-2018', name: 'Whole Milk 2L',     cat: 'Dairy',       qty: 18,  status: 'Low Stock' },
  { sku: 'SKU-3007', name: 'Sourdough Bread',   cat: 'Bakery',      qty: 0,   status: 'Out of Stock' },
  { sku: 'SKU-4091', name: 'Wireless Earbuds',  cat: 'Electronics', qty: 52,  status: 'In Stock' },
  { sku: 'SKU-5033', name: 'Greek Yogurt',      cat: 'Dairy',       qty: 67,  status: 'In Stock' },
  { sku: 'SKU-6021', name: 'Olive Oil 500ml',   cat: 'Produce',     qty: 8,   status: 'Low Stock' },
  { sku: 'SKU-7044', name: 'Paper Coffee Cup',  cat: 'Beverages',   qty: 0,   status: 'Out of Stock' },
  { sku: 'SKU-8012', name: 'Cheddar Cheese',    cat: 'Dairy',       qty: 45,  status: 'In Stock' },
];

const EMP_SEED = [
  { name: 'Sarah Jenkins', role: 'Branch Manager',    rev: 12450, txns: 367, rating: 4.9 },
  { name: 'Marcus Reed',   role: 'Cashier',           rev: 8720,  txns: 258, rating: 4.7 },
  { name: 'Aisha Patel',   role: 'Supervisor',        rev: 10180, txns: 301, rating: 4.8 },
  { name: 'Tom Wilson',    role: 'Cashier',           rev: 6340,  txns: 187, rating: 4.5 },
  { name: 'Lisa Chen',     role: 'Inventory Manager', rev: 7890,  txns: 233, rating: 4.6 },
  { name: 'Raj Kumar',     role: 'Cashier',           rev: 5910,  txns: 175, rating: 4.4 },
  { name: 'Diana Chase',   role: 'Supervisor',        rev: 9240,  txns: 272, rating: 4.7 },
  { name: 'Sam Nguyen',    role: 'Branch Manager',    rev: 11800, txns: 348, rating: 4.8 },
];

const CUST_SEED = [
  { name: 'Emily Watson',   tier: 'Platinum', spend: 4820, orders: 142, segment: 'vip' },
  { name: 'James Morrison', tier: 'Gold',     spend: 2340, orders: 87,  segment: 'regular' },
  { name: 'Priya Sharma',   tier: 'Silver',   spend: 1180, orders: 44,  segment: 'new' },
  { name: 'David Kim',      tier: 'Platinum', spend: 5610, orders: 198, segment: 'vip' },
  { name: 'Anna Rodriguez', tier: 'Bronze',   spend: 420,  orders: 16,  segment: 'new' },
  { name: 'Chen Wei',       tier: 'Gold',     spend: 3200, orders: 95,  segment: 'regular' },
  { name: 'Fatima Hassan',  tier: 'Silver',   spend: 890,  orders: 32,  segment: 'inactive' },
  { name: 'Luke Evans',     tier: 'Bronze',   spend: 310,  orders: 11,  segment: 'inactive' },
];

const MONTHS = ['Jun', 'May', 'Apr', 'Mar', 'Feb'];

const FINANCE_VARIANTS = {
  revenue: {
    cols: ['Period', 'Revenue', 'Tax (8%)', 'Gross Profit', 'Margin'],
    gen: (i, base) => {
      const r = base - i * 3200, tax = Math.round(r * 0.08), gp = Math.round(r * 0.383);
      return [`${MONTHS[i]} 2026`, `$${r.toLocaleString()}`, `$${tax.toLocaleString()}`, `$${gp.toLocaleString()}`, `${(gp / r * 100).toFixed(1)}%`];
    },
  },
  tax: {
    cols: ['Period', 'Tax Collected', 'Tax Refunded', 'Net Tax', 'Rate'],
    gen: (i, base) => {
      const col = Math.round(base * 0.08) - i * 256, ref = Math.round(col * 0.03);
      return [`${MONTHS[i]} 2026`, `$${col.toLocaleString()}`, `$${ref.toLocaleString()}`, `$${(col - ref).toLocaleString()}`, '8.0%'];
    },
  },
  pnl: {
    cols: ['Period', 'Revenue', 'COGS', 'Gross Profit', 'Net Profit'],
    gen: (i, base) => {
      const r = base - i * 3200, cogs = Math.round(r * 0.617), gp = r - cogs, np = Math.round(gp * 0.72);
      return [`${MONTHS[i]} 2026`, `$${r.toLocaleString()}`, `$${cogs.toLocaleString()}`, `$${gp.toLocaleString()}`, `$${np.toLocaleString()}`];
    },
  },
  cashflow: {
    cols: ['Period', 'Cash In', 'Cash Out', 'Net Cash', 'Running Total'],
    gen: (i, base) => {
      const ci = base - i * 2800, co = Math.round(ci * 0.78), net = ci - co, rt = 48000 + (4 - i) * net;
      return [`${MONTHS[i]} 2026`, `$${ci.toLocaleString()}`, `$${co.toLocaleString()}`, `$${net.toLocaleString()}`, `$${rt.toLocaleString()}`];
    },
  },
};

function rangeDays(from, to) {
  if (!from || !to) return 7;
  return Math.max(1, Math.round((new Date(to + 'T00:00:00') - new Date(from + 'T00:00:00')) / 86400000) + 1);
}

function genDates(from, to, count = 5) {
  const toD   = new Date(to   ? to   + 'T00:00:00' : Date.now());
  const fromD = new Date(from ? from + 'T00:00:00' : new Date(toD - 6 * 86400000));
  const res   = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(toD);
    d.setDate(d.getDate() - i);
    if (d < fromD) break;
    res.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }
  while (res.length < count) res.push('—');
  return res;
}

function fmtMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

function computePreview({ reportType, dateFrom, dateTo, displayBranches, stockStatus, financeSubType, roleFilter, customerSegment, loyaltyTier }) {
  const days      = rangeDays(dateFrom, dateTo);
  const numBranch = Math.max(displayBranches.length, 1);
  const branchCycle = displayBranches.length > 0 ? displayBranches : ['Main Branch HQ'];

  switch (reportType) {
    case 'sales': {
      const dates = genDates(dateFrom, dateTo, 5);
      const rows  = dates.map((date, i) => {
        if (date === '—') return ['—', '—', '—', '—', '—'];
        const branch = branchCycle[i % branchCycle.length];
        const txns   = Math.max(10, Math.round(100 + (i % 3) * 18 - i * 4));
        const rev    = Math.round(txns * 33.8);
        return [date, branch, txns.toString(), `$${rev.toLocaleString()}`, `$${(rev / txns).toFixed(2)}`];
      });
      return {
        estimatedRows: Math.round(days * numBranch * 28),
        kpis: [
          { label: 'Est. Revenue',  value: fmtMoney(days * numBranch * 3400) },
          { label: 'Transactions',  value: (days * numBranch * 100).toLocaleString() },
          { label: 'Avg. Order',    value: '$33.80' },
        ],
        cols:  ['Date', 'Branch', 'Transactions', 'Revenue', 'Avg. Order'],
        rows,
        badge: {},
      };
    }

    case 'inventory': {
      const STATUS_MAP = { all: null, in_stock: 'In Stock', low_stock: 'Low Stock', out_of_stock: 'Out of Stock' };
      const statusFilter = STATUS_MAP[stockStatus];
      const filtered  = statusFilter ? INV_SEED.filter(r => r.status === statusFilter) : INV_SEED;
      const display   = filtered.length > 0 ? filtered : INV_SEED;
      const lowCount  = INV_SEED.filter(r => r.status === 'Low Stock').length;
      const outCount  = INV_SEED.filter(r => r.status === 'Out of Stock').length;
      return {
        estimatedRows: Math.round(display.length * numBranch * 8),
        kpis: [
          { label: 'Total SKUs',   value: (INV_SEED.length * numBranch * 8).toLocaleString() },
          { label: 'Low Stock',    value: (lowCount * numBranch * 8).toString() },
          { label: 'Out of Stock', value: (outCount * numBranch * 8).toString() },
        ],
        cols:  ['SKU', 'Product', 'Category', 'In Stock', 'Status'],
        rows:  display.slice(0, 5).map(r => [r.sku, r.name, r.cat, r.qty.toString(), r.status]),
        badge: { 4: 'stock' },
      };
    }

    case 'finance': {
      const variant  = FINANCE_VARIANTS[financeSubType] ?? FINANCE_VARIANTS.revenue;
      const base     = Math.max(10000, Math.round((days / 30) * 48200));
      const rows     = Array.from({ length: 5 }, (_, i) => variant.gen(i, base));
      const totalRev = rows.reduce((s, r) => s + (parseInt(r[1]?.replace(/[^0-9]/g, '')) || 0), 0);
      const kpiMap   = {
        revenue:  [{ label: 'Total Revenue', value: fmtMoney(totalRev) }, { label: 'Total Tax', value: fmtMoney(Math.round(totalRev * 0.08)) }, { label: 'Gross Margin', value: '38.1%' }],
        tax:      [{ label: 'Tax Collected', value: fmtMoney(Math.round(totalRev * 0.08)) }, { label: 'Tax Refunded', value: fmtMoney(Math.round(totalRev * 0.0024)) }, { label: 'Net Tax', value: fmtMoney(Math.round(totalRev * 0.077)) }],
        pnl:      [{ label: 'Total Revenue', value: fmtMoney(totalRev) }, { label: 'Gross Profit', value: fmtMoney(Math.round(totalRev * 0.383)) }, { label: 'Net Profit', value: fmtMoney(Math.round(totalRev * 0.276)) }],
        cashflow: [{ label: 'Total Cash In', value: fmtMoney(totalRev) }, { label: 'Net Cash Flow', value: fmtMoney(Math.round(totalRev * 0.22)) }, { label: 'Running Total', value: fmtMoney(Math.round(totalRev * 0.22 + 48000)) }],
      };
      return {
        estimatedRows: Math.max(1, Math.round(days / 7)) * numBranch,
        kpis:  kpiMap[financeSubType] ?? kpiMap.revenue,
        cols:  variant.cols,
        rows,
        badge: {},
      };
    }

    case 'employee': {
      const filtered = roleFilter === 'All Roles' ? EMP_SEED : EMP_SEED.filter(e => e.role === roleFilter);
      const display  = filtered.length > 0 ? filtered : EMP_SEED;
      const ratio    = days / 30;
      const topRev   = Math.max(...display.map(e => e.rev), 0);
      const avgRating = display.length > 0
        ? (display.reduce((s, e) => s + e.rating, 0) / display.length).toFixed(1)
        : '—';
      return {
        estimatedRows: display.length * numBranch,
        kpis: [
          { label: 'Staff Records', value: (display.length * numBranch).toString() },
          { label: 'Top Revenue',   value: fmtMoney(Math.round(topRev * ratio)) },
          { label: 'Avg. Rating',   value: `${avgRating} / 5` },
        ],
        cols: ['Employee', 'Role', 'Revenue', 'Transactions', 'Rating'],
        rows: display.slice(0, 5).map(e => [
          e.name,
          e.role,
          fmtMoney(Math.round(e.rev * ratio)),
          Math.round(e.txns * ratio).toString(),
          e.rating.toFixed(1),
        ]),
        badge: {},
      };
    }

    case 'customer': {
      let filtered = CUST_SEED;
      if (customerSegment !== 'all') filtered = filtered.filter(c => c.segment === customerSegment);
      if (loyaltyTier    !== 'all') filtered = filtered.filter(c => c.tier.toLowerCase() === loyaltyTier);
      if (filtered.length === 0) filtered = CUST_SEED.slice(0, 3);
      const display  = filtered.slice(0, 5);
      const avgSpend = Math.round(filtered.reduce((s, c) => s + c.spend, 0) / filtered.length);
      const toD      = new Date(dateTo ? dateTo + 'T00:00:00' : Date.now());
      const repeatRate = loyaltyTier === 'platinum' ? '82%' : loyaltyTier === 'gold' ? '72%' : loyaltyTier === 'silver' ? '54%' : loyaltyTier === 'bronze' ? '30%' : '68%';
      return {
        estimatedRows: Math.round(filtered.length * numBranch * Math.max(days / 7, 1) * 12),
        kpis: [
          { label: 'Customers',   value: (filtered.length * numBranch * Math.max(Math.round(days / 7), 1) * 12).toLocaleString() },
          { label: 'Avg. Spend',  value: `$${avgSpend.toLocaleString()}` },
          { label: 'Repeat Rate', value: repeatRate },
        ],
        cols: ['Customer', 'Tier', 'Last Visit', 'Total Spend', 'Orders'],
        rows: display.map((c, i) => {
          const d = new Date(toD);
          d.setDate(d.getDate() - i * 2);
          return [c.name, c.tier, d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), `$${c.spend.toLocaleString()}`, c.orders.toString()];
        }),
        badge: { 1: 'tier' },
      };
    }

    default:
      return null;
  }
}

function StockBadge({ value }) {
  if (value === 'In Stock')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{value}</span>;
  if (value === 'Low Stock')
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{value}</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-500" />{value}</span>;
}

function TierBadge({ value }) {
  const map = {
    Platinum: 'bg-violet-50 text-violet-700 border-violet-200',
    Gold:     'bg-amber-50  text-amber-700  border-amber-200',
    Silver:   'bg-slate-100 text-slate-700  border-slate-300',
    Bronze:   'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border', map[value] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>
      {value}
    </span>
  );
}

function PreviewCell({ value, badgeType }) {
  if (badgeType === 'stock') return <StockBadge value={value} />;
  if (badgeType === 'tier')  return <TierBadge  value={value} />;
  return <span>{value}</span>;
}

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
      const d = new Date(today); d.setDate(d.getDate() - 1);
      return { from: toIso(d), to: toIso(d) };
    }
    case 'last7': {
      const d = new Date(today); d.setDate(d.getDate() - 6);
      return { from: toIso(d), to: toIso(today) };
    }
    case 'last30': {
      const d = new Date(today); d.setDate(d.getDate() - 29);
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
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      <div className="px-5 py-4">{children}</div>
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
      <span className={cn(
        'inline-block w-4 h-4 mt-1 rounded-full bg-white shadow-md transition-transform duration-200',
        checked ? 'translate-x-7' : 'translate-x-1'
      )} />
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
  const queryClient = useQueryClient();
  const config = REPORT_TYPE_MAP[reportType];

  useEffect(() => {
    if (!config) navigate('/reports', { replace: true });
  }, [config, navigate]);

  if (!config) return null;

  const Icon = config.icon;
  const sections = config.sections;

  // ── Date Range ──
  const [datePreset, setDatePreset] = useState('last7');
  const initialDates = getPresetDates('last7');
  const [dateFrom, setDateFrom] = useState(initialDates.from);
  const [dateTo,   setDateTo]   = useState(initialDates.to);

  const handlePreset = (id) => {
    setDatePreset(id);
    if (id !== 'custom') {
      const range = getPresetDates(id);
      setDateFrom(range.from);
      setDateTo(range.to);
    }
  };

  // ── Branch ──
  const [allBranches, setAllBranches] = useState(true);
  const [selectedBranchIds, setSelectedBranchIds] = useState(new Set());

  const toggleBranch = (id) => {
    setSelectedBranchIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAllBranchesToggle = (val) => {
    setAllBranches(val);
    if (val) setSelectedBranchIds(new Set());
  };

  // ── Product Category ──
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [allCategories, setAllCategories] = useState(true);

  // ── Finance sub-type ──
  const [financeSubType, setFinanceSubType] = useState('revenue');

  // ── Stock status ──
  const [stockStatus, setStockStatus] = useState('all');

  // ── Warehouse ──
  const [warehouseFilter, setWarehouseFilter] = useState('All Warehouses');

  // ── Role filter ──
  const [roleFilter, setRoleFilter] = useState('All Roles');

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

  // ── Error banner ──
  const [generateError, setGenerateError] = useState(null);

  // ── Fetch real branches ────────────────────────────────────────────────────

  const {
    data: branchesResp,
    isLoading: branchesLoading,
  } = useQuery({
    queryKey: REPORT_KEYS.branches(),
    queryFn: reportService.getBranches,
    staleTime: 60_000,
  });

  const branches = branchesResp?.data ?? [];

  // Seed all branch IDs into selection when first loaded
  useEffect(() => {
    if (branches.length > 0 && selectedBranchIds.size === 0 && allBranches) {
      setSelectedBranchIds(new Set(branches.map((b) => b._id)));
    }
  }, [branches]);

  // ── Build additionalFilters payload ───────────────────────────────────────

  function buildAdditionalFilters() {
    const extra = {};
    if (sections.includes('productCategory')) extra.allCategories = allCategories;
    if (sections.includes('stockStatus'))     extra.stockStatus    = stockStatus;
    if (sections.includes('warehouse'))       extra.warehouseFilter = warehouseFilter;
    if (sections.includes('financeSubType'))  extra.financeSubType = financeSubType;
    if (sections.includes('roleFilter'))      extra.roleFilter     = roleFilter;
    if (sections.includes('performanceMetrics')) extra.perfMetrics = [...perfMetrics];
    if (sections.includes('customerSegment')) extra.customerSegment = customerSegment;
    if (sections.includes('loyaltyTier'))     extra.loyaltyTier   = loyaltyTier;
    if (sections.includes('comparePeriod'))   extra.comparePeriod = comparePeriod;
    return extra;
  }

  // ── Generate mutation ──────────────────────────────────────────────────────

  const generateMutation = useMutation({
    mutationFn: reportService.generateReport,
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: REPORT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: REPORT_KEYS.summary() });
      navigate(`/reports/view/${reportType}`, {
        state: {
          report: resp.data,
          dateFrom,
          dateTo,
          allBranches,
          selectedBranchIds: [...selectedBranchIds],
          additionalFilters: buildAdditionalFilters(),
        },
      });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message
        ?? err?.response?.data?.errors?.[0]
        ?? 'Failed to generate report. Please try again.';
      setGenerateError(msg);
    },
  });

  function handleGenerate() {
    setGenerateError(null);
    const payload = {
      type: reportType.toUpperCase(),
      dateFrom: dateFrom || undefined,
      dateTo:   dateTo   || undefined,
      allBranches,
      branches: allBranches ? [] : [...selectedBranchIds],
      additionalFilters: buildAdditionalFilters(),
    };
    generateMutation.mutate(payload);
  }

  // ── Filter chips for preview panel ────────────────────────────────────────

  const filterChips = [];

  if (dateFrom && dateTo) {
    const label = dateFrom === dateTo
      ? fmtChipDate(dateFrom)
      : `${fmtChipDate(dateFrom)} – ${fmtChipDate(dateTo)}`;
    filterChips.push({ key: 'date', icon: Calendar, label });
  }

  if (allBranches) {
    filterChips.push({ key: 'branch', icon: null, label: 'All Branches' });
  } else if (selectedBranchIds.size > 0) {
    const names = branches.filter((b) => selectedBranchIds.has(b._id)).map((b) => b.name);
    filterChips.push({
      key: 'branch', icon: null,
      label: names.length === 1 ? names[0] : `${names.length} Branches`,
    });
  }

  if (sections.includes('productCategory')) {
    filterChips.push({ key: 'cat', icon: Tag, label: allCategories ? 'All Categories' : 'Selected Categories' });
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
  if (sections.includes('comparePeriod') && comparePeriod) {
    filterChips.push({ key: 'cmp', icon: RefreshCw, label: 'Period Comparison On' });
  }

  const comparePeriodLabel = () => {
    switch (datePreset) {
      case 'today':     return 'Compare vs. yesterday';
      case 'yesterday': return 'Compare vs. 2 days ago';
      case 'last7':     return 'Compare vs. previous 7 days';
      case 'last30':    return 'Compare vs. previous 30 days';
      case 'thisMonth': return 'Compare vs. last month';
      default:          return 'Compare vs. previous period';
    }
  };

  // ── Live preview (recomputes on every filter change) ──────────────────────

  const displayBranches = (() => {
    if (allBranches) return branches.map(b => b.name);
    const selected = branches.filter(b => selectedBranchIds.has(b._id)).map(b => b.name);
    return selected.length > 0 ? selected : branches.map(b => b.name);
  })();

  const preview = computePreview({
    reportType,
    dateFrom,
    dateTo,
    displayBranches: displayBranches.length > 0 ? displayBranches : ['Main Branch HQ'],
    stockStatus,
    financeSubType,
    roleFilter,
    customerSegment,
    loyaltyTier,
  });

  // ── Render ─────────────────────────────────────────────────────────────────

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

          {/* Panel header */}
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
              {branchesLoading ? (
                <div className="grid grid-cols-2 gap-2.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-11 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : branches.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-3">No active branches found</p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {branches.map((b) => (
                    <Checkbox
                      key={b._id}
                      checked={allBranches || selectedBranchIds.has(b._id)}
                      onChange={() => {
                        if (allBranches) return;
                        toggleBranch(b._id);
                      }}
                      label={b.name}
                    />
                  ))}
                </div>
              )}
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
                {WAREHOUSES.map((w) => (
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
                {ROLES.map((r) => (
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
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-slate-900">Report Preview</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
              <BarChart className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-semibold text-slate-600">
                ~{(preview?.estimatedRows ?? config.estimatedRows).toLocaleString()} rows
              </span>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">

            {/* Active filter chips */}
            {filterChips.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {filterChips.map((chip) => (
                  <span
                    key={chip.key}
                    className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {chip.icon && <chip.icon className="w-3 h-3" />}
                    {chip.label}
                    <span className="w-3.5 h-3.5 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors duration-150 ml-0.5">
                      <X className="w-2.5 h-2.5" />
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* KPI mini bar */}
            {preview && (
              <div className="grid grid-cols-3 gap-3">
                {preview.kpis.map((kpi, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>
                    <p className={cn('text-base font-bold', i === 0 ? config.iconColor : 'text-slate-800')}>
                      {kpi.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Error banner */}
            {generateError && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-red-700">Generation failed</p>
                  <p className="text-xs text-red-500 mt-0.5">{generateError}</p>
                </div>
                <button onClick={() => setGenerateError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Data preview table */}
            {preview && (
              <div className={cn('rounded-xl border border-slate-200 overflow-hidden relative', generateMutation.isPending && 'opacity-60')}>
                {/* Generating overlay */}
                {generateMutation.isPending && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700">Generating {config.label}…</p>
                      <p className="text-xs text-slate-400 mt-0.5">Processing data, please wait</p>
                    </div>
                  </div>
                )}

                {/* Column headers */}
                <div className="flex bg-slate-50 border-b border-slate-200">
                  {preview.cols.map((col, ci) => (
                    <div key={ci} className="flex-1 min-w-0 px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
                      {col}
                    </div>
                  ))}
                </div>

                {/* Data rows */}
                {preview.rows.map((row, ri) => (
                  <div key={ri} className="flex border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors duration-100">
                    {row.map((cell, ci) => (
                      <div
                        key={ci}
                        className={cn('flex-1 min-w-0 px-3 py-2.5 text-xs truncate', ci === 0 ? 'font-medium text-slate-800' : 'text-slate-600')}
                      >
                        <PreviewCell value={cell} badgeType={preview.badge[ci]} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-400">
                Sample data · actual results depend on filters
              </p>
              {!generateMutation.isPending && !generateError && (
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Ready to generate
                </div>
              )}
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
          <Button
            variant="primary"
            size="md"
            className="flex items-center gap-2 min-w-[160px] justify-center"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Spinner size="sm" />
                Generating…
              </>
            ) : (
              <>
                Generate Report
                <Download className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
