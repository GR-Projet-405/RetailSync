import React, { useState, useEffect } from 'react';
import { LineChart as ChartIcon, Calendar, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

// Mock Forecasting Data
const FORECAST_DATA = {
  summary: {
    predictedRevenue: { value: '$138,400.00', change: '+11.1%', trend: 'up' },
    highDemandCount: { value: '14 Items', change: 'Increased', trend: 'up' },
    stockRiskLevel: { value: 'Low Risk', variant: 'success' }
  },
  trendData: [
    { date: 'Jul 01', actual: 4200, predicted: 4200 },
    { date: 'Jul 02', actual: 4600, predicted: 4500 },
    { date: 'Jul 03', actual: 4100, predicted: 4300 },
    { date: 'Jul 04', actual: 4800, predicted: 4700 },
    { date: 'Jul 05', actual: 5100, predicted: 4900 },
    { date: 'Jul 06', actual: 5300, predicted: 5100 },
    { date: 'Jul 07', actual: null, predicted: 5400 },
    { date: 'Jul 08', actual: null, predicted: 5600 },
    { date: 'Jul 09', actual: null, predicted: 5800 },
    { date: 'Jul 10', actual: null, predicted: 5500 },
    { date: 'Jul 11', actual: null, predicted: 5700 },
    { date: 'Jul 12', actual: null, predicted: 6100 }
  ],
  productForecasts: [
    { id: 1, name: 'Espresso Blend Coffee', sku: 'COF-ESP-001', currentStock: 45, predictedDemand: 180, recommendedReorder: 150, risk: 'Low' },
    { id: 2, name: 'Whole Wheat Bread', sku: 'BAK-WWB-002', currentStock: 12, predictedDemand: 95, recommendedReorder: 100, risk: 'High' },
    { id: 3, name: 'Organic Bananas (kg)', sku: 'FRU-BAN-003', currentStock: 120, predictedDemand: 250, recommendedReorder: 150, risk: 'Medium' },
    { id: 4, name: 'Greek Yogurt (500g)', sku: 'DY-GRY-004', currentStock: 64, predictedDemand: 110, recommendedReorder: 60, risk: 'Low' },
    { id: 5, name: 'Chocolate Chip Cookie', sku: 'BAK-CCC-005', currentStock: 8, predictedDemand: 80, recommendedReorder: 90, risk: 'High' }
  ],
  seasonalInsights: [
    { title: 'Weekend Bakery Spike', detail: 'Bakery item sales are projected to rise by 25% on Saturdays and Sundays. Suggesting high stock levels for bread and croissants by Friday evenings.' },
    { title: 'Morning Coffee Surge', detail: 'A 15% increase in morning hot beverage sales is forecasted due to cooler upcoming weather. Recommend maintaining extra espresso beans and milk reserves.' }
  ]
};

export default function AIForecastingPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [period, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Premium Gradient Title Card */}
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
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setPeriod('7d')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  period === '7d' ? 'bg-[#2563EB] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setPeriod('14d')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  period === '14d' ? 'bg-[#2563EB] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                14 Days
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  period === '30d' ? 'bg-[#2563EB] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 font-bold bg-white text-slate-700 h-10 px-4 rounded-xl"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              Recalculate
            </Button>
          </div>
        </div>
      </Card>

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
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Forecasted Sales</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{FORECAST_DATA.summary.predictedRevenue.value}</p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {FORECAST_DATA.summary.predictedRevenue.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">expected growth</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">High Demand Products</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{FORECAST_DATA.summary.highDemandCount.value}</p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <ChartIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 rounded-full">
                  {FORECAST_DATA.summary.highDemandCount.change}
                </span>
                <span className="text-xs font-semibold text-slate-400">vs last 7 days</span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Understock Risk</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">{FORECAST_DATA.summary.stockRiskLevel.value}</p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Healthy Inventory
                </span>
                <span className="text-xs font-semibold text-slate-400">levels forecasted</span>
              </div>
            </Card>
          </div>

          {/* Forecast Trend Chart */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-lg font-bold text-slate-800">Sales Forecast Projection</CardTitle>
                <p className="text-xs text-slate-500">Comparison of actual historical sales vs machine learning predictive outputs</p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={FORECAST_DATA.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                      <Line type="monotone" dataKey="actual" name="Actual Sales" stroke="#94A3B8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
                      <Line type="monotone" dataKey="predicted" name="Predicted Sales" stroke="#2563EB" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights panel */}
            <Card className="border-slate-200 bg-white rounded-2xl p-6">
              <CardHeader className="p-0 pb-4">
                <CardTitle className="text-lg font-bold text-slate-800">AI Predictive Insights</CardTitle>
                <p className="text-xs text-slate-500">Smart contextual highlights detected by AI engine</p>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                {FORECAST_DATA.seasonalInsights.map((insight, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#2563EB] rounded-full shrink-0" />
                      <h4 className="text-sm font-bold text-slate-800">{insight.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{insight.detail}</p>
                  </div>
                ))}
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
                      <th className="py-3 px-4 font-bold text-right">Forecasted Demand (30 Days)</th>
                      <th className="py-3 px-4 font-bold text-right">Recommended Reorder</th>
                      <th className="py-3 px-4 font-bold text-center">Understock Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                    {FORECAST_DATA.productForecasts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{p.name}</td>
                        <td className="py-3.5 px-4 text-slate-500 text-xs font-bold">{p.sku}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700">{p.currentStock} units</td>
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
