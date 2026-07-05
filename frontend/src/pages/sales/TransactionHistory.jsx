import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LuCalendarRange,
  LuChevronLeft,
  LuChevronRight,
  LuDollarSign,
  LuDownload,
  LuEye,
  LuFilter,
  LuHouse,
  LuSearch,
  LuShoppingCart,
  LuRefreshCw,
  LuChevronRight as LuBreadcrumbChevron,
  LuBadgeCheck,
  LuBadgeAlert,
} from 'react-icons/lu';
import { getTransactions } from '../../api/salesApi';
import Spinner from '../../components/Spinner';
import { Card } from '../../components/Card';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const paymentLabels = {
  cash: 'Cash',
  card: 'Card',
  qr_pay: 'QR Pay',
  bank_transfer: 'Bank Transfer',
};

const statusStyles = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  refunded: 'bg-rose-50 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
};

const statCards = [
  {
    label: 'Total Transactions',
    icon: LuShoppingCart,
    iconClass: 'bg-blue-50 text-[#2563EB]',
  },
  {
    label: 'Total Revenue',
    icon: LuDollarSign,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Completed',
    icon: LuBadgeCheck,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    label: 'Refunded',
    icon: LuBadgeAlert,
    iconClass: 'bg-rose-50 text-rose-600',
  },
];

const initialFilters = {
  search: '',
  status: '',
  paymentMethod: '',
};

const paymentOptions = [
  { value: '', label: 'All Payment' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'qr_pay', label: 'QR Pay' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'cancelled', label: 'Cancelled' },
];

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const getName = (person, fallback = '-') => {
  if (!person) return fallback;
  return (
    person.name ||
    person.fullName ||
    [person.firstName, person.lastName].filter(Boolean).join(' ').trim() ||
    person.username ||
    fallback
  );
};

const getInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return 'RS';
  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
};

const getStatusClass = (status) => statusStyles[String(status || '').toLowerCase()] || statusStyles.cancelled;

const formatPageRange = (pagination) => {
  const { currentPage = 1, totalRecords = 0, limit = 10 } = pagination || {};
  if (!totalRecords) return 'Showing 0 of 0 records';

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalRecords);
  return `Showing ${start}-${end} of ${totalRecords} records`;
};

