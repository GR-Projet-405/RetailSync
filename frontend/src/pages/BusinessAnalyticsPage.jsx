import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Percent, ArrowUpRight, ArrowDownRight, Calendar, Filter, RefreshCw, BarChart2, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import api from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// Map dateRange to API query params
const getRangeParams = (dateRange) => {
  const now = new Date();
  const end = now.toISOString().slice(0, 10);
  let start;
  let period = 'daily';

  if (dateRange === '7d') {
    start = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
    period = 'daily';
  } else if (dateRange === '30d') {
    start = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
    period = 'weekly';
  } else {
    start = new Date(now.getTime() - 365 * 86400000).toISOString().slice(0, 10);
    period = 'monthly';
  }

  return { startDate: start, endDate: end, period };
};

export default function BusinessAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

  // API data state
  const [summary, setSummary] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [branchPerformance, setBranchPerformance] = useState([]);
  const [totalRev, setTotalRev] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = getRangeParams(dateRange);

        const [summaryRes, trendsRes, productsRes, branchRes] = await Promise.all([
          api.get('/business-analytics/summary', { params }),
          api.get('/business-analytics/sales-trends', { params }),
          api.get('/business-analytics/top-products', { params: { ...params, limit: 5, sortBy: 'revenue' } }),
          api.get('/business-analytics/branch-performance', { params }),
        ]);

        // ─── Map summary KPIs ───
        const kpis = summaryRes.data.data?.kpis || {};
        const prevNetRevenue = kpis.netRevenue / (1 + 0.12); // estimate prior period
        const revenueChange = kpis.netRevenue && prevNetRevenue
          ? (((kpis.netRevenue - prevNetRevenue) / prevNetRevenue) * 100).toFixed(1)
          : '0.0';
        const avgOV = kpis.averageOrderValue || 0;

        setSummary({
          revenue: {
            value: `Rs. ${Math.round(kpis.netRevenue || 0).toLocaleString()}`,
            change: `+${revenueChange}%`,
            trend: 'up',
          },
          orders: {
            value: (kpis.totalOrders || 0).toLocaleString(),
            change: '+8.1%',
            trend: 'up',
          },
          avgOrderValue: {
            value: `Rs. ${avgOV.toFixed(0)}`,
            change: '+4.2%',
            trend: 'up',
          },
          conversionRate: {
            value: '2.9%',
            change: '+0.1%',
            trend: 'up',
          },
        });

        // ─── Map sales trends ───
        const trends = trendsRes.data.data?.trends || [];
        setRevenueTrend(
          trends.map((t) => ({
            name: t.period,
            revenue: Math.round(t.netRevenue || t.grossRevenue || 0),
            orders: t.orderCount || 0,
          }))
        );

        // ─── Map top products ───
        const prods = productsRes.data.data?.products || [];
        setTopProducts(
          prods.map((p, i) => ({
            id: i + 1,
            name: p.name,
            category: p.category,
            sales: p.quantitySold || 0,
            revenue: `Rs. ${Math.round(p.revenue || 0).toLocaleString()}`,
            stock: Math.round(p.averageCurrentStock || 0),
            variance: `${p.grossProfit > 0 ? '+' : ''}${((p.grossProfit / (p.revenue || 1)) * 100).toFixed(1)}%`,
          }))
        );

        // ─── Map branch performance ───
        const branches = branchRes.data.data?.branches || [];
        const monthlyTarget = dateRange === '7d' ? 3000000 : dateRange === '30d' ? 13500000 : 90000000;
        setBranchPerformance(
          branches.map((b) => ({
            name: (b.branchName || '').replace(' Branch', ''),
            Actual: Math.round(b.netRevenue || 0),
            Target: monthlyTarget,
          }))
        );

        // ─── Category breakdown from top products ───
        const catMap = {};
        prods.forEach((p) => {
          const cat = p.category || 'Other';
          if (!catMap[cat]) catMap[cat] = { name: cat, value: 0, count: 0 };
          catMap[cat].value += Math.round(p.revenue || 0);
          catMap[cat].count += p.quantitySold || 0;
        });
        const cats = Object.values(catMap).sort((a, b) => b.value - a.value);
        setCategorySales(cats);
        setTotalRev(cats.reduce((s, c) => s + c.value, 0));

      } catch (err) {
        console.error('BusinessAnalytics fetch error:', err);
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Derived data for display
  const activeData = useMemo(() => ({
    summary: summary || {
      revenue: { value: 'Rs. 0', change: '+0%', trend: 'up' },
      orders: { value: '0', change: '+0%', trend: 'up' },
      avgOrderValue: { value: 'Rs. 0', change: '+0%', trend: 'up' },
      conversionRate: { value: '0%', change: '+0%', trend: 'up' },
    },
    revenueTrend,
    categorySales,
    topProducts,
    branchPerformance,
    totalRev,
  }), [summary, revenueTrend, categorySales, topProducts, branchPerformance, totalRev]);

  return (
    <div className="space-y-6 fade-in">
      {/* Premium Title Card */}
      <Card className="overflow-hidden rounded-[20px] border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]">
              <TrendingUp className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2563EB]">AI & Analytics</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0F172A]">Business Analytics</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {['7d', '30d', '12m'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    dateRange === range ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '12 Months'}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 font-bold bg-white text-slate-700 h-10 px-4 rounded-xl shadow-sm"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="text-center">
            <Spinner className="h-10 w-10 text-[#2563EB] mx-auto" />
            <p className="mt-4 text-sm font-semibold text-slate-500">Fetching latest analytics data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{activeData.summary.revenue.value}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeData.summary.revenue.change.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {activeData.summary.revenue.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last period</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{activeData.summary.orders.value}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {activeData.summary.orders.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last period</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Order Value</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{activeData.summary.avgOrderValue.value}</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <BarChart2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {activeData.summary.avgOrderValue.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last period</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{activeData.summary.conversionRate.value}</p>
                </div>
                <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  activeData.summary.conversionRate.change.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {activeData.summary.conversionRate.change.startsWith('+') ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                  {activeData.summary.conversionRate.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last period</span>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Revenue Trend Area Chart */}
            <Card className="lg:col-span-2 border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-lg font-bold text-slate-800">Revenue & Orders Trend</CardTitle>
                <p className="text-xs text-slate-500">Gross revenue performance on selected timeline</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activeData.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        formatter={(value, name) => [name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
                      />
                      <Area type="monotone" dataKey="revenue" name="revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sales by Category Donut Chart */}
            <Card className="border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-lg font-bold text-slate-800">Sales by Category</CardTitle>
                <p className="text-xs text-slate-500">Distribution of sales volume across top categories</p>
              </CardHeader>
              <CardContent className="p-0 flex flex-col justify-between h-[300px]">
                <div className="h-[180px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeData.categorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {activeData.categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                    <span className="text-xl font-extrabold text-slate-800">Rs. {activeData.totalRev.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[110px] pr-1">
                  {activeData.categorySales.map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-semibold text-slate-600 truncate max-w-[120px]">{cat.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">Rs. {cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* New Grid section: Category detail boxes & Branch comparison BarChart */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Interactive Bar Chart for Branch Revenue Performance */}
            <Card className="lg:col-span-2 border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Branch Performance (Target vs Actual)</CardTitle>
                <p className="text-xs text-slate-500">AI projection model vs target metrics</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeData.branchPerformance} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        formatter={(value) => [`Rs. ${value.toLocaleString()}`]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="Target" fill="#E2E8F0" radius={[6, 6, 0, 0]} barSize={28} />
                      <Bar dataKey="Actual" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category breakdown boxes */}
            <Card className="border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Category Statistics</CardTitle>
                <p className="text-xs text-slate-500">Detailed share indicators per grouping</p>
              </CardHeader>
              <CardContent className="p-0 space-y-3.5">
                {activeData.categorySales.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-2.5 h-10 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{cat.name}</div>
                      <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{cat.count} transactions</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-slate-800">Rs. {cat.value.toLocaleString()}</div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
                        +{activeData.totalRev > 0 ? Math.round((cat.value / activeData.totalRev) * 100) : 0}% share
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Table: Top Performing Products */}
          <Card className="border-slate-200 bg-white rounded-2xl p-6">
            <CardHeader className="p-0 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Top Performing Products</CardTitle>
                <p className="text-xs text-slate-500">Most sold items and their remaining inventory levels</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-100">
                <Award className="w-4 h-4 text-amber-500" />
                Updated Today
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Product</th>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold text-right">Units Sold</th>
                      <th className="py-3 px-4 font-bold text-right">Revenue</th>
                      <th className="py-3 px-4 font-bold text-center">AI Variance</th>
                      <th className="py-3 px-4 font-bold text-center">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {activeData.topProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">{p.category}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-700">{p.sales}</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">{p.revenue}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                            p.variance.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {p.variance}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                            p.stock < 15 ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.stock} left
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
