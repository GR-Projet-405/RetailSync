import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  ClipboardList,
  DollarSign,
  Users,
  UserCheck,
  TrendingUp,
  AlertTriangle,
  Star,
  Eye,
  Download,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  ArrowRight,
  ShoppingCart,
  Package,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Card } from '../../components/Card';
import DataTable from '../../components/DataTable';
import { cn } from '../../utils/cn';

// ─── Static mock data (replace with API calls when backend is ready) ──────────

const SUMMARY_STATS = [
  {
    id: 'revenue',
    label: 'TOTAL REVENUE (TODAY)',
    value: '$12,450.25',
    trend: '+8.2%',
    trendUp: true,
    sub: 'vs. $11,500 yesterday',
    icon: BarChart2,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badge: null,
  },
  {
    id: 'transactions',
    label: 'TOTAL TRANSACTIONS',
    value: '1,284',
    trend: '+4.5%',
    trendUp: true,
    sub: 'Completed checkouts',
    icon: ShoppingCart,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    badge: null,
  },
  {
    id: 'top-product',
    label: 'TOP SELLING PRODUCT',
    value: 'Premium Espresso Beans',
    trend: null,
    sub: '452 units sold today',
    icon: Star,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    badge: { label: 'Trending', color: 'text-violet-600' },
  },
  {
    id: 'low-stock',
    label: 'LOW STOCK ALERTS',
    value: '12/12',
    trend: null,
    sub: 'Operational system status',
    icon: AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    badge: { label: 'Online', color: 'text-emerald-600', dot: true },
  },
];

const REPORT_TYPES = [
  {
    id: 'sales',
    title: 'Sales Report',
    description: 'Revenue, transactions, and daily trends.',
    icon: BarChart2,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Stock levels, alerts, and movement.',
    icon: Package,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'finance',
    title: 'Finance Report',
    description: 'Revenue, tax, and profit margins.',
    icon: DollarSign,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  {
    id: 'employee',
    title: 'Employee',
    description: 'Staff performance and sales per head.',
    icon: Users,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
  },
  {
    id: 'customer',
    title: 'Customer',
    description: 'Loyalty, spend analysis, and retention.',
    icon: UserCheck,
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
];

const RECENT_REPORTS = [
  {
    id: 1,
    name: 'Daily Revenue Summary',
    type: 'Sales',
    typeIcon: BarChart2,
    typeColor: 'text-blue-600',
    typeBg: 'bg-blue-50',
    generatedBy: 'Auto-System',
    date: 'Oct 24, 2023',
    time: '08:00 AM',
    status: 'Completed',
  },
  {
    id: 2,
    name: 'Monthly Inventory Audit',
    type: 'Inventory',
    typeIcon: Package,
    typeColor: 'text-emerald-600',
    typeBg: 'bg-emerald-50',
    generatedBy: 'Sarah Jenkins',
    date: 'Oct 23, 2023',
    time: '04:15 PM',
    status: 'Completed',
  },
  {
    id: 3,
    name: 'Yearly Tax Reconciliation',
    type: 'Finance',
    typeIcon: DollarSign,
    typeColor: 'text-amber-600',
    typeBg: 'bg-amber-50',
    generatedBy: 'Marcus Reed',
    date: 'Oct 23, 2023',
    time: '11:20 AM',
    status: 'Pending',
  },
  {
    id: 4,
    name: 'Staff Efficiency Q3',
    type: 'Employee',
    typeIcon: Users,
    typeColor: 'text-violet-600',
    typeBg: 'bg-violet-50',
    generatedBy: 'System Log',
    date: 'Oct 22, 2023',
    time: '02:45 PM',
    status: 'Completed',
  },
  {
    id: 5,
    name: 'Loyalty Program Engagement',
    type: 'Customer',
    typeIcon: UserCheck,
    typeColor: 'text-rose-600',
    typeBg: 'bg-rose-50',
    generatedBy: 'Admin User',
    date: 'Oct 21, 2023',
    time: '09:30 AM',
    status: 'Completed',
  },
];

const BRANCHES = ['All Branches', 'Downtown Flagship', 'Westside Mall', 'Airport Hub', 'North District'];
const TIME_FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom', label: 'Custom Range', icon: Calendar },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ stat }) {
  const Icon = stat.icon;
  return (
    <Card className="p-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', stat.iconBg)}>
          <Icon className={cn('w-5 h-5', stat.iconColor)} />
        </div>
        {stat.badge && (
          <span className={cn('text-xs font-semibold flex items-center gap-1', stat.badge.color)}>
            {stat.badge.dot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />}
            {stat.badge.label}
          </span>
        )}
        {stat.trend && (
          <span className={cn('text-xs font-semibold flex items-center gap-0.5', stat.trendUp ? 'text-emerald-600' : 'text-red-500')}>
            <TrendingUp className="w-3 h-3" />
            {stat.trend}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight truncate">{stat.value}</p>
      </div>

      <p className="text-xs text-slate-500">{stat.sub}</p>
    </Card>
  );
}

function ReportTypeCard({ type, selected, onClick }) {
  const Icon = type.icon;
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 min-w-0 text-left rounded-2xl border p-5 transition-all duration-150 group',
        selected
          ? 'border-blue-500 bg-blue-50/60 shadow-sm'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm hover:bg-blue-50/30'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', type.iconBg)}>
          <Icon className={cn('w-5 h-5', type.iconColor)} />
        </div>
        <ArrowRight className={cn(
          'w-4 h-4 transition-colors duration-150',
          selected ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-400'
        )} />
      </div>
      <p className="text-sm font-semibold text-slate-900 mb-1">{type.title}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{type.description}</p>
    </button>
  );
}

