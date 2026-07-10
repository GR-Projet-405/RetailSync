import React, { useState, useEffect } from 'react';
import { BellRing, ShieldAlert, AlertTriangle, Target, Activity, RefreshCw, X, Check, Eye, Trash2, ArrowUpRight, DollarSign, Package, ChevronDown, ChevronUp, Terminal, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { toast } from '../utils/toast';
import api from '../services/api';

export default function AIAlertsPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [overview, setOverview] = useState({ activeAlerts: 0, lowStockCount: 0, anomalyCount: 0, salesTargetCount: 0 });
  const [filter, setFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (filter && filter !== 'all') params.category = filter;
        if (severityFilter && severityFilter !== 'all') params.severity = severityFilter;

        const res = await api.get('/ai-alerts/list', { params });
        const data = res.data.data;
        setAlerts(data.alerts || []);
        setOverview(data.overview || { activeAlerts: 0, lowStockCount: 0, anomalyCount: 0, salesTargetCount: 0 });
      } catch (err) {
        console.error('AI Alerts fetch error:', err);
        setError(err.message || 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [refreshKey, filter, severityFilter]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAcknowledge = async (id, title) => {
    try {
      await api.patch(`/ai-alerts/${id}/acknowledge`);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, acknowledged: true } : a));
      setOverview(prev => ({ ...prev, activeAlerts: Math.max(0, prev.activeAlerts - 1) }));
      toast.success(`Alert "${title}" marked as resolved!`);
    } catch (err) {
      toast.error(err.message || 'Failed to acknowledge alert');
    }
  };

  const handleClear = async (id) => {
    try {
      await api.delete(`/ai-alerts/${id}`);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error(err.message || 'Failed to delete alert');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const filteredAlerts = alerts.filter(a => {
    const matchesCategory = filter === 'all' 
      ? !a.acknowledged 
      : filter === 'resolved' 
        ? a.acknowledged 
        : a.category === filter && !a.acknowledged;
        
    const matchesSeverity = severityFilter === 'all' 
      ? true 
      : a.severity === severityFilter;

    return matchesCategory && matchesSeverity;
  });

  const getSeverityStyles = (severity) => {
    if (severity === 'critical') return 'bg-red-50 text-red-700 border-red-200';
    if (severity === 'info') return 'bg-blue-50 text-blue-700 border-blue-200';
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
      case 'sales_target': return 'Sales Target';
      case 'anomaly': return 'Anomaly & Fraud';
      default: return 'General Alert';
    }
  };

  // Grouping active filtered alerts chronologically
  const todayAlerts = filteredAlerts.filter(a => a.timeGroup === 'Today');
  const historyAlerts = filteredAlerts.filter(a => a.timeGroup !== 'Today');

  const renderAlertCard = (alert) => {
    const isExpanded = expandedId === alert._id;
    return (
      <Card key={alert._id} className="border-slate-200 bg-white rounded-2xl p-5 hover:shadow-md transition">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Info details */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl shrink-0 mt-0.5 shadow-sm">
              {getCategoryIcon(alert.category)}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-lg">
                  {getCategoryLabel(alert.category)}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getSeverityStyles(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-xs text-slate-400 font-bold">{alert.date}</span>
              </div>
              <h3 className="text-base font-bold text-slate-800 leading-tight flex items-center gap-2">
                {alert.title}
              </h3>
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
            <button
              onClick={() => toggleExpand(alert._id)}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition flex items-center gap-1 text-xs font-bold"
              title="Inspect Metadata logs"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Inspect
            </button>
            {!alert.acknowledged ? (
              <>
                <button
                  onClick={() => handleAcknowledge(alert._id, alert.title)}
                  className="px-3 py-2 text-xs font-bold bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl flex items-center gap-1 transition shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  Resolve
                </button>
                <button
                  onClick={() => handleClear(alert._id)}
                  className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleClear(alert._id)}
                className="px-3 py-1.5 text-xs font-bold border border-red-200 text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Record
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Metadata Panel */}
        {isExpanded && (
          <div className="mt-4 p-4 border border-slate-200 bg-slate-50/50 rounded-xl fade-in space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Terminal className="w-4 h-4 text-[#2563EB]" />
              AI System Inspection Details
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {alert.metadata && Object.entries(alert.metadata).map(([key, val]) => (
                <div key={key} className="flex justify-between p-2.5 bg-white border border-slate-100 rounded-lg">
                  <span className="font-semibold text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-extrabold text-slate-700">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    );
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 border-slate-200 card-hover bg-white rounded-2xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Alerts</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                {overview.activeAlerts}
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
                {overview.lowStockCount}
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
                {overview.anomalyCount}
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
                {overview.salesTargetCount}
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
        {/* Navigation Category Filter Tabs & Severity selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex flex-wrap gap-2">
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

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white text-slate-600 focus:outline-none"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warnings</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Spinner className="h-8 w-8 text-[#2563EB]" />
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center shadow-sm">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">Clear Feed!</h3>
            <p className="text-xs text-slate-500 mt-1">There are no matching anomalies or pending alerts needing action.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Today Group */}
            {todayAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Today</h4>
                <div className="space-y-4">
                  {todayAlerts.map(renderAlertCard)}
                </div>
              </div>
            )}

            {/* History Group */}
            {historyAlerts.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest pl-1">Historical Logs</h4>
                <div className="space-y-4">
                  {historyAlerts.map(renderAlertCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
