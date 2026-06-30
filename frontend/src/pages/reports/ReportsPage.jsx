import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  ArrowRight,
  Package,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import { Card } from '../../components/Card';
import DataTable from '../../components/DataTable';
import Spinner from '../../components/Spinner';
import { cn } from '../../utils/cn';
import { reportService, REPORT_KEYS } from '../../services/reportService';
import { computeReportData, generateReportPDF } from '../../utils/reportPdfExport';

// ─── Constants ────────────────────────────────────────────────────────────────

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

const TYPE_META = {
  SALES:     { label: 'Sales',     icon: BarChart2,  color: 'text-blue-600',    bg: 'bg-blue-50' },
  INVENTORY: { label: 'Inventory', icon: Package,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  FINANCE:   { label: 'Finance',   icon: DollarSign, color: 'text-amber-600',   bg: 'bg-amber-50' },
  EMPLOYEE:  { label: 'Employee',  icon: Users,      color: 'text-violet-600',  bg: 'bg-violet-50' },
  CUSTOMER:  { label: 'Customer',  icon: UserCheck,  color: 'text-rose-600',    bg: 'bg-rose-50' },
};

const TIME_FILTERS = [
  { id: 'today',   label: 'Today' },
  { id: 'weekly',  label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'custom',  label: 'Custom Range', icon: Calendar },
];

const BRANCHES = ['All Branches', 'Downtown Flagship', 'Westside Mall', 'Airport Hub', 'North District'];

const PER_PAGE = 5;

const TYPE_FILTER_OPTIONS = [
  { value: '',          label: 'All' },
  { value: 'SALES',     label: 'Sales' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'FINANCE',   label: 'Finance' },
  { value: 'EMPLOYEE',  label: 'Employee' },
  { value: 'CUSTOMER',  label: 'Customer' },
];

// ─── KPI card definitions driven by API response ──────────────────────────────

function buildSummaryStats(data) {
  const topTypeLabel = data?.topType
    ? (TYPE_META[data.topType]?.label ?? data.topType)
    : '—';

  return [
    {
      id: 'today',
      label: "TODAY'S REPORTS",
      value: data?.todayReports ?? 0,
      sub: 'Reports generated today',
      icon: ClipboardList,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badge: null,
    },
    {
      id: 'month',
      label: 'REPORTS THIS MONTH',
      value: data?.monthReports ?? 0,
      sub: 'Generated so far this month',
      icon: BarChart2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badge: null,
    },
    {
      id: 'topType',
      label: 'TOP REPORT TYPE',
      value: topTypeLabel,
      sub: 'Most generated report category',
      icon: Star,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      badge: { label: 'Trending', color: 'text-violet-600' },
    },
    {
      id: 'branches',
      label: 'ACTIVE BRANCHES',
      value: data?.activeBranches ?? 0,
      sub: `${data?.activeUsers ?? 0} active staff members`,
      icon: AlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-500',
      badge: { label: 'Live', color: 'text-emerald-600', dot: true },
    },
  ];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SummaryCard({ stat, loading }) {
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
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
        {loading ? (
          <div className="h-7 w-20 bg-slate-100 animate-pulse rounded-md" />
        ) : (
          <p className="text-xl font-bold text-slate-900 leading-tight truncate">{stat.value}</p>
        )}
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
  const s = status?.toUpperCase();
  if (s === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }
  if (s === 'PENDING') {
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
      {status ?? 'Failed'}
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

function TableSkeleton() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: PER_PAGE }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-48 bg-slate-100 animate-pulse rounded" />
            <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
          </div>
          <div className="h-3 w-20 bg-slate-100 animate-pulse rounded" />
          <div className="h-3 w-28 bg-slate-100 animate-pulse rounded" />
          <div className="h-3 w-24 bg-slate-100 animate-pulse rounded" />
          <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-full" />
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-slate-100 animate-pulse rounded-lg" />
            <div className="w-8 h-8 bg-slate-100 animate-pulse rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState('today');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedType, setSelectedType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: summaryResp,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: REPORT_KEYS.summary(),
    queryFn: reportService.getSummaryStats,
    staleTime: 30_000,
  });

  const listParams = {
    page: currentPage,
    limit: PER_PAGE,
    ...(typeFilter ? { type: typeFilter } : {}),
  };

  const {
    data: listResp,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: REPORT_KEYS.list(listParams),
    queryFn: () => reportService.getRecentReports(listParams),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  // ── Mutation ───────────────────────────────────────────────────────────────

  const generateMutation = useMutation({
    mutationFn: reportService.generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REPORT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: REPORT_KEYS.summary() });
    },
  });

  // ── Derived state ──────────────────────────────────────────────────────────

  const summaryStats = buildSummaryStats(summaryResp?.data);
  const reports      = listResp?.data?.reports    ?? [];
  const pagination   = listResp?.data?.pagination ?? { total: 0, totalPages: 1 };

  // ── Helpers ────────────────────────────────────────────────────────────────

  function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function generatedByName(gb) {
    if (!gb) return '—';
    if (typeof gb === 'string') return gb;
    const name = [gb.firstName, gb.lastName].filter(Boolean).join(' ');
    return name || gb.employeeId || '—';
  }

  function handleTypeCardClick(typeId) {
    setSelectedType(typeId);
    navigate(`/reports/configure/${typeId}`);
  }

  const ACCENT_HEX = {
    SALES: '#3B82F6', INVENTORY: '#10B981', FINANCE: '#F59E0B', EMPLOYEE: '#8B5CF6', CUSTOMER: '#F43F5E',
  };

  const BRANCH_NAMES = ['Main Branch HQ', 'Downtown Store', 'Westside Outlet'];

  async function handleDownloadPDF(row) {
    const filters       = row.filters || {};
    const af            = filters.additionalFilters || {};
    const allBranches   = filters.allBranches ?? true;
    const nb            = allBranches ? 3 : Math.max((filters.branches || []).length, 1);
    const displayBranches = allBranches ? BRANCH_NAMES : BRANCH_NAMES.slice(0, nb);
    const reportType    = (row.type || 'SALES').toLowerCase();
    const dateFrom      = filters.dateFrom || null;
    const dateTo        = filters.dateTo   || null;

    const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
    const dateLabel   = (fmtD(dateFrom) && fmtD(dateTo)) ? `${fmtD(dateFrom)} – ${fmtD(dateTo)}` : 'All Time';
    const branchLabel = allBranches ? 'All Branches' : `${nb} Branch${nb !== 1 ? 'es' : ''}`;

    const vd = computeReportData({
      reportType,
      dateFrom,
      dateTo,
      displayBranches,
      stockStatus:      af.stockStatus      || null,
      financeSubType:   af.financeSubType   || null,
      roleFilter:       af.roleFilter       || null,
      customerSegment:  af.customerSegment  || null,
      loyaltyTier:      af.loyaltyTier      || null,
      savedRows:        row.metadata?.totalRows || null,
    });

    await generateReportPDF({
      vd,
      accent:      ACCENT_HEX[row.type] || '#3B82F6',
      reportName:  row.name || `${TYPE_META[row.type]?.label || 'Report'}`,
      dateLabel,
      branchLabel,
      report: row,
    });
  }

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'name',
      header: 'Report Name',
      render: (row) => {
        const meta = TYPE_META[row.type] ?? TYPE_META.SALES;
        const Icon = meta.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', meta.bg)}>
              <Icon className={cn('w-4 h-4', meta.color)} />
            </div>
            <span className="font-medium text-slate-900">{row.name}</span>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        const meta = TYPE_META[row.type] ?? TYPE_META.SALES;
        return <span className={cn('text-sm font-medium', meta.color)}>{meta.label}</span>;
      },
    },
    {
      key: 'generatedBy',
      header: 'Generated By',
      render: (row) => (
        <span className="text-slate-600">{generatedByName(row.generatedBy)}</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <div className="text-slate-600">
          <p>{formatDate(row.createdAt)}</p>
          <p className="text-xs text-slate-400">{formatTime(row.createdAt)}</p>
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
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/reports/view/${row.type?.toLowerCase()}`)}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-colors duration-150"
            title="View report"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownloadPDF(row)}
            className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-emerald-600 transition-colors duration-150"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <PageHeader
        title="Reports & Analytics"
        description="Monitor your business performance across all branches"
        actions={
          <div className="flex items-center gap-3 flex-wrap">
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
            <BranchDropdown value={selectedBranch} onChange={setSelectedBranch} />
          </div>
        }
      />

      {/* ── Summary Cards ── */}
      {summaryError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-center justify-between">
          <p className="text-sm text-red-700">Failed to load summary statistics.</p>
          <button
            onClick={() => refetchSummary()}
            className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryStats.map((stat) => (
            <SummaryCard key={stat.id} stat={stat} loading={summaryLoading} />
          ))}
        </div>
      )}

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
              onClick={() => handleTypeCardClick(type.id)}
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
            {/* Type filter pills */}
            <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-white">
              {TYPE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTypeFilter(opt.value); setCurrentPage(1); }}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150',
                    typeFilter === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => navigate('/reports/configure/sales')}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Generate New
            </Button>
          </div>
        </div>

        {/* Table / skeleton / error / empty state */}
        {listError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-red-700 font-medium">Failed to load reports.</p>
            <button
              onClick={() => refetchList()}
              className="flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>
          </div>
        ) : listLoading ? (
          <Card className="overflow-hidden">
            <TableSkeleton />
          </Card>
        ) : reports.length === 0 ? (
          <Card className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">No reports found</p>
            <p className="text-xs text-slate-500">
              {typeFilter
                ? `No ${TYPE_META[typeFilter]?.label ?? typeFilter} reports yet.`
                : 'Generate your first report to get started.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              className="mt-1"
              onClick={() => navigate('/reports/configure/sales')}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Generate Report
            </Button>
          </Card>
        ) : (
          <DataTable columns={columns} data={reports} />
        )}

        {/* Pagination */}
        {!listError && pagination.total > 0 && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, pagination.total)} of {pagination.total} reports
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 1 || p === 1 || p === pagination.totalPages)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === '…' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-150',
                        currentPage === item
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
