import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  Search,
  Calendar,
  Download,
  ShieldAlert,
  Activity,
  LogIn,
  Settings,
  Trash2,
  UserPlus,
  Package,
  ChevronDown,
  Loader2,
  X,
  Laptop,
  MapPin,
  BadgeCheck,
  AlertTriangle
} from 'lucide-react';
import Spinner from '../components/Spinner';

// ---- Presentation helpers -------------------------------------------------

// Pick an icon + color treatment for a log entry based on its action type
// and module. This mirrors how a human auditor would scan the feed: color
// carries risk, icon carries "what kind of thing happened".
function getEntryVisual(log) {
  const type = (log.actionType || '').toLowerCase();
  const highRisk = log.riskLevel === 'High';

  if (type.includes('delet')) {
    return { Icon: Trash2, bg: 'bg-red-50', fg: 'text-red-600' };
  }
  if (type.includes('security')) {
    return { Icon: ShieldAlert, bg: 'bg-red-50', fg: 'text-red-600' };
  }
  if (type.includes('login')) {
    return highRisk
      ? { Icon: LogIn, bg: 'bg-red-50', fg: 'text-red-600' }
      : { Icon: LogIn, bg: 'bg-emerald-50', fg: 'text-emerald-600' };
  }
  if (log.module === 'Customer') {
    return { Icon: UserPlus, bg: 'bg-blue-50', fg: 'text-blue-600' };
  }
  if (log.module === 'Inventory' || log.module === 'Product') {
    return { Icon: Package, bg: 'bg-blue-50', fg: 'text-blue-600' };
  }
  return { Icon: Settings, bg: 'bg-amber-50', fg: 'text-amber-600' };
}

// Group logs into day buckets, labeled the way a timeline reads naturally:
// "TODAY", "YESTERDAY", then a formatted date.
function groupByDay(logs) {
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const today = startOfDay(new Date());
  const yesterday = today - 24 * 60 * 60 * 1000;

  const groups = new Map();
  for (const log of logs) {
    const created = new Date(log.createdAt);
    const key = startOfDay(created);
    if (!groups.has(key)) groups.set(key, { key, date: created, items: [] });
    groups.get(key).items.push(log);
  }

  return Array.from(groups.values())
    .sort((a, b) => b.key - a.key)
    .map((g) => {
      let label;
      if (g.key === today) label = 'Today';
      else if (g.key === yesterday) label = 'Yesterday';
      else
        label = g.date.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        });
      return { ...g, label: label.toUpperCase() };
    });
}