const buildPageNumbers = (currentPage, totalPages) => {
  if (!totalPages) return [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push('ellipsis-start');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push('ellipsis-end');
  pages.push(totalPages);

  return pages;
};

const exportCsv = (transactions) => {
  const rows = [
    ['Order ID', 'Customer', 'Cashier', 'Items', 'Subtotal', 'Discount', 'Total', 'Payment', 'Status', 'Date & Time'],
    ...transactions.map((transaction) => [
      transaction.transactionId || transaction._id || '',
      getName(transaction.customer, 'Walk-in Customer'),
      getName(transaction.cashier, '-'),
      transaction.items?.length || 0,
      transaction.subtotal || 0,
      transaction.discountTotal || 0,
      transaction.totalAmount || 0,
      paymentLabels[transaction.paymentMethod] || transaction.paymentMethod || '-',
      String(transaction.status || '').toUpperCase(),
      formatDateTime(transaction.createdAt),
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? '');
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transaction-history.csv';
  link.click();
  URL.revokeObjectURL(url);
};

export default function TransactionHistory() {
  const navigate = useNavigate();
  const filterRef = useRef(null);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 0, totalRecords: 0, limit: 10 });
  const [summary, setSummary] = useState({ totalTransactions: 0, totalRevenue: 0, completedCount: 0, refundedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getTransactions({
        page,
        limit,
        search: appliedFilters.search.trim(),
        status: appliedFilters.status,
        paymentMethod: appliedFilters.paymentMethod,
      });

      const payload = response?.data?.data ?? response?.data ?? response;
      setTransactions(payload.transactions || []);
      setPagination(payload.pagination || { currentPage: page, totalPages: 0, totalRecords: 0, limit });
      setSummary(payload.summary || {
        totalTransactions: payload.pagination?.totalRecords || 0,
        totalRevenue: 0,
        completedCount: 0,
        refundedCount: 0,
      });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load transaction history.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters.paymentMethod, appliedFilters.search, appliedFilters.status, limit, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...draftFilters });
  };

  const handleExport = () => {
    exportCsv(transactions);
    toast.success('Transaction history exported successfully.');
  };

  const handleReset = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  };

  const pageNumbers = useMemo(
    () => buildPageNumbers(pagination.currentPage, pagination.totalPages),
    [pagination.currentPage, pagination.totalPages]
  );

  const recordCountSubtitle = useMemo(
    () => `${pagination.totalRecords || 0} records found`,
    [pagination.totalRecords]
  );

  const statValues = useMemo(
    () => [
      pagination.totalRecords || summary.totalTransactions || 0,
      summary.totalRevenue || 0,
      summary.completedCount || 0,
      summary.refundedCount || 0,
    ],
    [pagination.totalRecords, summary.completedCount, summary.refundedCount, summary.totalRevenue, summary.totalTransactions]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60 px-4 py-6 sm:px-6 lg:px-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover theme="light" />

      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LuHouse className="h-4 w-4 text-slate-400" />
          <span>Home</span>
          <LuBreadcrumbChevron className="h-3.5 w-3.5 text-slate-300" />
          <span>Sales</span>
          <LuBreadcrumbChevron className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-700">Transaction History</span>
        </div>

        <div className="flex flex-col gap-4 rounded-[16px] border border-[#E2E8F0] bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#2563EB]">Sales</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">Transaction History</h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1E40AF]">
                <LuCalendarRange className="h-3.5 w-3.5" />
                {recordCountSubtitle}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">All sales transactions and activity records.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#BFDBFE] hover:bg-slate-50"
            >
              <LuFilter className="h-4 w-4" />
              Filters
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] transition hover:bg-[#1E40AF]"
            >
              <LuDownload className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const value = index === 1 ? currencyFormatter.format(statValues[index] || 0) : statValues[index] || 0;

            return (
              <Card key={card.label} className="rounded-[16px] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass} text-xl`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                      {value}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">{card.label}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-[16px] p-5">
          <form ref={filterRef} onSubmit={handleSearch} className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1.6fr_0.7fr_0.7fr_auto]">
              <label className="flex items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                <LuSearch className="h-4 w-4 text-slate-400" />
                <input
                  value={draftFilters.search}
                  onChange={(event) => setDraftFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Search by Order ID or customer..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
              </label>

              <select
                value={draftFilters.status}
                onChange={(event) => setDraftFilters((current) => ({ ...current, status: event.target.value }))}
                className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)] outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value || option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={draftFilters.paymentMethod}
                onChange={(event) => setDraftFilters((current) => ({ ...current, paymentMethod: event.target.value }))}
                className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)] outline-none"
              >
                {paymentOptions.map((option) => (
                  <option key={option.value || option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] transition hover:bg-[#1E40AF]"
              >
                <LuSearch className="h-4 w-4" />
                Search
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700"
              >
                <LuRefreshCw className="h-4 w-4" />
                Reset filters
              </button>
              <div className="text-sm text-slate-500">
                {loading ? 'Loading transactions...' : 'Filters apply to the current page and totals.'}
              </div>
            </div>
          </form>
        </Card>

        {loading ? (
          <Card className="flex min-h-[360px] items-center justify-center rounded-[16px] p-6">
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <Spinner size="lg" />
              <span className="text-sm font-medium">Loading transaction history...</span>
            </div>
          </Card>
        ) : error ? (
          <Card className="rounded-[16px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Unable to load transactions</h2>
                <p className="mt-1 text-sm text-slate-500">{error}</p>
              </div>
              <button
                type="button"
                onClick={fetchTransactions}
                className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E40AF]"
              >
                Try Again
              </button>
            </div>
          </Card>
        ) : (
          <Card className="rounded-[16px] p-0 overflow-hidden">
            <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        <input type="checkbox" className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
                      </th>
                      <th className="px-4 py-3 font-semibold">Order ID</th>
                      <th className="px-4 py-3 font-semibold">Customer</th>
                      <th className="px-4 py-3 font-semibold">Cashier</th>
                      <th className="px-4 py-3 font-semibold">Items</th>
                      <th className="px-4 py-3 font-semibold">Subtotal</th>
                      <th className="px-4 py-3 font-semibold">Discount</th>
                      <th className="px-4 py-3 font-semibold">Total</th>
                      <th className="px-4 py-3 font-semibold">Payment</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Date & Time</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.length ? (
                      transactions.map((transaction) => {
                        const orderId = transaction.transactionId || transaction._id;
                        const customerName = getName(transaction.customer, 'Walk-in Customer');
                        const cashierName = getName(transaction.cashier, '-');
                        const branchName = getName(transaction.branch, '');
                        const itemsCount = transaction.items?.length || 0;

                        return (
                          <tr key={transaction._id || orderId} className="transition hover:bg-[#EFF6FF]">
                            <td className="px-4 py-4">
                              <input type="checkbox" className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
                            </td>
                            <td className="px-4 py-4 font-semibold text-[#2563EB]">
                              <button type="button" onClick={() => navigate(`/sales/${transaction._id || orderId}`)} className="hover:underline">
                                {orderId}
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-xs font-bold text-[#1E40AF]">
                                  {getInitials(customerName)}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800">{customerName}</div>
                                  {branchName ? <div className="text-xs text-slate-400">{branchName}</div> : null}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-slate-700">{cashierName}</td>
                            <td className="px-4 py-4 text-slate-600">{itemsCount}</td>
                            <td className="px-4 py-4 text-slate-700">{currencyFormatter.format(transaction.subtotal || 0)}</td>
                            <td className="px-4 py-4 text-emerald-600">{currencyFormatter.format(transaction.discountTotal || 0)}</td>
                            <td className="px-4 py-4 font-semibold text-slate-900">{currencyFormatter.format(transaction.totalAmount || 0)}</td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                {paymentLabels[transaction.paymentMethod] || transaction.paymentMethod || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(transaction.status)}`}>
                                {transaction.status || 'unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">{formatDateTime(transaction.createdAt)}</td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => navigate(`/sales-history/${transaction._id || orderId}`)}
                                className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#BFDBFE] hover:bg-slate-50"
                              >
                                <LuEye className="h-4 w-4" />
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td className="px-4 py-12 text-center text-slate-500" colSpan="12">
                          No transactions found for the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500">{formatPageRange(pagination)}</div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-slate-500 transition hover:border-[#BFDBFE] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <LuChevronLeft className="h-4 w-4" />
                </button>

                {pageNumbers.map((item) =>
                  typeof item === 'number' ? (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                        item === pagination.currentPage
                          ? 'bg-[#2563EB] text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)]'
                          : 'border border-[#E2E8F0] bg-white text-slate-600 hover:border-[#BFDBFE] hover:text-[#2563EB]'
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={item} className="px-2 text-slate-400">
                      ...
                    </span>
                  )
                )}

                <button
                  type="button"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages || current + 1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-slate-500 transition hover:border-[#BFDBFE] hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <LuChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
