const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const sendSuccess = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: true,
    message,
    timestamp: new Date().toISOString(),
    data,
  });
};

// GET /api/v1/ai-forecasting/
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.getModuleDetails();
  sendSuccess(res, 200, 'AI Forecasting module is active.', data);
});

// GET /api/v1/ai-forecasting/forecast?metric=revenue&period=7d
const getForecast = asyncHandler(async (req, res) => {
  const metric = req.query.metric || 'revenue';
  const period = req.query.period || '7d';

  if (!['revenue', 'transactions'].includes(metric)) {
    return res.status(400).json({ success: false, message: 'Invalid metric. Use "revenue" or "transactions".' });
  }
  if (!['7d', '14d', '30d'].includes(period)) {
    return res.status(400).json({ success: false, message: 'Invalid period. Use "7d", "14d", or "30d".' });
  }

  const data = await service.getForecast(metric, period);
  sendSuccess(res, 200, 'Forecast data retrieved successfully.', data);
});

// POST /api/v1/ai-forecasting/forecast/refresh
const refreshForecast = asyncHandler(async (req, res) => {
  const metric = req.body.metric || req.query.metric || 'revenue';
  const period = req.body.period || req.query.period || '7d';

  const data = await service.generateForecast(metric, period);
  sendSuccess(res, 200, 'Forecast regenerated successfully.', data);
});

module.exports = {
  getDetails,
  getForecast,
  refreshForecast,
};
