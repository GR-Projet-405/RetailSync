const AuditLog = require('./model');
const fs = require('fs');
const path = require('path');

class AuditLogsService {
  // Load sample data from JSON file
  loadSampleData() {
    try {
      const sampleDataPath = path.join(__dirname, 'sampleData.json');
      const rawData = fs.readFileSync(sampleDataPath, 'utf8');
      const sampleLogs = JSON.parse(rawData);
      
      // Convert timestamp strings to Date objects
      return sampleLogs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    } catch (error) {
      console.error('Error loading sample data:', error);
      return [];
    }
  }

  // Get dashboard data with KPIs, trends, and recent activities
  async getDashboardData() {
    try {
      // Calculate KPIs from real database data
      const totalLogsCount = await AuditLog.countDocuments();
      const userActionsCount = await AuditLog.countDocuments({ eventType: 'User Action' });
      const systemEventsCount = await AuditLog.countDocuments({ eventType: 'System Event' });
      const securityAlertsCount = await AuditLog.countDocuments({ eventType: 'Security Alert' });

      // Get activity trend for last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const activityTrend = await AuditLog.aggregate([
        {
          $match: {
            timestamp: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Get branch distribution
      const branchDistribution = await AuditLog.aggregate([
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      const totalBranchLogs = branchDistribution.reduce((sum, item) => sum + item.count, 0);
      const branchDistributionWithPercentage = branchDistribution.map(item => ({
        location: item._id,
        count: item.count,
        percentage: totalBranchLogs > 0 ? ((item.count / totalBranchLogs) * 100).toFixed(1) : 0
      }));

      // Get recent activities (last 10)
      const recentActivities = await AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .select('timestamp user eventType action location status');

      return {
        kpi: {
          totalLogs: totalLogsCount,
          userActions: userActionsCount,
          systemEvents: systemEventsCount,
          securityAlerts: securityAlertsCount
        },
        activityTrend: activityTrend.map(item => ({
          date: item._id,
          count: item.count
        })),
        branchDistribution: branchDistributionWithPercentage,
        recentActivities: recentActivities.map(log => ({
          timestamp: log.timestamp,
          user: log.user,
          eventType: log.eventType,
          action: log.action,
          location: log.location,
          status: log.status
        }))
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Get activity logs with filters and pagination
  async getActivityLogs(filters = {}, page = 1, limit = 15) {
    try {
      const { dateRange, branch, user, module, eventType } = filters;

      // Build query
      const query = {};

      if (dateRange && dateRange.start && dateRange.end) {
        query.timestamp = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        };
      }

      if (branch && branch !== 'all') {
        query.location = branch;
      }

      if (user && user !== 'all') {
        query.user = user;
      }

      if (module && module !== 'all') {
        query.module = module;
      }

      if (eventType && eventType !== 'all') {
        query.eventType = eventType;
      }

      // Get total count
      const total = await AuditLog.countDocuments(query);

      // Get paginated results
      const skip = (page - 1) * limit;
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .select('timestamp user role module action description ipAddress eventType location status');

      // Get unique values for filters
      const uniqueUsers = await AuditLog.distinct('user');
      const uniqueBranches = await AuditLog.distinct('location');
      const uniqueModules = await AuditLog.distinct('module');
      const uniqueEventTypes = await AuditLog.distinct('eventType');

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        filters: {
          users: uniqueUsers,
          branches: uniqueBranches,
          modules: uniqueModules,
          eventTypes: uniqueEventTypes
        }
      };
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }
  }

  async fetchDetails() {
    return {
      module: 'Audit Logs',
      status: 'Active',
      endpoints: {
        dashboard: '/dashboard',
        activityLogs: '/activity-logs'
      }
    };
  }
}

module.exports = new AuditLogsService();
