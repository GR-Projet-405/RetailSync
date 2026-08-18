const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// GET Audit module details
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'Audit Logs module active.',
    timestamp: new Date().toISOString(),
    data
  });
});

// GET Dashboard data (KPIs, trends, recent activities)
const getDashboardData = asyncHandler(async (req, res) => {
  const data = await service.getDashboardData();
  res.status(200).json({
    success: true,
    message: 'Dashboard data retrieved successfully',
    timestamp: new Date().toISOString(),
    data
  });
});

// GET Activity logs with filters and pagination
const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 15 } = req.query;
  
  // Build filters from query params
  const filters = {
    dateRange: (req.query.dateStart || req.query.dateEnd) ? {
      start: req.query.dateStart || null,
      end: req.query.dateEnd || null
    } : undefined,
    branch: req.query.branch,
    user: req.query.user,
    module: req.query.module,
    eventType: req.query.eventType
  };

  const data = await service.getActivityLogs(filters, parseInt(page), parseInt(limit));
  res.status(200).json({
    success: true,
    message: 'Activity logs retrieved successfully',
    timestamp: new Date().toISOString(),
    data
  });
});

module.exports = {
  getDetails,
  getDashboardData,
  getActivityLogs
};
