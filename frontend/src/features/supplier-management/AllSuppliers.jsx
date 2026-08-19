import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, Plus, Star, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import { toast } from 'react-toastify';
import { getSuppliers, getSupplierStats, updateSupplierStatus } from '../../services/supplierService';

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, iconBg, value, label }) => (
  <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] px-6 py-5 flex-1 min-w-[160px]">
    <div className={cn('p-2.5 rounded-xl', iconBg)}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-red-50 text-red-700 border-red-200',
    Pending:  'bg-amber-50 text-amber-700 border-amber-200',
  };
  const dot = {
    Active:   'bg-emerald-500',
    Inactive: 'bg-red-500',
    Pending:  'bg-amber-500',
  };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200')}>
      <span className={cn('w-1.5 h-1.5 rounded-full', dot[status] ?? 'bg-slate-400')} />
      {status}
    </span>
  );
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ value }) => (
  <span className="flex items-center gap-1 text-sm font-semibold text-slate-800">
    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
    {value.toFixed(1)}
  </span>
);

const ITEMS_PER_PAGE = 6;

// ─── All Suppliers Page ───────────────────────────────────────────────────────
const AllSuppliers = ({ onAddSupplier, onViewProfile, onEditSupplier }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, totalSpendYTD: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes] = await Promise.all([
        getSuppliers({ search, status: statusFilter, category: categoryFilter, page, limit: ITEMS_PER_PAGE }),
        getSupplierStats(),
      ]);
      setSuppliers(listRes.suppliers ?? []);
      setTotalPages(listRes.totalPages ?? 1);
      setStats(statsRes.data ?? { total: 0, active: 0, pending: 0, totalSpendYTD: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const handleExport = () => {
    if (suppliers.length === 0) {
      toast.warn('No suppliers to export');
      return;
    }
    const headers = ['Supplier Name', 'ID', 'Category', 'Contact Name', 'Email', 'Phone', 'Rating', 'Status'];
    const rows = suppliers.map(s => [
      `"${s.name || ''}"`,
      `"${s.supplierId || ''}"`,
      `"${s.industryCategory || ''}"`,
      `"${s.contacts?.[0]?.name || ''}"`,
      `"${s.contacts?.[0]?.email || ''}"`,
      `"${s.contacts?.[0]?.phone || ''}"`,
      s.rating || 0,
      `"${s.status || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `suppliers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export downloaded successfully');
  };

  const paginated = suppliers;
  const activeCount = stats.active;
  const pendingCount = stats.pending;
  const totalSpend = stats.totalSpendYTD
    ? `$${(stats.totalSpendYTD / 1_000_000).toFixed(1)}M`
    : '$0';

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <button onClick={fetchData} className="text-sm text-blue-600 hover:underline font-medium">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{stats.total} suppliers registered across all categories</p>
        </div>
        <button
          onClick={onAddSupplier}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors duration-150"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Stat Cards */}
      <div className="flex gap-4 flex-wrap">
        <StatCard
          icon={() => <Building2 className="w-5 h-5 text-slate-500" />}
          iconBg="bg-slate-100"
          value={loading ? '—' : stats.total}
          label="Total Suppliers"
        />
        <StatCard
          icon={() => <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>}
          iconBg="bg-emerald-50"
          value={loading ? '—' : activeCount}
          label="Active"
        />
        <StatCard
          icon={() => <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          iconBg="bg-amber-50"
          value={loading ? '—' : pendingCount}
          label="Pending Review"
        />
        <StatCard
          icon={() => <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          iconBg="bg-blue-50"
          value={loading ? '—' : totalSpend}
          label="Total Spend YTD"
        />
      </div>

      {/* Search + Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex items-center min-w-[240px]">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search suppliers..."
              className="pl-9 pr-4 py-2 w-full text-sm bg-white text-slate-900 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center gap-2 text-sm font-medium text-slate-600 border px-3.5 py-2 rounded-xl transition-colors",
                showFilters ? "bg-slate-100 border-slate-300" : "bg-white hover:bg-slate-50 border-slate-300 hover:text-slate-900"
              )}
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white text-slate-900 rounded-lg border border-slate-300 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="">All Categories</option>
                <option value="Raw Materials">Raw Materials</option>
                <option value="Electronics">Electronics</option>
                <option value="Packaging">Packaging</option>
                <option value="Perishables">Perishables</option>
                <option value="Components">Components</option>
                <option value="Chemicals">Chemicals</option>
                <option value="Textiles">Textiles</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {(statusFilter || categoryFilter) && (
              <div className="flex items-end h-full">
                <button
                  onClick={() => { setStatusFilter(''); setCategoryFilter(''); }}
                  className="mt-6 text-sm text-slate-500 hover:text-slate-800 font-medium hover:underline transition-colors px-2"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {/* BUG-02: Added Actions column */}
              {['Supplier', 'ID', 'Category', 'Contact', 'Phone', 'Rating', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center text-slate-400 text-sm animate-pulse">
                  Loading suppliers...
                </td>
              </tr>
            ) : paginated.length > 0 ? paginated.map(s => (
              <tr
                key={s._id}
                onClick={() => onViewProfile(s)}
                className="hover:bg-blue-50/40 cursor-pointer transition-colors duration-150 group"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.industryCategory}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{s.supplierId}</span>
                </td>
                <td className="px-5 py-4 text-slate-600">{s.industryCategory}</td>
                <td className="px-5 py-4">
                  {s.contacts?.[0] ? (
                    <>
                      <p className="font-medium text-slate-800">{s.contacts[0].name}</p>
                      <p className="text-xs text-slate-400">{s.contacts[0].email}</p>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{s.contacts?.[0]?.phone ?? '—'}</td>
                <td className="px-5 py-4"><StarRating value={s.rating ?? 0} /></td>
                <td className="px-5 py-4"><StatusBadge status={s.status} /></td>
                {/* BUG-02: Edit and Deactivate actions */}
                <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditSupplier?.(s)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    {s.status !== 'Inactive' && (
                      <button
                        onClick={async () => {
                          try {
                            await updateSupplierStatus(s._id, 'Inactive');
                            toast.success(`${s.name} deactivated`);
                            fetchData();
                          } catch (err) {
                            toast.error(err.message || 'Failed to deactivate');
                          }
                        }}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-6 py-14 text-center text-slate-400 text-sm">
                  No suppliers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>Showing {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, stats.total)} of {stats.total} suppliers</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={cn(
                'min-w-[32px] h-8 rounded-lg border text-xs font-semibold transition-colors',
                page === n
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllSuppliers;
