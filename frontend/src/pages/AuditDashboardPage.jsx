import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getDashboardData } from '../services/auditService';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  Server,
  TrendingUp,
  BarChart3,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';

export default function AuditDashboardPage() {
  const navigate = useNavigate();
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['audit', 'dashboard'],
    queryFn: getDashboardData,
  });

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Audit Dashboard"
          description="Overview of system activity and security status"
        />
        <div className="mt-8 flex items-center justify-center">
          <div className="text-slate-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Audit Dashboard"
          description="Overview of system activity and security status"
        />
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          Error loading dashboard data: {error.message}
        </div>
      </div>
    );
  }

  const { kpi, activityTrend, branchDistribution, recentActivities } = dashboardData.data;

  // Calculate max value for activity trend chart
  const maxActivityCount = Math.max(...activityTrend.map(t => t.count), 1);

  // Calculate max value for branch distribution chart
  const maxBranchCount = Math.max(...branchDistribution.map(b => b.count), 1);

  return (
    <div>
      <PageHeader
        title="Audit Dashboard"
        description="Overview of system activity and security status"
      />

      <div className="mt-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Logs */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Logs</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {formatNumber(kpi.totalLogs)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Total recorded system activities</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">User Actions</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {formatNumber(kpi.userActions)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Actions performed by users</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* System Events */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">System Events</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {formatNumber(kpi.systemEvents)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Internal system operations</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Server className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Security Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Security Alerts</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {kpi.securityAlerts}
                  <span className="text-sm font-normal text-red-600 ml-1">flagged</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Critical security issues</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Trend Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Activity Trend</h3>
              <div className="flex items-center text-sm text-slate-500">
                <TrendingUp className="w-4 h-4 mr-1" />
                Last 7 days
              </div>
            </div>
            
            <div className="space-y-3">
              {activityTrend.map((item, index) => {
                const heightPercentage = (item.count / maxActivityCount) * 100;
                const dayName = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-12 text-sm text-slate-600">{dayName}</div>
                    <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-lg transition-all duration-300"
                        style={{ width: `${heightPercentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-slate-900 text-right">
                      {item.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Branch Distribution */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Branch Distribution</h3>
              <div className="flex items-center text-sm text-slate-500">
                <BarChart3 className="w-4 h-4 mr-1" />
                By location
              </div>
            </div>
            
            <div className="space-y-3">
              {branchDistribution.map((item, index) => {
                const heightPercentage = (item.count / maxBranchCount) * 100;
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-slate-600">{item.location}</div>
                    <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div 
                        className={`h-full ${color} rounded-lg transition-all duration-300`}
                        style={{ width: `${heightPercentage}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm font-medium text-slate-900 text-right">
                      {item.percentage}%
                    </div>
                  </div>
                );
              })}
            </div>

            {branchDistribution.length > 0 && branchDistribution[0].location === 'Downtown' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Insight:</span> Downtown branch has seen a 15% increase in log volume compared to last week.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent Activities</h3>
              <div className="flex items-center text-sm text-slate-500">
                <Clock className="w-4 h-4 mr-1" />
                Latest system actions
              </div>
            </div>
          </div>
          
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
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentActivities.map((activity, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(activity.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {activity.eventType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {activity.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                        {activity.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(activity.status)}
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <button 
              onClick={() => navigate('/activity-logs')}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all activities
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
