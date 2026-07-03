import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  ShieldAlert, 
  Activity, 
  LogIn, 
  Settings, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Loader2,
  X,
  Laptop
} from 'lucide-react';
import Badge from '../components/Badge';
import Spinner from '../components/Spinner';

export default function UserActionsPage() {
  // Query state
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalActions: 0,
    totalLogins: 0,
    totalModifications: 0,
    totalSecurityAlerts: 0
  });
  
  // Loading & Error States
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8;

  // Selected Log for Details Modal
  const [selectedLogId, setSelectedLogId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Trigger search on debounce or filter change
  useEffect(() => {
    fetchLogs();
  }, [selectedModule, selectedRisk, startDate, endDate, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/user-actions/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
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
        page,
        limit,
        search: searchTerm || undefined,
        module: selectedModule !== 'All' ? selectedModule : undefined,
        riskLevel: selectedRisk !== 'All' ? selectedRisk : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      };

      const res = await api.get('/user-actions', { params });
      if (res.data?.success) {
        const { logs: fetchedLogs, total, pages } = res.data.data;
        setLogs(fetchedLogs);
        setTotalCount(total);
        setTotalPages(pages || 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user actions logs');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedModule('All');
    setSelectedRisk('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const fetchLogDetails = async (id) => {
    try {
      setLoadingDetail(true);
      setSelectedLogId(id);
      setIsModalOpen(true);
      
      const res = await api.get(`/user-actions/${id}`);
      if (res.data?.success) {
        setSelectedLog(res.data.data);
      }
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
        // Create mock file download
        const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
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

  const getRiskVariant = (risk) => {
    switch (risk) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Action Timeline</h1>
          <p className="text-sm text-slate-500 mt-1">Audit footprints, security alerts, and system modifications log.</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 rounded-xl text-sm font-medium shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export Log
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Actions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Total Actions</span>
            {loadingStats ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalActions}</h3>
            )}
            <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Logins */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Total Logins</span>
            {loadingStats ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalLogins}</h3>
            )}
            <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        {/* Modifications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Modifications</span>
            {loadingStats ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold text-slate-900">{stats.totalModifications}</h3>
            )}
            <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Security Alerts</span>
            {loadingStats ? (
              <div className="h-7 w-12 bg-slate-100 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold text-red-600">{stats.totalSecurityAlerts}</h3>
            )}
            <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Options & Search bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search description, user, action or module..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-xl text-sm transition-all duration-150"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors active:scale-[0.98]"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Module Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Module</label>
            <select
              value={selectedModule}
              onChange={(e) => { setSelectedModule(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <option value="All">All Modules</option>
              <option value="Inventory">Inventory</option>
              <option value="Authentication">Authentication</option>
              <option value="Supplier">Supplier</option>
              <option value="Customer">Customer</option>
              <option value="POS">POS Billing</option>
              <option value="Product">Product</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</label>
            <select
              value={selectedRisk}
              onChange={(e) => { setSelectedRisk(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
              />
            </div>
          </div>

          {/* Date Picker End */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none bg-slate-50/50 hover:bg-slate-50 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loadingLogs ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
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
          <div className="text-center py-20 space-y-2">
            <span className="inline-block p-4 bg-slate-50 text-slate-400 rounded-full">
              <Filter className="w-6 h-6" />
            </span>
            <h4 className="text-base font-semibold text-slate-700">No actions found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">We couldn't find any user footprint logs matching your criteria. Try adjusting the search text or clearing the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Risk</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-slate-400">{log.role} • {log.branch}</div>
                    </td>
                    {/* Module */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium text-[10px]">
                        {log.module}
                      </span>
                    </td>
                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                      {log.actionType}
                    </td>
                    {/* Description */}
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500 font-normal">
                      {log.description}
                    </td>
                    {/* Risk */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={getRiskVariant(log.riskLevel)}>
                        {log.riskLevel}
                      </Badge>
                    </td>
                    {/* Details Action Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => fetchLogDetails(log._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        {!loadingLogs && logs.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between select-none">
            <span className="text-xs text-slate-400">
              Showing <span className="font-medium text-slate-700">{logs.length}</span> of{' '}
              <span className="font-medium text-slate-700">{totalCount}</span> entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold px-3 text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsModalOpen(false)} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
          />
          <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800">User Footprint Log Details</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {loadingDetail ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  <span className="text-xs text-slate-400">Fetching audit log metadata...</span>
                </div>
              ) : selectedLog ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Severity Risk</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={getRiskVariant(selectedLog.riskLevel)}>
                          {selectedLog.riskLevel} Risk
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Status</span>
                      <span className={`text-xs font-bold ${selectedLog.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {selectedLog.status}
                      </span>
                    </div>
                  </div>

                  {/* Log description */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Summary</label>
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {selectedLog.description}
                    </p>
                  </div>

                  {/* Core Details grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">User</span>
                      <span className="font-bold text-slate-800">{selectedLog.userName}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Role Title</span>
                      <span className="font-medium text-slate-600">{selectedLog.role}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block">Branch Sector</span>
                      <span className="font-medium text-slate-600">{selectedLog.branch}</span>
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

                  {/* Device Info */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Access Agent (Device)</label>
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Laptop className="w-4 h-4 text-slate-400" />
                      <span>{selectedLog.device}</span>
                    </div>
                  </div>

                  {/* Metadata JSON */}
                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Event Payload (Metadata)</label>
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

            {/* Modal Footer */}
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
