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

const getDetails = asyncHandler(async (req, res) => {
  const data = await service.getModuleDetails();
  sendSuccess(res, 200, 'Business Analytics module is active.', data);
});

const createSnapshot = asyncHandler(async (req, res) => {
  const data = await service.createSnapshot(req.body, req.user?._id);
  sendSuccess(res, 201, 'Business analytics snapshot created successfully.', data);
});

const getSnapshots = asyncHandler(async (req, res) => {
  const data = await service.getSnapshots(req.query);
  sendSuccess(res, 200, 'Business analytics snapshots retrieved successfully.', data);
});

const getSnapshotById = asyncHandler(async (req, res) => {
  const data = await service.getSnapshotById(req.params.id);
  sendSuccess(res, 200, 'Business analytics snapshot retrieved successfully.', data);
});

const updateSnapshot = asyncHandler(async (req, res) => {
  const data = await service.updateSnapshot(req.params.id, req.body, req.user?._id);
  sendSuccess(res, 200, 'Business analytics snapshot updated successfully.', data);
});

const deleteSnapshot = asyncHandler(async (req, res) => {
  const data = await service.deleteSnapshot(req.params.id);
  sendSuccess(res, 200, 'Business analytics snapshot deleted successfully.', data);
});

const getSummary = asyncHandler(async (req, res) => {
  const data = await service.getSummary(req.query);
  sendSuccess(res, 200, 'Business analytics summary retrieved successfully.', data);
});

const getSalesTrends = asyncHandler(async (req, res) => {
  const data = await service.getSalesTrends(req.query);
  sendSuccess(res, 200, 'Sales trend analytics retrieved successfully.', data);
});

const getTopProducts = asyncHandler(async (req, res) => {
  const data = await service.getTopProducts(req.query);
  sendSuccess(res, 200, 'Top product analytics retrieved successfully.', data);
});

const getBranchPerformance = asyncHandler(async (req, res) => {
  const data = await service.getBranchPerformance(req.query);
  sendSuccess(res, 200, 'Branch performance analytics retrieved successfully.', data);
});

const getInventoryHealth = asyncHandler(async (req, res) => {
  const data = await service.getInventoryHealth(req.query);
  sendSuccess(res, 200, 'Inventory health analytics retrieved successfully.', data);
});

module.exports = {
  getDetails,
  createSnapshot,
  getSnapshots,
  getSnapshotById,
  updateSnapshot,
  deleteSnapshot,
  getSummary,
  getSalesTrends,
  getTopProducts,
  getBranchPerformance,
  getInventoryHealth,
};
