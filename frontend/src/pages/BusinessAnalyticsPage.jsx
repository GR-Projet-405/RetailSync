import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Percent, ArrowUpRight, ArrowDownRight, Calendar, Filter, RefreshCw, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

// Mock Analytics Data
const ANALYTICS_DATA = {
  summary: {
    revenue: { value: '$124,580.00', change: '+12.3%', trend: 'up' },
    orders: { value: '3,842', change: '+8.1%', trend: 'up' },
    avgOrderValue: { value: '$32.42', change: '+4.2%', trend: 'up' },
    conversionRate: { value: '2.8%', change: '-0.5%', trend: 'down' }
  },
  revenueTrend: [
    { name: 'Jan', revenue: 45000, orders: 1200 },
    { name: 'Feb', revenue: 52000, orders: 1400 },
    { name: 'Mar', revenue: 49000, orders: 1350 },
    { name: 'Apr', revenue: 63000, orders: 1800 },
    { name: 'May', revenue: 58000, orders: 1650 },
    { name: 'Jun', revenue: 71000, orders: 2100 },
    { name: 'Jul', revenue: 84000, orders: 2500 }
  ],
  categorySales: [
    { name: 'Beverages', value: 38400 },
    { name: 'Snacks & Sweets', value: 28800 },
    { name: 'Bakery Items', value: 22100 },
    { name: 'Fresh Produce', value: 18500 },
    { name: 'Dairy & Eggs', value: 16780 }
  ],
  topProducts: [
    { id: 1, name: 'Espresso Blend Coffee', category: 'Beverages', sales: 1250, revenue: '$6,250.00', stock: 45 },
    { id: 2, name: 'Whole Wheat Bread', category: 'Bakery Items', sales: 980, revenue: '$3,430.00', stock: 12 },
    { id: 3, name: 'Organic Bananas (kg)', category: 'Fresh Produce', sales: 850, revenue: '$2,550.00', stock: 120 },
    { id: 4, name: 'Greek Yogurt (500g)', category: 'Dairy & Eggs', sales: 740, revenue: '$2,960.00', stock: 64 },
    { id: 5, name: 'Chocolate Chip Cookie', category: 'Bakery Items', sales: 690, revenue: '$1,380.00', stock: 8 }
  ],
  branchPerformance: [
    { name: 'Downtown Branch', revenue: 52400, target: 50000, color: '#2563EB' },
    { name: 'Suburban Mall', revenue: 41200, target: 45000, color: '#10B981' },
    { name: 'Metro Terminal', revenue: 30980, target: 28000, color: '#F59E0B' }
  ]
};

export default function BusinessAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [dateRange, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Premium Gradient Title Card */}
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
              <button
                onClick={() => setDateRange('7d')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  dateRange === '7d' ? 'bg-[#2563EB] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setDateRange('30d')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  dateRange === '30d' ? 'bg-[#2563EB] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setDateRange('12m')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  dateRange === '12m' ? 'bg-[#2563EB] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12 Months
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 font-bold bg-white text-slate-700 h-10 px-4 rounded-xl"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              Refresh
            </Button>
          </div>
        </div>
      </Card>

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
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{ANALYTICS_DATA.summary.revenue.value}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {ANALYTICS_DATA.summary.revenue.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last period</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{ANALYTICS_DATA.summary.orders.value}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {ANALYTICS_DATA.summary.orders.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last period</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Order Value</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{ANALYTICS_DATA.summary.avgOrderValue.value}</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <BarChart2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  {ANALYTICS_DATA.summary.avgOrderValue.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last period</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Rate</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{ANALYTICS_DATA.summary.conversionRate.value}</p>
                </div>
                <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  {ANALYTICS_DATA.summary.conversionRate.change}
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
                <p className="text-xs text-slate-500">Monthly breakdown of gross revenue and transaction counts</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ANALYTICS_DATA.revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        formatter={(value, name) => [name === 'revenue' ? `$${value.toLocaleString()}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
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
                        data={ANALYTICS_DATA.categorySales}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {ANALYTICS_DATA.categorySales.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-bold text-slate-400 uppercase">Total</span>
                    <span className="text-xl font-extrabold text-slate-800">$124,580</span>
                  </div>
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[110px] pr-1">
                  {ANALYTICS_DATA.categorySales.map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="font-semibold text-slate-600 truncate max-w-[120px]">{cat.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">${cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Top Products & Branch Performance */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Top Products Table */}
            <Card className="lg:col-span-2 border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Top Performing Products</CardTitle>
                <p className="text-xs text-slate-500">Most sold items and their remaining inventory levels</p>
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
                        <th className="py-3 px-4 font-bold text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {ANALYTICS_DATA.topProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                          <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">{p.category}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-700">{p.sales}</td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-800">{p.revenue}</td>
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

            {/* Branch Performance Targets */}
            <Card className="border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">Branch Performance</CardTitle>
                <p className="text-xs text-slate-500">Sales achievement vs target goal settings</p>
              </CardHeader>
              <CardContent className="p-0 space-y-5">
                {ANALYTICS_DATA.branchPerformance.map((branch) => {
                  const percentage = Math.min(Math.round((branch.revenue / branch.target) * 100), 100);
                  return (
                    <div key={branch.name} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{branch.name}</span>
                        <span className="font-bold text-slate-800">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: branch.color
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span>Actual: ${branch.revenue.toLocaleString()}</span>
                        <span>Goal: ${branch.target.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
