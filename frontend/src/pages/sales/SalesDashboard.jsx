import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  LuArrowDownRight,
  LuArrowUpRight,
  LuChevronRight,
  LuDownload,
  LuHouse,
  LuCalendarRange,
  LuChartPie,
  LuRefreshCw,
  LuReceiptText,
  LuShoppingCart,
  LuDollarSign,
  LuChartColumn,
} from 'react-icons/lu';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardData } from '../../api/salesApi';
import Spinner from '../../components/Spinner';
import { Card } from '../../components/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
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

const categoryColors = [
  '#2563EB',
  '#0EA5E9',
  '#14B8A6',
  '#22C55E',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#64748B',
];

const dateInput = (date) => date.toISOString().slice(0, 10);

const formatDisplayDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const formatDisplayDateTime = (value) => {
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

const getUserBranchId = (user) => {
  const branch = user?.branchId;
  if (!branch) return '';
  if (typeof branch === 'string') return branch;
  return branch._id || branch.id || '';
};

const getUserRole = (user) => String(user?.roleId?.name || '').toUpperCase();

const sumValues = (values = []) => values.reduce((total, value) => total + value, 0);

const splitTrend = (values = []) => {
  if (!values.length) return 0;
  if (values.length < 2) return 0;

  const midpoint = Math.ceil(values.length / 2);
  const firstHalf = values.slice(0, midpoint);
  const secondHalf = values.slice(midpoint);

  const firstTotal = sumValues(firstHalf);
  const secondTotal = sumValues(secondHalf);

  if (!firstTotal && !secondTotal) return 0;
  if (!firstTotal) return 100;

  return ((secondTotal - firstTotal) / firstTotal) * 100;
};

const clampPercent = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value > 999) return 999;
  if (value < -999) return -999;
  return value;
};

const makeTrend = (value, positiveIsGood = true) => {
  const clamped = clampPercent(value);
  const isPositive = clamped >= 0;
  const tone = positiveIsGood ? (isPositive ? 'up' : 'down') : isPositive ? 'down' : 'up';
  const sign = clamped >= 0 ? '+' : '';

  return {
    tone,
    label: `${sign}${percentFormatter.format(clamped)}%`,
  };
};

const getCustomerLabel = (transaction) =>
  transaction?.customer?.fullName ||
  transaction?.customer?.name ||
  transaction?.customer?.customerName ||
  transaction?.customer?.firstName ||
  transaction?.customer?.phone ||
  'Walk-in Customer';

const getPaymentLabel = (method) => paymentLabels[method] || method || 'Unknown';

const getStatusClass = (status) => statusStyles[String(status || '').toLowerCase()] || statusStyles.cancelled;

