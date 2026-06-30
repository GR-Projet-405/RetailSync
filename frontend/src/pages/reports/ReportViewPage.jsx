import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  BarChart2, Package, DollarSign, Users, UserCheck,
  ChevronRight, RefreshCw, Printer, Download, Calendar,
  MapPin, TrendingUp, TrendingDown, Search, Filter,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar, AreaChart, Area,
} from 'recharts';
import { Card } from '../../components/Card';
import Button from '../../components/Button';
import DataTable from '../../components/DataTable';
import { cn } from '../../utils/cn';

// ─── Report type meta ────────────────────────────────────────────────────────

const REPORT_META = {
  sales:     { label: 'Sales Report',     icon: BarChart2, iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',    accent: '#3B82F6' },
  inventory: { label: 'Inventory Report', icon: Package,   iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', accent: '#10B981' },
  finance:   { label: 'Finance Report',   icon: DollarSign,iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',   accent: '#F59E0B' },
  employee:  { label: 'Employee Report',  icon: Users,     iconBg: 'bg-violet-100',  iconColor: 'text-violet-600',  accent: '#8B5CF6' },
  customer:  { label: 'Customer Report',  icon: UserCheck, iconBg: 'bg-rose-100',    iconColor: 'text-rose-600',    accent: '#F43F5E' },
};

// ─── Mock data per report type ────────────────────────────────────────────────

const DATA = {
  sales: {
    kpis: [
      { label: 'Total Revenue',    value: '$128,430', trend: '+12.5%', up: true },
      { label: 'Avg Order Value',  value: '$103.50',  trend: '+5.2%',  up: true },
      { label: 'Total Orders',     value: '1,240',    trend: '+8.2%',  up: true },
      { label: 'Top Branch',       value: 'Downtown', sub: '$42.5k',   subClass: 'text-blue-600' },
    ],
    trendLabel: 'Revenue Trend (Oct 2023)',
    trendLines: [
      { key: 'revenue', label: 'Revenue', color: '#3B82F6' },
      { key: 'target',  label: 'Target',  color: '#CBD5E1', dashed: true },
    ],
    trend: [
      { date: 'Oct 1',  revenue: 28000, target: 35000 },
      { date: 'Oct 7',  revenue: 34000, target: 40000 },
      { date: 'Oct 14', revenue: 67000, target: 72000 },
      { date: 'Oct 21', revenue: 98000, target: 90000 },
      { date: 'Oct 31', revenue: 128430, target: 120000 },
    ],
    barsLabel: 'Top Product Categories',
    bars: [
      { name: 'Electronics',  amount: '$58.2k', color: '#3B82F6', pct: 100 },
      { name: 'Home & Living',amount: '$34.5k', color: '#10B981', pct: 59  },
      { name: 'Fashion',      amount: '$22.8k', color: '#F59E0B', pct: 39  },
    ],
    donutLabel: 'Revenue by Branch',
    donutCenter: '$128k\nTOTAL',
    donut: [
      { name: 'Downtown',  value: 45, color: '#3B82F6' },
      { name: 'Westside',  value: 30, color: '#10B981' },
      { name: 'North Port',value: 25, color: '#F59E0B' },
    ],
    tableLabel: 'Sales Transactions',
    totalRows: 1240,
    tableData: [
      { id: '#89234', date: 'Oct 24, 14:32', customer: 'Michael Chen',    branch: 'Downtown', category: 'Electronics', amount: '$1,240.00', status: 'PAID' },
      { id: '#89233', date: 'Oct 24, 12:15', customer: 'Sarah Jenkins',   branch: 'Westside',  category: 'Home',        amount: '$842.50',   status: 'PAID' },
      { id: '#89232', date: 'Oct 23, 11:05', customer: 'David Miller',    branch: 'Downtown', category: 'Fashion',     amount: '$125.00',   status: 'REFUNDED' },
      { id: '#89231', date: 'Oct 23, 09:40', customer: 'Elena Rodriguez', branch: 'Westside',  category: 'Electronics', amount: '$499.00',   status: 'PAID' },
      { id: '#89230', date: 'Oct 22, 16:20', customer: 'James Wilson',    branch: 'North Port',category: 'Home',        amount: '$320.00',   status: 'PAID' },
    ],
    columns: [
      { key: 'id',       header: 'Order ID',   render: (r) => <span className="font-semibold text-blue-600">{r.id}</span> },
      { key: 'date',     header: 'Date',       render: (r) => <span className="text-slate-600">{r.date}</span> },
      { key: 'customer', header: 'Customer',   render: (r) => <span className="font-medium text-slate-800">{r.customer}</span> },
      { key: 'branch',   header: 'Branch',     render: (r) => <span className="text-slate-600">{r.branch}</span> },
      { key: 'category', header: 'Category',   render: (r) => <span className="text-slate-600">{r.category}</span> },
      { key: 'amount',   header: 'Amount',     render: (r) => <span className="font-bold text-slate-900">{r.amount}</span> },
      { key: 'status',   header: 'Status',     render: (r) => <TxBadge status={r.status} /> },
    ],
  },

  inventory: {
    kpis: [
      { label: 'Total SKUs',      value: '2,847',    trend: '+3.2%',       up: true  },
      { label: 'Low Stock Items', value: '48',       trend: '+12 new',     up: false },
      { label: 'Out of Stock',    value: '12',       trend: '2 resolved',  up: true  },
      { label: 'Stock Value',     value: '$284,320', sub: 'Total inventory', subClass: 'text-emerald-600' },
    ],
    trendLabel: 'Stock Level Trend (Oct 2023)',
    trendLines: [
      { key: 'stock',   label: 'Total Stock',  color: '#10B981' },
      { key: 'reorder', label: 'Reorder Zone', color: '#F59E0B', dashed: true },
    ],
    trend: [
      { date: 'Oct 1',  stock: 2900, reorder: 300 },
      { date: 'Oct 7',  stock: 2840, reorder: 300 },
      { date: 'Oct 14', stock: 2760, reorder: 300 },
      { date: 'Oct 21', stock: 2800, reorder: 300 },
      { date: 'Oct 31', stock: 2847, reorder: 300 },
    ],
    barsLabel: 'Stock by Category',
    bars: [
      { name: 'Electronics', amount: '1,240 units', color: '#3B82F6', pct: 100 },
      { name: 'Beverages',   amount: '780 units',   color: '#10B981', pct: 63  },
      { name: 'Bakery',      amount: '420 units',   color: '#F59E0B', pct: 34  },
      { name: 'Dairy',       amount: '280 units',   color: '#8B5CF6', pct: 23  },
    ],
    donutLabel: 'Stock by Branch',
    donutCenter: '2,847\nSKUs',
    donut: [
      { name: 'Main Terminal', value: 40, color: '#3B82F6' },
      { name: 'North Wing',    value: 35, color: '#10B981' },
      { name: 'South Plaza',   value: 25, color: '#F59E0B' },
    ],
    tableLabel: 'Inventory Items',
    totalRows: 856,
    tableData: [
      { sku: 'EL-001', name: 'MacBook Pro 14"',         stock: 42,  branch: 'Main Terminal', status: 'IN STOCK',    value: '$2,840' },
      { sku: 'BV-023', name: 'Premium Coffee Beans 1kg', stock: 8,   branch: 'North Wing',    status: 'LOW STOCK',   value: '$24'    },
      { sku: 'EL-045', name: 'iPhone 15 Pro',            stock: 0,   branch: 'South Plaza',   status: 'OUT OF STOCK',value: '$999'   },
      { sku: 'DA-012', name: 'Organic Whole Milk 2L',    stock: 124, branch: 'Main Terminal', status: 'IN STOCK',    value: '$3.20'  },
      { sku: 'BK-007', name: 'Sourdough Bread',          stock: 15,  branch: 'North Wing',    status: 'IN STOCK',    value: '$4.50'  },
    ],
    columns: [
      { key: 'sku',    header: 'SKU',        render: (r) => <span className="font-mono text-xs font-semibold text-blue-600">{r.sku}</span> },
      { key: 'name',   header: 'Product',    render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
      { key: 'stock',  header: 'Stock',      render: (r) => <span className="font-bold text-slate-900">{r.stock}</span> },
      { key: 'branch', header: 'Branch',     render: (r) => <span className="text-slate-600">{r.branch}</span> },
      { key: 'status', header: 'Status',     render: (r) => <InvBadge status={r.status} /> },
      { key: 'value',  header: 'Unit Value', render: (r) => <span className="font-semibold text-slate-900">{r.value}</span> },
    ],
  },

  finance: {
    kpis: [
      { label: 'Total Revenue', value: '$284,200', trend: '+9.4%',  up: true  },
      { label: 'Net Profit',    value: '$68,210',  trend: '+14.2%', up: true  },
      { label: 'Tax Collected', value: '$28,420',  trend: '+9.4%',  up: true  },
      { label: 'Profit Margin', value: '24.0%',    sub: 'vs 22.1% last period', subClass: 'text-emerald-600' },
    ],
    trendLabel: 'Revenue vs Cost Trend (Oct 2023)',
    trendLines: [
      { key: 'revenue', label: 'Revenue', color: '#F59E0B' },
      { key: 'cost',    label: 'Cost',    color: '#EF4444', dashed: true },
    ],
    trend: [
      { date: 'Oct 1',  revenue: 62000, cost: 45000 },
      { date: 'Oct 7',  revenue: 88000, cost: 61000 },
      { date: 'Oct 14', revenue: 145000, cost: 98000 },
      { date: 'Oct 21', revenue: 210000, cost: 148000 },
      { date: 'Oct 31', revenue: 284200, cost: 215990 },
    ],
    barsLabel: 'Revenue by Category',
    bars: [
      { name: 'Product Sales', amount: '$198.4k', color: '#F59E0B', pct: 100 },
      { name: 'Service Fees',  amount: '$54.2k',  color: '#10B981', pct: 27  },
      { name: 'Subscriptions', amount: '$31.6k',  color: '#3B82F6', pct: 16  },
    ],
    donutLabel: 'Expense Breakdown',
    donutCenter: '$215k\nCOSTS',
    donut: [
      { name: 'COGS',      value: 52, color: '#F59E0B' },
      { name: 'Operating', value: 28, color: '#EF4444' },
      { name: 'Tax',       value: 13, color: '#3B82F6' },
      { name: 'Other',     value: 7,  color: '#CBD5E1' },
    ],
    tableLabel: 'Finance Entries',
    totalRows: 320,
    tableData: [
      { ref: 'INV-2024-0421', date: 'Oct 24', type: 'Product Sale',  revenue: '$4,280', cost: '$2,940', profit: '$1,340', margin: '31.3%' },
      { ref: 'INV-2024-0420', date: 'Oct 24', type: 'Service Fee',   revenue: '$840',   cost: '$310',   profit: '$530',   margin: '63.1%' },
      { ref: 'INV-2024-0419', date: 'Oct 23', type: 'Subscription',  revenue: '$299',   cost: '$45',    profit: '$254',   margin: '85.0%' },
      { ref: 'INV-2024-0418', date: 'Oct 23', type: 'Product Sale',  revenue: '$6,120', cost: '$4,200', profit: '$1,920', margin: '31.4%' },
      { ref: 'INV-2024-0417', date: 'Oct 22', type: 'Product Refund',revenue: '-$380',  cost: '-$260',  profit: '-$120',  margin: '31.6%' },
    ],
    columns: [
      { key: 'ref',     header: 'Reference',  render: (r) => <span className="font-mono text-xs font-semibold text-amber-600">{r.ref}</span> },
      { key: 'date',    header: 'Date',       render: (r) => <span className="text-slate-600">{r.date}</span> },
      { key: 'type',    header: 'Type',       render: (r) => <span className="font-medium text-slate-800">{r.type}</span> },
      { key: 'revenue', header: 'Revenue',    render: (r) => <span className="font-bold text-slate-900">{r.revenue}</span> },
      { key: 'cost',    header: 'Cost',       render: (r) => <span className="text-slate-600">{r.cost}</span> },
      { key: 'profit',  header: 'Net Profit', render: (r) => <span className={cn('font-bold', r.profit.startsWith('-') ? 'text-red-600' : 'text-emerald-600')}>{r.profit}</span> },
      { key: 'margin',  header: 'Margin',     render: (r) => <span className="text-slate-700">{r.margin}</span> },
    ],
  },

  employee: {
    kpis: [
      { label: 'Total Staff',     value: '84',        trend: '+3 new',   up: true  },
      { label: 'Top Performer',   value: 'Alex Chen', sub: '$24.2k sales', subClass: 'text-violet-600' },
      { label: 'Avg Sales/Staff', value: '$1,524',    trend: '+6.8%',    up: true  },
      { label: 'Total Tx Handled',value: '1,240',     trend: '+8.2%',    up: true  },
    ],
    trendLabel: 'Team Sales Performance (Oct 2023)',
    trendLines: [
      { key: 'sales', label: 'Sales', color: '#8B5CF6' },
      { key: 'target',label: 'Target',color: '#CBD5E1', dashed: true },
    ],
    trend: [
      { date: 'Oct 1',  sales: 18000, target: 22000 },
      { date: 'Oct 7',  sales: 26000, target: 28000 },
      { date: 'Oct 14', sales: 34000, target: 32000 },
      { date: 'Oct 21', sales: 42000, target: 40000 },
      { date: 'Oct 31', sales: 52000, target: 50000 },
    ],
    barsLabel: 'Top Performers',
    bars: [
      { name: 'Alex Chen',    amount: '$24.2k', color: '#8B5CF6', pct: 100 },
      { name: 'Sarah Patel',  amount: '$19.8k', color: '#3B82F6', pct: 82  },
      { name: 'Mark Johnson', amount: '$16.4k', color: '#10B981', pct: 68  },
      { name: 'Emma Davis',   amount: '$14.1k', color: '#F59E0B', pct: 58  },
    ],
    donutLabel: 'Staff by Department',
    donutCenter: '84\nSTAFF',
    donut: [
      { name: 'Cashier',    value: 45, color: '#8B5CF6' },
      { name: 'Management', value: 25, color: '#3B82F6' },
      { name: 'Inventory',  value: 20, color: '#10B981' },
      { name: 'Support',    value: 10, color: '#F59E0B' },
    ],
    tableLabel: 'Employee Performance',
    totalRows: 48,
    tableData: [
      { id: 'EMP-001', name: 'Alex Chen',    role: 'Branch Manager',     branch: 'Downtown',  sales: '$24,200', txCount: 184, rating: '4.9/5' },
      { id: 'EMP-014', name: 'Sarah Patel',  role: 'Senior Cashier',     branch: 'Westside',  sales: '$19,800', txCount: 162, rating: '4.7/5' },
      { id: 'EMP-022', name: 'Mark Johnson', role: 'Cashier',            branch: 'North Port', sales: '$16,400', txCount: 138, rating: '4.5/5' },
      { id: 'EMP-031', name: 'Emma Davis',   role: 'Inventory Manager',  branch: 'Downtown',  sales: '$14,100', txCount: 96,  rating: '4.6/5' },
      { id: 'EMP-008', name: 'James Wilson', role: 'Cashier',            branch: 'Westside',  sales: '$11,200', txCount: 104, rating: '4.3/5' },
    ],
    columns: [
      { key: 'id',      header: 'Emp ID',      render: (r) => <span className="font-mono text-xs font-semibold text-violet-600">{r.id}</span> },
      { key: 'name',    header: 'Employee',    render: (r) => <span className="font-semibold text-slate-900">{r.name}</span> },
      { key: 'role',    header: 'Role',        render: (r) => <span className="text-slate-600">{r.role}</span> },
      { key: 'branch',  header: 'Branch',      render: (r) => <span className="text-slate-600">{r.branch}</span> },
      { key: 'sales',   header: 'Total Sales', render: (r) => <span className="font-bold text-slate-900">{r.sales}</span> },
      { key: 'txCount', header: 'Transactions',render: (r) => <span className="text-slate-700">{r.txCount}</span> },
      { key: 'rating',  header: 'Rating',      render: (r) => <span className="font-semibold text-violet-600">{r.rating}</span> },
    ],
  },

  customer: {
    kpis: [
      { label: 'Total Customers',    value: '12,480', trend: '+5.3%', up: true },
      { label: 'New Customers',      value: '648',    trend: '+18.2%',up: true },
      { label: 'Returning Customers',value: '11,832', trend: '+4.8%', up: true },
      { label: 'Avg Spend',          value: '$87.40', sub: 'per visit', subClass: 'text-rose-600' },
    ],
    trendLabel: 'Customer Acquisition Trend (Oct 2023)',
    trendLines: [
      { key: 'new',      label: 'New',      color: '#F43F5E' },
      { key: 'returning',label: 'Returning',color: '#3B82F6', dashed: true },
    ],
    trend: [
      { date: 'Oct 1',  new: 98,  returning: 1820 },
      { date: 'Oct 7',  new: 124, returning: 1960 },
      { date: 'Oct 14', new: 156, returning: 2140 },
      { date: 'Oct 21', new: 182, returning: 2380 },
      { date: 'Oct 31', new: 648, returning: 11832 },
    ],
    barsLabel: 'Top Customers by Spend',
    bars: [
      { name: 'Michael Chen',    amount: '$4,280', color: '#F43F5E', pct: 100 },
      { name: 'Sarah Jenkins',   amount: '$3,840', color: '#8B5CF6', pct: 90  },
      { name: 'Elena Rodriguez', amount: '$2,920', color: '#3B82F6', pct: 68  },
      { name: 'James Wilson',    amount: '$2,140', color: '#10B981', pct: 50  },
    ],
    donutLabel: 'Loyalty Tier Distribution',
    donutCenter: '12,480\nCUSTOMERS',
    donut: [
      { name: 'Bronze',   value: 48, color: '#F59E0B' },
      { name: 'Silver',   value: 28, color: '#94A3B8' },
      { name: 'Gold',     value: 16, color: '#EAB308' },
      { name: 'Platinum', value: 8,  color: '#8B5CF6' },
    ],
    tableLabel: 'Customer Activity',
    totalRows: 2100,
    tableData: [
      { id: 'CUS-8821', name: 'Michael Chen',    segment: 'VIP',     branch: 'Downtown',  spend: '$4,280', visits: 24, tier: 'Gold' },
      { id: 'CUS-4412', name: 'Sarah Jenkins',   segment: 'Regular', branch: 'Westside',  spend: '$3,840', visits: 18, tier: 'Silver' },
      { id: 'CUS-6634', name: 'Elena Rodriguez', segment: 'Regular', branch: 'Downtown',  spend: '$2,920', visits: 15, tier: 'Silver' },
      { id: 'CUS-2201', name: 'James Wilson',    segment: 'Regular', branch: 'North Port', spend: '$2,140', visits: 12, tier: 'Bronze' },
      { id: 'CUS-9980', name: 'Aisha Patel',     segment: 'New',     branch: 'Westside',  spend: '$320',   visits: 2,  tier: 'Bronze' },
    ],
    columns: [
      { key: 'id',      header: 'Customer ID', render: (r) => <span className="font-mono text-xs font-semibold text-rose-600">{r.id}</span> },
      { key: 'name',    header: 'Name',        render: (r) => <span className="font-semibold text-slate-900">{r.name}</span> },
      { key: 'segment', header: 'Segment',     render: (r) => <span className="text-slate-600">{r.segment}</span> },
      { key: 'branch',  header: 'Branch',      render: (r) => <span className="text-slate-600">{r.branch}</span> },
      { key: 'spend',   header: 'Total Spend', render: (r) => <span className="font-bold text-slate-900">{r.spend}</span> },
      { key: 'visits',  header: 'Visits',      render: (r) => <span className="text-slate-700">{r.visits}</span> },
      { key: 'tier',    header: 'Tier',        render: (r) => <TierBadge tier={r.tier} /> },
    ],
  },
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function TxBadge({ status }) {
  const styles = {
    PAID:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    REFUNDED: 'bg-red-50 text-red-700 border-red-200',
    PENDING:  'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border tracking-wide', styles[status] || styles.PAID)}>
      {status}
    </span>
  );
}

function InvBadge({ status }) {
  const styles = {
    'IN STOCK':     'bg-emerald-50 text-emerald-700 border-emerald-200',
    'LOW STOCK':    'bg-amber-50 text-amber-700 border-amber-200',
    'OUT OF STOCK': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border tracking-wide', styles[status] || '')}>
      {status}
    </span>
  );
}

function TierBadge({ tier }) {
  const styles = {
    Platinum: 'bg-violet-50 text-violet-700 border-violet-200',
    Gold:     'bg-yellow-50 text-yellow-700 border-yellow-200',
    Silver:   'bg-slate-100 text-slate-600 border-slate-200',
    Bronze:   'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border', styles[tier] || '')}>
      {tier}
    </span>
  );
}

function KpiCard({ label, value, trend, up, sub, subClass }) {
  return (
    <div className="flex-1 min-w-0 border-t-2 border-blue-500 pt-4 px-5 first:pl-6 last:pr-6">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{label}</p>
      <p className="text-[1.6rem] font-bold text-slate-900 leading-tight mb-1.5 truncate">{value}</p>
      {trend && (
        <span className={cn('inline-flex items-center gap-0.5 text-xs font-bold', up ? 'text-emerald-500' : 'text-red-500')}>
          {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {trend}
        </span>
      )}
      {sub && <p className={cn('text-sm font-semibold mt-0.5', subClass || 'text-slate-600')}>{sub}</p>}
    </div>
  );
}

function ChipTag({ icon: Icon, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {label}
    </span>
  );
}

const yFmt = (v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v;

function TrendLineChart({ data, lines, accent }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={yFmt} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: 12 }}
          formatter={(v) => [typeof v === 'number' && v > 999 ? `$${v.toLocaleString()}` : v]}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={l.dashed ? 1.5 : 2.5}
            strokeDasharray={l.dashed ? '5 5' : undefined}
            dot={{ r: 3, fill: l.color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function DonutChart({ data, centerText }) {
  const [line1, line2] = centerText.split('\n');
  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
        <PieChart width={160} height={160}>
          <Pie data={data} cx={75} cy={75} innerRadius={52} outerRadius={75} dataKey="value" strokeWidth={2} stroke="#fff">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold text-slate-900 leading-tight">{line1}</span>
          <span className="text-[10px] font-semibold text-slate-400 tracking-widest">{line2}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-sm text-slate-700 truncate">{d.name}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({ bars }) {
  return (
    <div className="space-y-5">
      {bars.map((b) => (
        <div key={b.name}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-700">{b.name}</span>
            <span className="text-sm font-bold text-slate-900">{b.amount}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${b.pct}%`, background: b.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReportViewPage() {
  const { reportType } = useParams();
  const { state } = useLocation();
  const meta = REPORT_META[reportType];
  const report = DATA[reportType];
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  if (!meta || !report) return null;

  const dateLabel = state?.dateFrom && state?.dateTo
    ? `${state.dateFrom} - ${state.dateTo}`
    : 'Oct 1 - Oct 31, 2023';

  const branchLabel = state?.allBranches !== false ? 'All Branches' : 'Selected Branches';

  return (
    <div className="space-y-5">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link to="/reports" className="text-slate-500 hover:text-blue-600 font-medium transition-colors">Reports</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to={`/reports/configure/${reportType}`} className="text-slate-500 hover:text-blue-600 font-medium transition-colors">{meta.label}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-blue-600 font-semibold">View</span>
      </nav>

      {/* ── Report header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-end gap-5 flex-wrap">
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{meta.label.split(' ').join('\n')}</h1>
          <div className="flex items-center gap-2 flex-wrap pb-1">
            <ChipTag icon={Calendar} label={dateLabel} />
            <ChipTag icon={MapPin} label={branchLabel} />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm">
            <Printer className="w-4 h-4" />
          </button>
          <Button variant="outline" size="sm" className="flex items-center gap-1.5 h-9 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <Card className="overflow-hidden">
        <div className="flex divide-x divide-slate-100">
          {report.kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>
      </Card>

      {/* ── Trend Chart ── */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-5">{report.trendLabel}</h3>
        <TrendLineChart data={report.trend} lines={report.trendLines} accent={meta.accent} />
      </Card>

      {/* ── Bars + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">{report.barsLabel}</h3>
          <CategoryBars bars={report.bars} />
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-5">{report.donutLabel}</h3>
          <DonutChart data={report.donut} centerText={report.donutCenter} />
        </Card>
      </div>

      {/* ── Table ── */}
      <Card className="overflow-hidden">
        {/* Table header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-800">{report.tableLabel}</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              {report.totalRows.toLocaleString()} ROWS
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${report.tableLabel.toLowerCase()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 focus:bg-white outline-none transition-all w-52"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
          </div>
        </div>

        <DataTable columns={report.columns} data={report.tableData} />

        {/* Table footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            Showing 1 to {report.tableData.length} of {report.totalRows.toLocaleString()} entries
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-150',
                  currentPage === p
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 border border-slate-200'
                )}
              >
                {p}
              </button>
            ))}
            <button className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
