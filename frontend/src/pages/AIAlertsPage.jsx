import React, { useState, useEffect } from 'react';
import { BellRing, ShieldAlert, AlertTriangle, Target, Activity, RefreshCw, X, Check, Eye, Trash2, ArrowUpRight, DollarSign, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { toast } from '../utils/toast';

const MOCK_ALERTS = [
  // Low Stock Projections (AI driven days remaining)
  {
    id: 'AL-101',
    category: 'low_stock',
    title: 'Critical Stock Exhaustion Projected',
    description: 'Whole Wheat Bread is selling 45% faster than average weekly velocity. Projected to run out in 2 days.',
    impact: 'Potential $420.00 weekly revenue loss',
    severity: 'critical',
    source: 'AI Inventory Forecaster',
    date: 'Today, 10:15 AM',
    metadata: { product: 'Whole Wheat Bread', currentStock: 12, daysRemaining: 2, reorderQty: 50 },
    acknowledged: false
  },
  {
    id: 'AL-102',
    category: 'low_stock',
    title: 'Stock Depletion Warning',
    description: 'Chocolate Chip Cookies are trending. Projected to run out in 3 days.',
    impact: 'Medium revenue impact',
    severity: 'warning',
    source: 'AI Inventory Forecaster',
    date: 'Today, 09:30 AM',
    metadata: { product: 'Chocolate Chip Cookie', currentStock: 8, daysRemaining: 3, reorderQty: 100 },
    acknowledged: false
  },
  // Sales Targets Off-Track
  {
    id: 'AL-201',
    category: 'sales_target',
    title: 'Monthly Branch Sales Target Off-Track',
    description: 'Suburban Mall Branch sales velocity is currently 22% below the required run-rate to meet its $45,000 monthly goal.',
    impact: 'Projected monthly shortfall: $8,800.00',
    severity: 'warning',
    source: 'Target Analyzer',
    date: 'Yesterday',
    metadata: { branch: 'Suburban Mall', currentSales: 16200, targetSales: 45000, completionPct: 36, daysRemaining: 15 },
    acknowledged: false
  },
  // Anomalies
  {
    id: 'AL-301',
    category: 'anomaly',
    title: 'Anomalous Transaction Discount Detected',
    description: 'Cashier "John Doe" applied an atypical 75% custom discount on transaction TXN-10492.',
    impact: 'Exceeds standard maximum authorization rules by 55%',
    severity: 'critical',
    source: 'AI Anomaly & Fraud Guard',
    date: 'Today, 11:42 AM',
    metadata: { transactionId: 'TXN-10492', cashier: 'John Doe', discount: '75%', standardMax: '20%' },
    acknowledged: false
  },
  {
    id: 'AL-302',
    category: 'anomaly',
    title: 'Out-of-Hours Activity Anomaly',
    description: 'A cash drawer opening and refund operation was registered at 03:15 AM (Standard hours are 08:00 AM - 10:00 PM).',
    impact: 'Potential unauthorized store entry / security breach',
    severity: 'critical',
    source: 'AI Anomaly & Fraud Guard',
    date: 'Today, 03:15 AM',
    metadata: { operation: 'No-Sale Drawer Open', timestamp: '03:15:22 AM', terminal: 'POS-Terminal-02' },
    acknowledged: false
  }
];

export default function AIAlertsPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [filter, setFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAcknowledge = (id, title) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    toast.success(`Alert "${title}" marked as resolved!`);
  };

  const handleClear = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return !a.acknowledged;
    if (filter === 'resolved') return a.acknowledged;
    return a.category === filter && !a.acknowledged;
  });

  const getSeverityStyles = (severity) => {
    if (severity === 'critical') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'low_stock':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'sales_target':
        return <Target className="w-5 h-5 text-purple-600" />;
      case 'anomaly':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      default:
        return <BellRing className="w-5 h-5 text-slate-600" />;
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'low_stock': return 'Inventory Projection';
      case 'sales_target': return 'Sales Target Target';
      case 'anomaly': return 'Anomaly & Fraud';
      default: return 'General Alert';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Title Card */}
      <Card className="overflow-hidden rounded-[20px] border-slate-200 bg-white p-0 shadow-sm">
        <div className="flex flex-col gap-5 bg-gradient-to-br from-white via-slate-50 to-blue-50/50 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)]">
              <BellRing className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#2563EB]">AI & Analytics</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0F172A]">AI Anomalies & Alerts</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2 border-slate-200 hover:bg-slate-50 font-bold bg-white text-slate-700 h-10 px-4 rounded-xl shadow-sm"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              Re-Scan Logs
            </Button>
          </div>
        </div>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Alerts</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {alerts.filter(a => !a.acknowledged).length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Projections</p>
              <p className="mt-2 text-3xl font-extrabold text-blue-600">
                {alerts.filter(a => a.category === 'low_stock' && !a.acknowledged).length}
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unusual Anomalies</p>
              <p className="mt-2 text-3xl font-extrabold text-red-600">
                {alerts.filter(a => a.category === 'anomaly' && !a.acknowledged).length}
              </p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Off-Tracks</p>
              <p className="mt-2 text-3xl font-extrabold text-purple-600">
                {alerts.filter(a => a.category === 'sales_target' && !a.acknowledged).length}
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Alert Feed Grid */}
      <div className="space-y-4">
        {/* Navigation Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {[
            { id: 'all', label: 'All Active' },
            { id: 'low_stock', label: 'Stock Projections' },
            { id: 'sales_target', label: 'Sales Targets' },
            { id: 'anomaly', label: 'System Anomalies' },
            { id: 'resolved', label: 'Resolved Archive' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                filter === tab.id
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Spinner className="h-8 w-8 text-[#2563EB]" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Clear Feed!</h3>
            <p className="text-xs text-slate-500 mt-1">There are no matching anomalies or pending alerts needing action.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <Card key={alert.id} className="border-slate-200 bg-white rounded-2xl p-5 hover:shadow-md transition">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Info details */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl shrink-0 mt-0.5 shadow-sm">
                      {getCategoryIcon(alert.category)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-lg">
                          {getCategoryLabel(alert.category)}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getSeverityStyles(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">{alert.date}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-800 leading-tight">{alert.title}</h3>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-3xl">{alert.description}</p>
                      {alert.impact && (
                        <div className="flex items-center gap-1.5 mt-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 w-fit">
                          <span className="text-red-500 font-bold">Estimated Impact:</span> {alert.impact}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                    {!alert.acknowledged ? (
                      <>
                        <button
                          onClick={() => handleAcknowledge(alert.id, alert.title)}
                          className="px-3 py-1.5 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl flex items-center gap-1 transition shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Resolve
                        </button>
                        <button
                          onClick={() => handleClear(alert.id)}
                          className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleClear(alert.id)}
                        className="px-3 py-1.5 text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Record
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