function timeOf(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function relativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

// Trust level is a read of the person's own recent footprint, not a
// judgement on any single event — so it's derived across their logs.
function trustLevelFor(logs) {
  const highRiskCount = logs.filter((l) => l.riskLevel === 'High').length;
  if (highRiskCount === 0) return { label: 'High', tone: 'text-emerald-600' };
  if (highRiskCount <= 2) return { label: 'Medium', tone: 'text-amber-600' };
  return { label: 'Under Review', tone: 'text-red-600' };
}

// ---- Component --------------------------------------------------------

export default function UserActionsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalActions: 0,
    totalLogins: 0,
    totalModifications: 0,
    totalSecurityAlerts: 0
  });

  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [selectedLog, setSelectedLog] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/user-actions/stats');
      if (res.data?.success) setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      setError(null);

      const params = {
        page: 1,
        limit: 50,
        search: searchTerm || undefined,
        module: selectedModule !== 'All' ? selectedModule : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const res = await api.get('/user-actions', { params });
      if (res.data?.success) {
        setLogs(res.data.data.logs);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user actions logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const fetchLogDetails = async (id) => {
    try {
      setLoadingDetail(true);
      setIsModalOpen(true);
      const res = await api.get(`/user-actions/${id}`);
      if (res.data?.success) setSelectedLog(res.data.data);
    } catch (err) {
      console.error('Error fetching log details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await api.post('/user-actions/export', {
        userId: logs[0]?.userId
      });
      if (res.data?.success) {
        const blob = new Blob([JSON.stringify(res.data.data, null, 2)], {
          type: 'application/json'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', res.data.filename || 'user_footprint_export.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const dayGroups = useMemo(() => groupByDay(logs), [logs]);

  // The featured profile card reflects whoever the current filtered
  // timeline is centered on — the most recent actor in the result set.
  const featuredUser = logs[0];
  const trust = useMemo(() => trustLevelFor(logs), [logs]);

  const statBars = [
    { label: 'Logins', value: stats.totalLogins, color: 'bg-emerald-500' },
    { label: 'Modifications', value: stats.totalModifications, color: 'bg-amber-500' },
    { label: 'Security Alerts', value: stats.totalSecurityAlerts, color: 'bg-red-500' }
  ];
  const maxStat = Math.max(1, ...statBars.map((s) => s.value));

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {featuredUser ? `User Footprint: ${featuredUser.userName}` : 'User Action Timeline'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {featuredUser ? (
              <>
                {featuredUser.role} • {featuredUser.branch}
              </>
            ) : (
              'Audit footprints, security alerts, and system modifications log.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs font-medium text-slate-700 outline-none bg-transparent"
            />
            <span className="text-slate-300">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs font-medium text-slate-700 outline-none bg-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none bg-white shadow-sm hover:bg-slate-50 transition-colors"
            >
              <option value="All">All Modules</option>
              <option value="Inventory">Inventory</option>
              <option value="Authentication">Authentication</option>
              <option value="Supplier">Supplier</option>
              <option value="Customer">Customer</option>
              <option value="POS">POS Billing</option>
              <option value="Product">Product</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            Export Log
          </button>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Search description, user, action or module..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl text-sm bg-white shadow-sm transition-all duration-150"
        />
      </form>

      {/* Main layout: timeline + side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Activity Timeline</h2>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-semibold">
              {logs.length} Actions Found
            </span>
          </div>

          <div className="p-6">
            {loadingLogs ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Spinner size="md" />
                <span className="text-sm text-slate-500">Loading audit log timeline...</span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-500">
                <AlertTriangle className="w-8 h-8" />
                <span className="text-sm font-medium">{error}</span>
                <button
                  onClick={fetchLogs}
                  className="px-4 py-1.5 border border-red-200 hover:bg-red-50 rounded-xl text-xs font-semibold mt-2 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <span className="inline-block p-4 bg-slate-50 text-slate-400 rounded-full">
                  <Activity className="w-6 h-6" />
                </span>
                <h4 className="text-base font-semibold text-slate-700">No actions found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No user footprint entries match this search. Try widening the date range or
                  clearing the module filter.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {dayGroups.map((group) => (
                  <div key={group.key}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[11px] font-bold tracking-wider text-slate-400">
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <ul className="space-y-5">
                      {group.items.map((log) => {
                        const { Icon, bg, fg } = getEntryVisual(log);
                        return (
                          <li key={log._id} className="flex gap-3">
                            <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${fg}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <button
                              onClick={() => fetchLogDetails(log._id)}
                              className="flex-1 text-left group"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span
                                  className={`text-sm font-semibold ${
                                    log.riskLevel === 'High'
                                      ? 'text-red-600'
                                      : 'text-slate-800 group-hover:text-blue-600'
                                  } transition-colors`}
                                >
                                  {log.actionType} — {log.module}
                                </span>
                                <span className="text-[11px] text-slate-400 whitespace-nowrap pt-0.5">
                                  {timeOf(log.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {log.description}
                              </p>
                              {log.riskLevel === 'High' && (
                                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1.5 w-fit">
                                  <AlertTriangle className="w-3 h-3" />
                                  Flagged for review — high risk action
                                </div>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Action Statistics */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Action Statistics</h3>
            {loadingStats ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-8 bg-slate-100 animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {statBars.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">{s.label}</span>
                      <span className="text-xs font-bold text-slate-800">{s.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-full`}
                        style={{ width: `${(s.value / maxStat) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured user profile */}
          {featuredUser && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="h-16 bg-blue-600" />
              <div className="px-5 pb-5 -mt-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-lg font-bold border-4 border-white shadow-sm">
                  {featuredUser.userName
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{featuredUser.userName}</h4>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                    {featuredUser.role}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{featuredUser.branch}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{featuredUser.device}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Trust level: <span className={`font-semibold ${trust.tone}`}>{trust.label}</span>
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-1">
                  Last active {relativeTime(featuredUser.createdAt)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">User Footprint Log Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="text-xs text-slate-400">Fetching audit log metadata...</span>
                </div>
              ) : selectedLog ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">User</span>
                      <span className="font-bold text-slate-800">{selectedLog.userName}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Module</span>
                      <span className="font-semibold text-slate-800">{selectedLog.module}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">IP Address</span>
                      <span className="font-medium text-slate-600">{selectedLog.ipAddress}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Time of Event</span>
                      <span className="font-medium text-slate-600">
                        {new Date(selectedLog.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Action Summary
                    </label>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {selectedLog.description}
                    </p>
                  </div>

                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Event Payload (Metadata)
                      </label>
                      <pre className="p-3 bg-slate-900 text-[11px] font-mono text-emerald-400 rounded-xl overflow-x-auto max-h-40 shadow-inner">
                        {JSON.stringify(selectedLog.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">Failed to load payload details.</div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}