function StatusPill({ status }) {
  if (status === 'Completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      {status}
    </span>
  );
}

function BranchDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors duration-150"
      >
        {value}
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
            {BRANCHES.map((b) => (
              <button
                key={b}
                onClick={() => { onChange(b); setOpen(false); }}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700',
                  value === b ? 'text-blue-700 font-semibold bg-blue-50' : 'text-slate-700'
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('today');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedType, setSelectedType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalReports = 24;
  const perPage = 5;
  const totalPages = Math.ceil(totalReports / perPage);

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Report Name',
      render: (row) => {
        const Icon = row.typeIcon;
        return (
          <div className="flex items-center gap-3">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', row.typeBg)}>
              <Icon className={cn('w-4 h-4', row.typeColor)} />
            </div>
            <span className="font-medium text-slate-900">{row.name}</span>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={cn('text-sm font-medium', row.typeColor)}>{row.type}</span>
      ),
    },
    {
      key: 'generatedBy',
      header: 'Generated By',
      render: (row) => <span className="text-slate-600">{row.generatedBy}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <div className="text-slate-600">
          <p>{row.date}</p>
          <p className="text-xs text-slate-400">{row.time}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors duration-150">
            <Eye className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors duration-150">
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <PageHeader
        title="Reports & Analytics"
        description="Monitor your business performance across all branches"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Time filter tabs */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5">
              {TIME_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150',
                    activeFilter === f.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  {f.icon && <f.icon className="w-3.5 h-3.5" />}
                  {f.label}
                </button>
              ))}
            </div>
            {/* Branch dropdown */}
            <BranchDropdown value={selectedBranch} onChange={setSelectedBranch} />
          </div>
        }
      />

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SUMMARY_STATS.map((stat) => (
          <SummaryCard key={stat.id} stat={stat} />
        ))}
      </div>

      {/* ── Select Report Type ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Select Report Type</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors duration-150">
            Manage Favorites
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {REPORT_TYPES.map((type) => (
            <ReportTypeCard
              key={type.id}
              type={type}
              selected={selectedType === type.id}
              onClick={() => navigate(`/reports/configure/${type.id}`)}
            />
          ))}
        </div>
      </div>

      {/* ── Recent Reports ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">Review and download recently generated data exports</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </Button>
            <Button variant="primary" size="sm" className="flex items-center gap-1.5" onClick={() => navigate('/reports/configure/sales')}>
              <Plus className="w-3.5 h-3.5" />
              Generate New
            </Button>
          </div>
        </div>

        <DataTable columns={columns} data={RECENT_REPORTS} />

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, totalReports)} of {totalReports} reports
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
