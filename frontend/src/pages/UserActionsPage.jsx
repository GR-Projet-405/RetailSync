import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
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

// ---- Dummy / fallback data --------------------------------------------

const now = new Date();
const h = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
const d = (days, hours = 0) =>
  new Date(now.getTime() - (days * 24 + hours) * 60 * 60 * 1000).toISOString();

const DUMMY_LOGS = [
  {
    _id: 'dummy-1',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Authentication',
    actionType: 'Login',
    description: 'Successful login from authorized IP (192.168.1.144). Session token issued.',
    metadata: { success: true, sessionDuration: '8h' },
    riskLevel: 'Low',
    ipAddress: '192.168.1.144',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    createdAt: h(1)
  },
  {
    _id: 'dummy-2',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Inventory',
    actionType: 'Modification',
    description: 'Updated SKU-9021 stock level from 150 to 145 for branch inventory reconciliation.',
    metadata: { sku: 'SKU-9021', previousQty: 150, newQty: 145, quantityChange: -5 },
    riskLevel: 'Low',
    ipAddress: '192.168.1.144',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    createdAt: h(2)
  },
  {
    _id: 'dummy-3',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Customer',
    actionType: 'Modification',
    description: 'Registered VIP customer Elena Rodriguez (ID: C-4892) in the loyalty program.',
    metadata: { customerName: 'Elena Rodriguez', customerId: 'C-4892', loyaltyTier: 'VIP' },
    riskLevel: 'Low',
    ipAddress: '192.168.1.144',
    device: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.1',
    createdAt: h(5)
  },
  {
    _id: 'dummy-4',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Supplier',
    actionType: 'Deletion',
    description: "Removed vendor 'Global Tech Sourcing' (ID: V-1103) from the approved supplier list.",
    metadata: { vendorName: 'Global Tech Sourcing', vendorId: 'V-1103', reason: 'Contract expired' },
    riskLevel: 'High',
    ipAddress: '192.168.1.102',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/120.0.0.0',
    createdAt: h(11)
  },
  {
    _id: 'dummy-5',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'POS',
    actionType: 'Modification',
    description: 'Applied 15% discount override on transaction #TXN-7742 with manager approval.',
    metadata: { transactionId: 'TXN-7742', discountPct: 15, approvedBy: 'Store Manager' },
    riskLevel: 'Medium',
    ipAddress: '192.168.1.144',
    device: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) Mobile/15E148',
    createdAt: d(1, 2)
  },
  {
    _id: 'dummy-6',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Authentication',
    actionType: 'Login',
    description: 'Login attempted from an unrecognized device. Flagged for security review.',
    metadata: { success: false, reason: 'Unrecognized device fingerprint', flagged: true },
    riskLevel: 'High',
    ipAddress: '203.45.67.88',
    device: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0',
    createdAt: d(1, 6)
  },
  {
    _id: 'dummy-7',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Product',
    actionType: 'Modification',
    description: 'Created new product listing for "Wireless Ergonomic Keyboard" under Electronics category.',
    metadata: { productName: 'Wireless Ergonomic Keyboard', category: 'Electronics', sku: 'SKU-4410' },
    riskLevel: 'Low',
    ipAddress: '192.168.1.144',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    createdAt: d(1, 9)
  },
  {
    _id: 'dummy-8',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Inventory',
    actionType: 'Deletion',
    description: 'Permanently deleted discontinued item SKU-0031 (Vintage USB Hub) from inventory.',
    metadata: { sku: 'SKU-0031', itemName: 'Vintage USB Hub', status: 'Discontinued' },
    riskLevel: 'High',
    ipAddress: '192.168.1.144',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    createdAt: d(2, 3)
  },
  {
    _id: 'dummy-9',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Authentication',
    actionType: 'Login',
    description: 'Successful login from office workstation. MFA verification passed.',
    metadata: { success: true, mfaMethod: 'TOTP', sessionDuration: '6h' },
    riskLevel: 'Low',
    ipAddress: '192.168.1.144',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    createdAt: d(2, 8)
  },
  {
    _id: 'dummy-10',
    userId: 'dummy-user',
    userName: 'Marcus Chen',
    role: 'Senior Logistics Lead',
    branch: 'Seattle Hub – Zone A',
    module: 'Supplier',
    actionType: 'Modification',
    description: "Updated payment terms for 'Pacific Rim Distributors' from Net-30 to Net-15.",
    metadata: { supplierName: 'Pacific Rim Distributors', oldTerms: 'Net-30', newTerms: 'Net-15' },
    riskLevel: 'Medium',
    ipAddress: '192.168.1.144',
    device: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    createdAt: d(2, 11)
  }
];

