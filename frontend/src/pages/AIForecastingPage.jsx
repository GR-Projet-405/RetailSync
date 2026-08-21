import React, { useState, useEffect, useMemo } from 'react';
import { LineChart as ChartIcon, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle, Sun, CloudRain, Award } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import api from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Line, LineChart
} from 'recharts';

// Map icon string names from backend to components
const ICON_MAP = {
  Sun, CloudRain, Award, ShieldCheck, AlertTriangle, HelpCircle,
};

export default function AIForecastingPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [metric, setMetric] = useState('revenue');
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

  // API data
  const [chartData, setChartData] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState(null);
  const [productForecasts, setProductForecasts] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/ai-forecasting/forecast', {
          params: { metric, period },
        });

        const data = res.data.data;
        setChartData(data.chartData || []);
        setSummaryMetrics(data.summaryMetrics || null);
        setProductForecasts(data.productForecasts || []);
        setInsights(data.insights || []);
      } catch (err) {
        console.error('AI Forecasting fetch error:', err);
        setError(err.message || 'Failed to load forecast data');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [period, metric, refreshKey]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/ai-forecasting/forecast/refresh', { metric, period });
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Forecast refresh error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const unitPrefix = metric === 'revenue' ? 'Rs. ' : '';

  // Derived display values
  const displaySummary = useMemo(() => {
    if (!summaryMetrics) {
      return {
        predictedRevenue: { value: '-', change: '-', trend: 'up' },
        highDemandCount: { value: '-', change: '-', trend: 'up' },
        stockRiskLevel: { value: '-', variant: 'success' },
      };
    }
    return {
      predictedRevenue: {
        value: summaryMetrics.predictedValue,
        change: summaryMetrics.predictedChange,
        trend: summaryMetrics.predictedTrend,
      },
      highDemandCount: {
        value: summaryMetrics.highDemandCount,
        change: summaryMetrics.highDemandChange,
        trend: 'up',
      },
      stockRiskLevel: {
        value: summaryMetrics.stockRiskLevel,
        variant: summaryMetrics.stockRiskVariant,
      },
    };
  }, [summaryMetrics]);

  return (
    <div className="space-y-6 fade-in">
      {/* Premium Title Card */}
      <Card className="overflow-hidden rounded-[20px] border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]">
              <ChartIcon className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2563EB]">AI & Analytics</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0F172A]">AI Forecasting</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Toggle Group */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 shadow-inner">
              <button
                onClick={() => setMetric('revenue')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  metric === 'revenue' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setMetric('transactions')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  metric === 'transactions' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Transactions
              </button>
            </div>

            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {['7d', '14d', '30d'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    period === p ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p === '7d' ? '7 Days' : p === '14d' ? '14 Days' : '30 Days'}
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
              Recalculate
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
            <p className="mt-4 text-sm font-semibold text-slate-500">Running machine learning model forecasts...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Forecasted {metric === 'revenue' ? 'Sales' : 'Volume'}</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {displaySummary.predictedRevenue.value}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {displaySummary.predictedRevenue.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">expected growth</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Demand Products</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{displaySummary.highDemandCount.value}</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <ChartIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 rounded-full">
                  {displaySummary.highDemandCount.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last 7 days</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Understock Risk</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{displaySummary.stockRiskLevel.value}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {displaySummary.stockRiskLevel.value === 'Low Risk' ? 'Healthy Inventory' : displaySummary.stockRiskLevel.value === 'Medium Risk' ? 'Moderate Risk' : 'Critical Stockouts'}
                </span>
                <span className="text-xs font-semibold text-slate-400">levels forecasted</span>
              </div>
            </Card>
          </div>

          {/* Area/Line Forecast Projection Chart */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-lg font-bold text-slate-800">Forecast Projection with ML Bounds</CardTitle>
                <p className="text-xs text-slate-500">Historical timeline with confidence intervals shaded (lower/upper bounds)</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBounds" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                        formatter={(value, name) => [`${unitPrefix}${value?.toLocaleString()}`, name === 'actual' ? 'Actual' : name === 'predicted' ? 'AI Forecast' : name]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      {/* Confidence Interval Shading Area */}
                      <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#colorBounds)" fillOpacity={0.7} />
                      <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#FFF" fillOpacity={1} />
                      
                      {/* Actual and Predicted Lines */}
                      <Line type="monotone" dataKey="actual" stroke="#94A3B8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
                      <Line type="monotone" dataKey="predicted" stroke="#2563EB" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights panel */}
            <Card className="border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-4 flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Weather & Event Logs</CardTitle>
                  <p className="text-xs text-slate-500">External factors influencing forecast metrics</p>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {insights.map((insight, idx) => {
                  const Icon = ICON_MAP[insight.icon] || Sun;
                  return (
                    <div key={idx} className={`p-4 ${insight.bg} border border-slate-100 rounded-xl space-y-2`}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${insight.iconColor}`} />
                        <h4 className="text-sm font-bold text-slate-800">{insight.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{insight.detail}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Product Forecasts Table */}
          <Card className="border-slate-200 bg-white rounded-2xl p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800">Product-Level Demand Forecasts</CardTitle>
              <p className="text-xs text-slate-500">Projected unit demand per item and recommended replenishment targets</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4 font-bold">Product Details</th>
                      <th className="py-3 px-4 font-bold">SKU</th>
                      <th className="py-3 px-4 font-bold text-right">Current Stock</th>
                      <th className="py-3 px-4 font-bold text-right">Forecasted Demand ({period === '7d' ? '7' : period === '14d' ? '14' : '30'} Days)</th>
                      <th className="py-3 px-4 font-bold text-right">Recommended Reorder</th>
                      <th className="py-3 px-4 font-bold text-center">Understock Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {productForecasts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs font-bold">{p.sku}</td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">{p.currentStock} units</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-blue-600">{p.predictedDemand} units</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-800">+{p.recommendedReorder} units</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskBadgeColor(p.risk)}`}>
                            {p.risk} Risk
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
