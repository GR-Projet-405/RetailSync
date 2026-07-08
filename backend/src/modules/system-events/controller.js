const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'System Events module active.',
    timestamp: new Date().toISOString(),
    data,
  });
});

const getStats = asyncHandler(async (req, res) => {
  const data = service.getStats();
  res.status(200).json({
    success: true,
    message: 'System event statistics retrieved successfully.',
    timestamp: new Date().toISOString(),
    data,
  });
});

const getEvents = asyncHandler(async (req, res) => {
  const { severity, eventType, page, limit } = req.query;
  const data = service.getEvents({ severity, eventType, page, limit });

  res.status(200).json({
    success: true,
    message: 'System events retrieved successfully.',
    timestamp: new Date().toISOString(),
    data,
  });
});

module.exports = {
  getDetails,
  getStats,
  getEvents,
};