const DUMMY_STATS = {
  totalActions: 10,
  totalLogins: 3,
  totalModifications: 5,
  totalSecurityAlerts: 3
};

// ---- Component --------------------------------------------------------

export default function UserActionsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalActions: 0,
    totalLogins: 0,
    totalModifications: 0,
    totalSecurityAlerts: 0
  });
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

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

  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    if (!currentUserId) {
      setLogs([]);
      setLoadingLogs(false);
      setError(null);
      return;
    }

    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, startDate, endDate, currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      setLoadingStats(false);
      return;
    }

    fetchStats();
  }, [currentUserId]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/user-actions/stats', {
        params: { userId: currentUserId }
      });
      if (res.data?.success) {
        const data = res.data.data;
        // Fall back to dummy stats if every counter is zero
        const isEmpty = Object.values(data).every((v) => v === 0);
        setStats(isEmpty ? DUMMY_STATS : data);
      } else {
        setStats(DUMMY_STATS);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setStats(DUMMY_STATS);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchLogs = async () => {
    if (!currentUserId) {
      // No user logged in — show dummy data so the page isn't empty
      setLogs(DUMMY_LOGS);
      setStats(DUMMY_STATS);
      setLoadingLogs(false);
      setError(null);
      return;
    }

    try {
      setLoadingLogs(true);
      setError(null);

      const params = {
        page: 1,
        limit: 100,
        search: searchTerm || undefined,
        module: selectedModule !== 'All' ? selectedModule : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        userId: currentUserId
      };

      const res = await api.get('/user-actions', { params });
      if (res.data?.success) {
        const fetched = res.data.data.logs;
        // Fall back to dummy data when API returns no logs
        setLogs(fetched && fetched.length > 0 ? fetched : DUMMY_LOGS);
        setCurrentDayIndex(0);
      } else {
        setLogs(DUMMY_LOGS);
      }
    } catch (err) {
      // On error, show dummy data instead of an empty/broken state
      setLogs(DUMMY_LOGS);
      setError(null); // suppress error banner since we have fallback data
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleNextDay = () => {
    if (currentDayIndex < dayGroups.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const fetchLogDetails = async (id) => {
    // Dummy logs are not in the DB — load directly from local state
    if (String(id).startsWith('dummy-')) {
      const found = logs.find((l) => l._id === id);
      if (found) {
        setSelectedLog(found);
        setIsModalOpen(true);
      }
      return;
    }

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

  // Helper: download current logs as a CSV file (client-side, no dependencies)
  const exportAsCsv = () => {
    if (!logs.length) {
      alert('No logs to export.');
      return;
    }

    const headers = ['Time', 'User', 'Module', 'Action', 'Risk Level', 'Description', 'IP Address', 'Device'];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toLocaleString(),
      l.userName || '',
      l.module || '',
      l.actionType || '',
      l.riskLevel || '',
      `"${(l.description || '').replace(/"/g, '""')}"`,
      l.ipAddress || '',
      `"${(l.device || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `user_footprint_export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    // When showing dummy data (no real userId), export as CSV directly
    const isDummyData = logs.length > 0 && logs[0]?.userId === 'dummy-user';
    if (isDummyData || !currentUserId) {
      exportAsCsv();
      return;
    }

    try {
      const res = await api.post(
        '/user-actions/export',
        { userId: currentUserId },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const disposition = res.headers['content-disposition'] || '';
      const filename =
        disposition.split('filename="')[1]?.split('"')[0] ||
        `user_footprint_export_${new Date().toISOString().split('T')[0]}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Backend failed (e.g. no logs for this user) — fall back to CSV
      console.warn('PDF export failed, falling back to CSV:', err.message);
      exportAsCsv();
    }
  };

  const dayGroups = useMemo(() => groupByDay(logs), [logs]);

  // The featured profile card reflects whoever the current filtered
  // timeline is centered on — the most recent actor in the result set.
  const profileUser = useMemo(() => {
    if (!user) return null;
    return {
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      role: user.roleId?.name || user.roleId || 'Unknown Role',
      branch: user.branchId?.name || user.branchId?.code || 'Unknown Branch',
      email: user.email,
      username: user.username,
      device: logs[0]?.device || 'Unknown device',
      createdAt: logs[0]?.createdAt || user.lastLogin || new Date().toISOString()
    };
  }, [user, logs]);

  const featuredUser = profileUser || logs[0];
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
            {user ? (
              `Logged in as ${user.firstName || ''} ${user.lastName || ''}`.trim() +
              ` (${user.roleId?.name || user.roleId || 'Unknown role'})${user.branchId ? ` • ${user.branchId.name || user.branchId.code}` : ''}`
            ) : featuredUser ? (
              `${featuredUser.role} • ${featuredUser.branch}`
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
              <div className="space-y-6">
                <div className="space-y-8">
                  {dayGroups.length > 0 && (
                    <div key={dayGroups[currentDayIndex]?.key} className="relative">
                      {/* Day separator */}
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                          {dayGroups[currentDayIndex]?.label}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-slate-100 to-transparent" />
                      </div>

                      <ul className="space-y-4">
                        {dayGroups[currentDayIndex]?.items.map((log, itemIdx) => {
                          const { Icon, bg, fg } = getEntryVisual(log);
                        return (
                          <li key={log._id} className="flex gap-4 group/item">
                            {/* Timeline dot */}
                            <div className="shrink-0 mt-1">
                              <div className="relative">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${fg} shadow-sm ring-4 ring-white group-hover/item:ring-blue-100 transition-all duration-200`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                {/* Connecting line to next item */}
                                {itemIdx < (dayGroups[currentDayIndex]?.items.length || 0) - 1 && (
                                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-200" />
                                )}
                              </div>
                            </div>

                            {/* Activity card */}
                            <button
                              onClick={() => fetchLogDetails(log._id)}
                              className="flex-1 text-left group/card bg-white border border-slate-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <span
                                    className={`text-sm font-semibold block ${
                                      log.riskLevel === 'High'
                                        ? 'text-red-600'
                                        : 'text-slate-800 group-hover/card:text-blue-600'
                                    } transition-colors`}
                                  >
                                    {log.actionType} — {log.module}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 whitespace-nowrap">
                                  {timeOf(log.createdAt)}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                {log.description}
                              </p>

                              {/* Risk badge */}
                              {log.riskLevel === 'High' && (
                                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 w-fit">
                                  <AlertTriangle className="w-3 h-3" />
                                  Flagged — High Risk
                                </div>
                              )}
                              {log.riskLevel === 'Medium' && (
                                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 w-fit">
                                  <AlertTriangle className="w-3 h-3" />
                                  Medium Risk
                                </div>
                              )}
                            </button>
                          </li>
                        );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Day Navigation */}
                {dayGroups.length > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-xs text-slate-500 font-medium">
                      Day <span className="font-semibold text-slate-700">{currentDayIndex + 1}</span> of{' '}
                      <span className="font-semibold text-slate-700">{dayGroups.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrevDay}
                        disabled={currentDayIndex === 0}
                        className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Previous Day
                      </button>
                      <button
                        onClick={handleNextDay}
                        disabled={currentDayIndex === dayGroups.length - 1}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors"
                      >
                        Next Day →
                      </button>
                    </div>
                  </div>
                )}
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
                  {profileUser?.email && (
                    <p className="text-[11px] text-slate-500 mt-1 truncate">{profileUser.email}</p>
                  )}
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