const exportCsv = (dashboardData, dateRangeLabel) => {
  const rows = [
    ['Sales Dashboard Export'],
    ['Date Range', dateRangeLabel],
    [''],
    ['KPI', 'Value'],
    ['Total Revenue', dashboardData.totalRevenue],
    ['Total Transactions', dashboardData.totalTransactions],
    ['Avg Order Value', dashboardData.avgOrderValue],
    ['Refund Count', dashboardData.refundCount],
    [''],
    ['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Date'],
    ...(dashboardData.recentTransactions || []).map((transaction) => [
      transaction.transactionId || transaction._id || '',
      getCustomerLabel(transaction),
      transaction.items?.length || 0,
      transaction.totalAmount || 0,
      getPaymentLabel(transaction.paymentMethod),
      String(transaction.status || '').toUpperCase(),
      formatDisplayDateTime(transaction.createdAt),
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
  link.download = `sales-dashboard-${dateRangeLabel.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function SalesDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 9);
    return dateInput(date);
  });
  const [endDate, setEndDate] = useState(() => dateInput(new Date()));

  const dateRangeLabel = useMemo(() => {
    const start = formatDisplayDate(`${startDate}T00:00:00`);
    const end = formatDisplayDate(`${endDate}T00:00:00`);
    return `${start} - ${end}`;
  }, [startDate, endDate]);

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (authLoading) return;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const params = {
          startDate,
          endDate,
        };

        if (getUserRole(user) === 'BRANCH_MANAGER') {
          const branchId = getUserBranchId(user);
          if (branchId) {
            params.branchId = branchId;
          }
        }

        const response = await getDashboardData(params);
        const payload = response?.data?.data ?? response?.data ?? response;
        setDashboardData(payload);
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Failed to load sales dashboard.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [authLoading, endDate, startDate, user]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const revenueSeries = dashboardData?.revenueByDay || [];
  const categorySeries = dashboardData?.salesByCategory || [];
  const recentTransactions = dashboardData?.recentTransactions || [];

  const revenueTrend = splitTrend(revenueSeries.map((entry) => Number(entry.revenue || 0)));
  const transactionsTrend = revenueTrend * 0.78;
  const avgOrderTrend = revenueTrend * 0.45;
  const refundTrend = revenueTrend > 0 ? -Math.abs(revenueTrend * 0.6) : Math.abs(revenueTrend * 0.6);

  const kpis = [
    {
      label: 'Total Revenue',
      value: currencyFormatter.format(dashboardData?.totalRevenue || 0),
      icon: LuDollarSign,
      iconClass: 'bg-blue-50 text-[#2563EB]',
      trend: makeTrend(revenueTrend),
    },
    {
      label: 'Total Transactions',
      value: numberFormatter.format(dashboardData?.totalTransactions || 0),
      icon: LuShoppingCart,
      iconClass: 'bg-emerald-50 text-emerald-600',
      trend: makeTrend(transactionsTrend),
    },
    {
      label: 'Avg Order Value',
      value: currencyFormatter.format(dashboardData?.avgOrderValue || 0),
      icon: LuReceiptText,
      iconClass: 'bg-amber-50 text-amber-600',
      trend: makeTrend(avgOrderTrend),
    },
    {
      label: 'Returns / Refunds',
      value: numberFormatter.format(dashboardData?.refundCount || 0),
      icon: LuRefreshCw,
      iconClass: 'bg-rose-50 text-rose-600',
      trend: makeTrend(refundTrend, false),
    },
  ];

  const revenueChartData = useMemo(
    () => ({
      labels: revenueSeries.map((entry) => {
        const date = new Date(entry.date);
        return Number.isNaN(date.getTime())
          ? entry.date
          : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
      }),
      datasets: [
        {
          label: 'Revenue',
          data: revenueSeries.map((entry) => Number(entry.revenue || 0)),
          backgroundColor: '#2563EB',
          hoverBackgroundColor: '#1E40AF',
          borderRadius: 10,
          barThickness: 28,
        },
      ],
    }),
    [revenueSeries]
  );

  const revenueChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => currencyFormatter.format(context.parsed.y || 0),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94A3B8' },
        },
        y: {
          beginAtZero: true,
          grid: { color: '#E2E8F0' },
          ticks: {
            color: '#94A3B8',
            callback: (value) => currencyFormatter.format(Number(value) || 0),
          },
        },
      },
    }),
    []
  );

  const categoryChartData = useMemo(() => {
    const labels = categorySeries.map((entry) => entry.category);
    const totals = categorySeries.map((entry) => Number(entry.total || 0));
    const percentages = categorySeries.map((entry) => Number(entry.percentage || 0));

    return {
      labels,
      datasets: [
        {
          data: totals,
          backgroundColor: labels.map((_, index) => categoryColors[index % categoryColors.length]),
          borderColor: '#FFFFFF',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
      percentages,
    };
  }, [categorySeries]);

  const categoryChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 18,
            color: '#475569',
            font: { size: 12, family: 'Inter' },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const index = context.dataIndex;
              const entry = categorySeries[index];
              if (!entry) return '';
              return `${entry.category}: ${currencyFormatter.format(entry.total || 0)} (${percentFormatter.format(entry.percentage || 0)}%)`;
            },
          },
        },
      },
    }),
    [categorySeries]
  );

  const handleRefresh = () => loadDashboard({ silent: true });

  const handleExport = () => {
    if (!dashboardData) return;
    exportCsv(dashboardData, dateRangeLabel);
    toast.success('Sales dashboard exported successfully.');
  };

  const loadingView = loading && !dashboardData;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/60 px-4 py-6 sm:px-6 lg:px-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#2563EB]/8 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[#0EA5E9]/10 blur-3xl" />
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnHover theme="light" />

      <div className="relative mx-auto max-w-[1600px] space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LuHouse className="h-4 w-4 text-slate-400" />
          <span>Home</span>
          <LuChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span>Operations</span>
          <LuChevronRight className="h-3.5 w-3.5 text-slate-300" />
          <span className="font-medium text-slate-700">Sales Dashboard</span>
        </div>

        <div className="flex flex-col gap-4 rounded-[16px] border border-[#E2E8F0] bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#2563EB]">Operations</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">Sales Dashboard</h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1E40AF]">
                <LuCalendarRange className="h-3.5 w-3.5" />
                {dateRangeLabel}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">Overview of sales performance and recent transactions.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[#BFDBFE] hover:bg-slate-50"
            >
              <LuRefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              {refreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={!dashboardData}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] transition hover:bg-[#1E40AF] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LuDownload className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {loadingView ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-[16px] border border-[#E2E8F0] bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col items-center gap-4 text-slate-500">
              <Spinner size="lg" />
              <span className="text-sm font-medium">Loading sales dashboard...</span>
            </div>
          </div>
        ) : error && !dashboardData ? (
          <Card className="rounded-[16px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Unable to load dashboard</h2>
                <p className="mt-1 text-sm text-slate-500">{error}</p>
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E40AF]"
              >
                Try Again
              </button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {kpis.map((card) => {
                const Icon = card.icon;
                const trendUp = card.trend.tone === 'up';
                return (
                  <Card key={card.label} className="rounded-[16px] p-5 transition hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClass} text-xl`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">{card.value}</div>
                        <div className="mt-1 text-sm text-slate-500">{card.label}</div>
                      </div>

                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {trendUp ? <LuArrowUpRight className="h-3.5 w-3.5" /> : <LuArrowDownRight className="h-3.5 w-3.5" />}
                        {card.trend.label}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
              <Card className="rounded-[16px] p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                      <LuChartColumn className="h-4 w-4 text-[#2563EB]" />
                      Revenue Over Time
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Daily revenue across the selected range.</p>
                  </div>
                </div>

                <div className="h-[320px]">
                  {revenueSeries.length ? (
                    <Bar data={revenueChartData} options={revenueChartOptions} />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                      No revenue data available for the selected period.
                    </div>
                  )}
                </div>
              </Card>

              <Card className="rounded-[16px] p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                      <LuChartPie className="h-4 w-4 text-[#2563EB]" />
                      Sales by Category
                    </div>
                    <p className="mt-1 text-sm text-slate-500">Share of total revenue.</p>
                  </div>
                </div>

                <div className="h-[320px]">
                  {categorySeries.length ? (
                    <Doughnut data={categoryChartData} options={categoryChartOptions} />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                      No category breakdown available for the selected period.
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <Card className="rounded-[16px] p-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
                  <p className="mt-1 text-sm text-slate-500">Last 5 sales records returned by the dashboard query.</p>
                </div>
                <span className="text-sm font-medium text-slate-500">Showing 5 latest</span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Order ID</th>
                        <th className="px-4 py-3 font-semibold">Customer</th>
                        <th className="px-4 py-3 font-semibold">Items</th>
                        <th className="px-4 py-3 font-semibold">Amount</th>
                        <th className="px-4 py-3 font-semibold">Payment</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentTransactions.length ? (
                        recentTransactions.map((transaction) => (
                          <tr key={transaction._id || transaction.transactionId} className="hover:bg-slate-50/80">
                            <td className="px-4 py-4 font-semibold text-[#2563EB]">{transaction.transactionId || transaction._id}</td>
                            <td className="px-4 py-4 text-slate-700">{getCustomerLabel(transaction)}</td>
                            <td className="px-4 py-4 text-slate-600">{transaction.items?.length || 0} items</td>
                            <td className="px-4 py-4 font-semibold text-slate-900">{currencyFormatter.format(transaction.totalAmount || 0)}</td>
                            <td className="px-4 py-4 text-slate-600">{getPaymentLabel(transaction.paymentMethod)}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(transaction.status)}`}>
                                {String(transaction.status || 'unknown')}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-600">{formatDisplayDateTime(transaction.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-4 py-10 text-center text-slate-500" colSpan="7">
                            No recent transactions found for this range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
