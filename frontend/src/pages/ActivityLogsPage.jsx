import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import { getActivityLogs } from '../services/auditService';
import { 
  Calendar,
  Building2,
  User,
  Layers,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Search
} from 'lucide-react';

export default function ActivityLogsPage() {
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    branch: 'all',
    user: 'all',
    module: 'all',
    eventType: 'all'
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const { data: logsData, isLoading, error, refetch } = useQuery({
    queryKey: ['audit', 'activity-logs', filters, page],
    queryFn: () => getActivityLogs({
      dateStart: filters.dateRange.start,
      dateEnd: filters.dateRange.end,
      branch: filters.branch,
      user: filters.user,
      module: filters.module,
      eventType: filters.eventType,
      page,
      limit: rowsPerPage
    }),
    keepPreviousData: true
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when filters change
  };

  const handleDateRangeChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      dateRange: { start: '', end: '' },
      branch: 'all',
      user: 'all',
      module: 'all',
      eventType: 'all'
    });
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1);
  };

  if (isLoading && !logsData) {
    return (
      <div>
        <PageHeader
          title="Activity Logs"
          description="Detailed history of all system logs"
        />
        <div className="mt-8 flex items-center justify-center">
          <div className="text-slate-600">Loading activity logs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Activity Logs"
          description="Detailed history of all system logs"
        />
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error loading activity logs: {error.message}
        </div>
      </div>
    );
  }

  const logs = logsData?.data?.logs || [];
  const pagination = logsData?.data?.pagination || { total: 0, totalPages: 0, page: 1, limit: 15 };
  const filterOptions = logsData?.data?.filters || { users: [], branches: [], modules: [], eventTypes: [] };

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div>
      <PageHeader
        title="Activity Logs"
        description="Detailed history of all system logs"
      />

      <div className="mt-8 space-y-6">
        {/* Filters Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-slate-600 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
            </div>
            <button
              onClick={resetFilters}
              className="flex items-center text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700">
                <Building2 className="w-4 h-4 mr-2" />
                Branch
              </label>
              <select
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Branches</option>
                {filterOptions.branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>

            {/* User */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700">
                <User className="w-4 h-4 mr-2" />
                User
              </label>
              <select
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                {filterOptions.users.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>

            {/* Module */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700">
                <Layers className="w-4 h-4 mr-2" />
                Module
              </label>
              <select
                value={filters.module}
                onChange={(e) => handleFilterChange('module', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Modules</option>
                {filterOptions.modules.map(module => (
                  <option key={module} value={module}>{module}</option>
                ))}
              </select>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Event Type
              </label>
              <select
                value={filters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {filterOptions.eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Module
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <Search className="w-12 h-12 text-slate-300 mb-3" />
                        <p className="text-sm">No logs found matching your filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {log.user}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {log.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {log.module}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {log.ipAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Showing {startIndex} to {endIndex} of {pagination.total} results
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-600">Rows per page:</label>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => handleRowsPerPageChange(parseInt(e.target.value))}
                      className="px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={15}>15</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="px-3 py-2 text-sm text-slate-600">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
