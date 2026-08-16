import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart2, Package, DollarSign, Users, UserCheck,
  TrendingUp, Building2, Star, Eye, Download,
  ChevronLeft, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import { Card } from '../../components/Card';
import { Modal } from '../../components/Modal';
import { cn } from '../../utils/cn';
import { reportService, REPORT_KEYS } from '../../services/reportService';
import { resolveBranchLabel, namesFromBranchRefs } from '../../utils/branchLabel';

// ─── Constants ────────────────────────────────────────────────────────────────

const PER_PAGE = 5;

const TYPE_META = {
  SALES:     { label: 'Sales',     icon: BarChart2,  color: 'text-blue-600',    bg: 'bg-blue-50'    },
  INVENTORY: { label: 'Inventory', icon: Package,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
  FINANCE:   { label: 'Finance',   icon: DollarSign, color: 'text-amber-600',   bg: 'bg-amber-50'   },
  EMPLOYEE:  { label: 'Employee',  icon: Users,      color: 'text-violet-600',  bg: 'bg-violet-50'  },
  CUSTOMER:  { label: 'Customer',  icon: UserCheck,  color: 'text-rose-600',    bg: 'bg-rose-50'    },
};

const BAR_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

const QUICK_REPORTS = [
  { id: 'sales',     label: 'Sales Report',       desc: 'Detailed daily transactions',   icon: BarChart2,  iconBg: 'bg-blue-100',    iconColor: 'text-blue-600'    },
  { id: 'inventory', label: 'Inventory Report',   desc: 'Stock levels & valuation',      icon: Package,    iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { id: 'finance',   label: 'Financial Summary',  desc: 'Profit & Loss statements',      icon: DollarSign, iconBg: 'bg-violet-100',  iconColor: 'text-violet-600'  },
  { id: 'employee',  label: 'Employee Report',    desc: 'Staff performance & sales',     icon: Users,      iconBg: 'bg-indigo-100',  iconColor: 'text-indigo-600'  },
  { id: 'customer',  label: 'Customer Report',    desc: 'Loyalty, spend & retention',    icon: UserCheck,  iconBg: 'bg-rose-100',    iconColor: 'text-rose-600'    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, iconBg, iconColor, badge, label, value, sub, trend, trendUp }) {
  return (
    <Card className="p-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {badge && (
          <span className={cn('text-xs font-semibold flex items-center gap-1', badge.color)}>
            {badge.dot && <span className={cn('w-1.5 h-1.5 rounded-full inline-block', badge.dotColor || 'bg-emerald-500')} />}
            {badge.label}
          </span>
        )}
        {trend && (
          <span className={cn('text-xs font-bold flex items-center gap-0.5', trendUp ? 'text-emerald-500' : 'text-red-500')}>
            <ArrowUpRight className="w-3.5 h-3.5" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className="text-xl font-bold text-slate-900 leading-tight truncate">{value}</p>
      </div>
      <p className="text-xs text-slate-500">{sub}</p>
    </Card>
  );
}

function StatusPill({ status }) {
  const s = status?.toUpperCase();
  if (s === 'COMPLETED') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Completed
    </span>
  );
  if (s === 'PENDING') return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{status ?? 'Failed'}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BranchManagerReportsPage() {
  const navigate    = useNavigate();
  const [currentPage,   setCurrentPage]   = useState(1);
  const [showPerfModal, setShowPerfModal] = useState(false);

  // ── Data ────────────────────────────────────────────────────────────────────
  const listParams = { page: currentPage, limit: PER_PAGE };

  const { data: listResp, isLoading: listLoading } = useQuery({
    queryKey: REPORT_KEYS.list(listParams),
    queryFn:  () => reportService.getRecentReports(listParams),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const { data: perfResp, isLoading: perfLoading, isError: perfError } = useQuery({
    queryKey: REPORT_KEYS.branchPerformance(),
    queryFn:  reportService.getBranchPerformance,
    staleTime: 30_000,
    retry: 1,
  });

  const reports    = listResp?.data?.reports    ?? [];
  const pagination = listResp?.data?.pagination ?? { total: 0, totalPages: 1 };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const branchData   = perfResp?.data ?? [];
  const maxRev       = branchData[0]?.revenue || 1;
  const TOP_N        = 5;
  const topBranches  = branchData.slice(0, TOP_N);

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
    return [gb.firstName, gb.lastName].filter(Boolean).join(' ') || gb.employeeId || '—';
  }

  function handleViewReport(row) {
    const filters = row.filters || {};
    navigate(`/reports/view/${row.type?.toLowerCase()}`, {
      state: {
        report: row,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        allBranches: filters.allBranches,
        selectedBranchIds: (filters.branches || []).map((b) => b._id || b),
        additionalFilters: filters.additionalFilters,
      },
    });
  }

  const ACCENT_HEX = {
    SALES:'#3B82F6', INVENTORY:'#10B981', FINANCE:'#F59E0B', EMPLOYEE:'#8B5CF6', CUSTOMER:'#F43F5E',
  };

  async function handleDownloadPDF(row) {
    const { default: jsPDF }     = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const accent  = ACCENT_HEX[row.type] || '#3B82F6';
    const typeLbl = TYPE_META[row.type]?.label || row.type;
    const doc     = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageW   = doc.internal.pageSize.getWidth();
    const pageH   = doc.internal.pageSize.getHeight();

    doc.setFillColor(accent);
    doc.rect(0, 0, pageW, 68, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(row.name || `${typeLbl} Report`, 36, 36);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${typeLbl}  ·  Generated: ${formatDate(row.createdAt)} ${formatTime(row.createdAt)}`, 36, 54);

    const printedOn = new Date().toLocaleString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
    doc.text(`Printed: ${printedOn}`, pageW - 36, 54, { align: 'right' });

    const sColor = row.status === 'COMPLETED' ? [16,185,129] : row.status === 'FAILED' ? [239,68,68] : [245,158,11];
    doc.setFillColor(...sColor);
    doc.roundedRect(pageW - 36 - 72, 20, 72, 20, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text((row.status || 'COMPLETED').toUpperCase(), pageW - 36 - 36, 33, { align: 'center' });

    let y = 90;
    const drawSection = (title) => {
      doc.setTextColor(15, 23, 42); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.text(title, 36, y);
      doc.setDrawColor(226, 232, 240); doc.line(36, y + 5, pageW - 36, y + 5);
      y += 18;
    };
    const drawRow = (label, value) => {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(100, 116, 139);
      doc.text(label, 36, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(15, 23, 42);
      doc.text(String(value || '—'), 170, y);
      y += 18;
    };

    drawSection('Report Details');
    drawRow('Report Name',   row.name || '—');
    drawRow('Report Type',   typeLbl);
    drawRow('Generated By',  generatedByName(row.generatedBy));
    drawRow('Generated On',  `${formatDate(row.createdAt)}  ${formatTime(row.createdAt)}`);
    drawRow('Status',        row.status || 'COMPLETED');
    if (row.metadata?.totalRows)       drawRow('Total Rows',     row.metadata.totalRows.toLocaleString());
    if (row.metadata?.executionTimeMs) drawRow('Execution Time', `${row.metadata.executionTimeMs}ms`);
    if (row.metadata?.fileSize)        drawRow('File Size',      row.metadata.fileSize);

    y += 6;
    drawSection('Filters Applied');
    const filters = row.filters || {};
    const df = filters.dateFrom ? formatDate(filters.dateFrom) : null;
    const dt = filters.dateTo   ? formatDate(filters.dateTo)   : null;
    drawRow('Date Range', df && dt ? `${df} – ${dt}` : 'All Time');
    const { label: branchesLabel } = resolveBranchLabel({
      allBranches: filters.allBranches,
      names: namesFromBranchRefs(filters.branches),
      count: (filters.branches || []).length,
    });
    drawRow('Branches', branchesLabel);
    const af = filters.additionalFilters || {};
    if (af.financeSubType)  drawRow('Finance Sub-type', af.financeSubType);
    if (af.stockStatus)     drawRow('Stock Status',     af.stockStatus);
    if (af.roleFilter)      drawRow('Role Filter',      af.roleFilter);
    if (af.customerSegment) drawRow('Customer Segment', af.customerSegment);
    if (af.loyaltyTier)     drawRow('Loyalty Tier',     af.loyaltyTier);

    y += 10;
    doc.setFillColor(239, 246, 255); doc.setDrawColor(147, 197, 253);
    doc.roundedRect(36, y, pageW - 72, 36, 4, 4, 'FD');
    doc.setTextColor(37, 99, 235); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    doc.text('Note:', 46, y + 14);
    doc.setFont('helvetica', 'normal');
    doc.text('Open this report in RetailSync to view the full data table, charts, and detailed analytics.', 46, y + 27);

    doc.setDrawColor(226, 232, 240); doc.line(36, pageH - 28, pageW - 36, pageH - 28);
    doc.setFontSize(7); doc.setFont('helvetica', 'normal'); doc.setTextColor(148, 163, 184);
    doc.text('RetailSync — Confidential Report', 36, pageH - 14);
    doc.text('Page 1 of 1', pageW - 36, pageH - 14, { align: 'right' });

    const fileName = (row.name || typeLbl).replace(/\s+/g, '_');
    doc.save(`${fileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <PageHeader
        title="Reports & Analytics"
        description="Monitor your business performance across all branches"
      />

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          trend="+8.2%"
          trendUp={true}
          label="Total Revenue (Today)"
          value="$12,450.25"
          sub="vs. $11,500 yesterday"
        />
        <KpiCard
          icon={BarChart2}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          trend="+4.5%"
          trendUp={true}
          label="Total Transactions"
          value="1,284"
          sub="Completed checkouts"
        />
        <KpiCard
          icon={Star}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          badge={{ label: 'Trending', color: 'text-violet-600' }}
          label="Top Selling Product"
          value="Premium Espresso Beans"
          sub="452 units sold today"
        />
        <KpiCard
          icon={Building2}
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
          badge={{ label: 'Active', color: 'text-emerald-600', dot: true, dotColor: 'bg-emerald-500' }}
          label="Active Branches"
          value={perfLoading ? '—' : String(branchData.length)}
          sub="Branches currently operational"
        />
      </div>

      {/* ── Branch Performance + Generate a Report ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Branch Performance Ranking */}
        <Card className="lg:col-span-3 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-slate-900">Branch Performance Ranking</h2>
            {branchData.length > TOP_N && (
              <button
                onClick={() => setShowPerfModal(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                View All
              </button>
            )}
          </div>
          <div className="space-y-4">
            {perfLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="h-3.5 bg-slate-100 animate-pulse rounded w-32" />
                    <div className="h-3.5 bg-slate-100 animate-pulse rounded w-14" />
                  </div>
                  <div className="h-2.5 bg-slate-100 animate-pulse rounded-full" />
                </div>
              ))
            ) : perfError ? (
              <p className="text-sm text-red-400 text-center py-8">
                Could not load branch data. Make sure the backend server is running.
              </p>
            ) : branchData.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No active branches found. Run the database seeder to populate branch data.
              </p>
            ) : (
              topBranches.map((branch, i) => (
                <div key={branch._id || branch.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-800">{branch.name}</span>
                    <span className="text-sm font-bold text-slate-900">
                      ${branch.revenue >= 1000 ? `${(branch.revenue / 1000).toFixed(1)}k` : branch.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.round(branch.revenue / maxRev * 100)}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Generate a Report */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Generate a Report</h2>
          <div className="space-y-2">
            {QUICK_REPORTS.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(`/reports/configure/${r.id}`)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-150 group text-left"
                >
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', r.iconBg)}>
                    <Icon className={cn('w-4.5 h-4.5', r.iconColor)} style={{ width: 18, height: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{r.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Recent Reports ── */}
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">Recent Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">Review and download recently generated data exports</p>
        </div>

        <Card className="overflow-hidden">
          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3.5">Report Name</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Generated By</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {listLoading ? (
                  Array.from({ length: PER_PAGE }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3.5 bg-slate-100 animate-pulse rounded w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400 text-sm">
                      No reports yet. Generate your first report above.
                    </td>
                  </tr>
                ) : (
                  reports.map((row, idx) => {
                    const meta = TYPE_META[row.type] ?? TYPE_META.SALES;
                    const Icon = meta.icon;
                    return (
                      <tr key={row._id || idx} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', meta.bg)}>
                              <Icon className={cn('w-4 h-4', meta.color)} />
                            </div>
                            <span className="font-medium text-slate-900">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn('text-sm font-medium', meta.color)}>{meta.label}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {generatedByName(row.generatedBy)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-slate-600">{formatDate(row.createdAt)}</p>
                          <p className="text-xs text-slate-400">{formatTime(row.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusPill status={row.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewReport(row)}
                              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
                              title="View report"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(row)}
                              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, pagination.total)} of {pagination.total} reports
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                      <span key={`el-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm">…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={cn(
                          'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
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
                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Branch Performance Modal ── */}
      <Modal
        isOpen={showPerfModal}
        onClose={() => setShowPerfModal(false)}
        title="Branch Performance Ranking"
        size="lg"
      >
        <div className="space-y-4 py-2">
          {branchData.map((branch, i) => (
            <div key={branch._id || branch.name}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 w-5 text-right">#{i + 1}</span>
                  <span className="text-sm font-semibold text-slate-800">{branch.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{branch.reportCount} reports</span>
                  <span className="text-sm font-bold text-slate-900 w-16 text-right">
                    ${branch.revenue >= 1000 ? `${(branch.revenue / 1000).toFixed(1)}k` : branch.revenue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.round(branch.revenue / maxRev * 100)}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}
                />
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
