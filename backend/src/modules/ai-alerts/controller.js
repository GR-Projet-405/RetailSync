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

// GET /api/v1/ai-alerts/
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.getModuleDetails();
  sendSuccess(res, 200, 'AI Anomalies & Alerts module is active.', data);
});

// GET /api/v1/ai-alerts/list
const getAlerts = asyncHandler(async (req, res) => {
  const data = await service.getAlerts(req.query);
  sendSuccess(res, 200, 'Alerts retrieved successfully.', data);
});

// GET /api/v1/ai-alerts/:id
const getAlertById = asyncHandler(async (req, res) => {
  const data = await service.getAlertById(req.params.id);
  sendSuccess(res, 200, 'Alert retrieved successfully.', data);
});

// PATCH /api/v1/ai-alerts/:id/acknowledge
const acknowledgeAlert = asyncHandler(async (req, res) => {
  const data = await service.acknowledgeAlert(req.params.id, req.user?._id);
  sendSuccess(res, 200, 'Alert acknowledged successfully.', data);
});

// DELETE /api/v1/ai-alerts/:id
const deleteAlert = asyncHandler(async (req, res) => {
  const data = await service.deleteAlert(req.params.id);
  sendSuccess(res, 200, 'Alert deleted successfully.', data);
});

// POST /api/v1/ai-alerts/generate
const generateAlerts = asyncHandler(async (req, res) => {
  const data = await service.generateAlerts();
  sendSuccess(res, 200, `Generated ${data.generatedCount} new alert(s).`, data);
});

module.exports = {
  getDetails,
  getAlerts,
  getAlertById,
  acknowledgeAlert,
  deleteAlert,
  generateAlerts,
};
