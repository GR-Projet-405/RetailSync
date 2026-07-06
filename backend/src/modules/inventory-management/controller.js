const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/inventory-management/dashboard/kpis
const getDashboardKPIs = asyncHandler(async (req, res) => {
  const { warehouseIds } = req.query;
  const ids = warehouseIds ? warehouseIds.split(',').filter(Boolean) : [];
  const data = await service.getDashboardKPIs(ids);
  res.status(200).json({ success: true, message: 'Dashboard KPIs retrieved', data });
});

// GET /api/v1/inventory-management/dashboard/category-breakdown
const getStockCategoryBreakdown = asyncHandler(async (req, res) => {
  const data = await service.getStockCategoryBreakdown();
  res.status(200).json({ success: true, message: 'Category breakdown retrieved', data });
});

// GET /api/v1/inventory-management/dashboard/recent-movements
const getRecentMovementsForDashboard = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const data = await service.getRecentMovementsForDashboard(limit);
  res.status(200).json({ success: true, message: 'Recent movements retrieved', data });
});

// ─────────────────────────────────────────────────────────────────────────────
// Stock Levels
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/inventory-management/stock-levels
const getStockLevels = asyncHandler(async (req, res) => {
  const { search, categoryId, warehouseId, status, startDate, endDate, page, limit } = req.query;
  const data = await service.getStockLevels({ search, categoryId, warehouseId, status, startDate, endDate, page, limit });
  res.status(200).json({ success: true, message: 'Stock levels retrieved', data });
});

// GET /api/v1/inventory-management/stock-levels/:id
const getStockLevelById = asyncHandler(async (req, res) => {
  const data = await service.getStockLevelById(req.params.id);
  res.status(200).json({ success: true, message: 'Stock level retrieved', data });
});

// PATCH /api/v1/inventory-management/stock-levels/:id/reorder-level
const updateReorderLevel = asyncHandler(async (req, res) => {
  const { reorderLevel } = req.body;
  const data = await service.updateReorderLevel(req.params.id, Number(reorderLevel));
  res.status(200).json({ success: true, message: 'Reorder level updated', data });
});

// ─────────────────────────────────────────────────────────────────────────────
// Stock Movements
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/inventory-management/stock-movements/kpis
const getMovementKPIs = asyncHandler(async (req, res) => {
  const { warehouseIds } = req.query;
  const ids = warehouseIds ? warehouseIds.split(',').filter(Boolean) : [];
  const data = await service.getMovementKPIs(ids);
  res.status(200).json({ success: true, message: 'Movement KPIs retrieved', data });
});

// GET /api/v1/inventory-management/stock-movements
const getMovements = asyncHandler(async (req, res) => {
  const { search, type, warehouseId, startDate, endDate, page, limit } = req.query;
  const data = await service.getMovements({ search, type, warehouseId, startDate, endDate, page, limit });
  res.status(200).json({ success: true, message: 'Stock movements retrieved', data });
});

// POST /api/v1/inventory-management/stock-movements
const recordMovement = asyncHandler(async (req, res) => {
  const data = await service.recordMovement({ ...req.body, performedBy: req.user._id });
  res.status(201).json({ success: true, message: 'Stock movement recorded', data });
});

// ─────────────────────────────────────────────────────────────────────────────
// Stock Adjustments
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/inventory-management/stock-adjustments
const getAdjustments = asyncHandler(async (req, res) => {
  const { search, type, warehouseId, status, startDate, endDate, page, limit } = req.query;
  const data = await service.getAdjustments({ search, type, warehouseId, status, startDate, endDate, page, limit });
  res.status(200).json({ success: true, message: 'Stock adjustments retrieved', data });
});

// POST /api/v1/inventory-management/stock-adjustments
const createAdjustment = asyncHandler(async (req, res) => {
  const data = await service.createAdjustment({ ...req.body, requestedBy: req.user._id });
  res.status(201).json({ success: true, message: 'Adjustment submitted for approval', data });
});

// PATCH /api/v1/inventory-management/stock-adjustments/:id/approve
const approveAdjustment = asyncHandler(async (req, res) => {
  const data = await service.approveAdjustment(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Adjustment approved and stock updated', data });
});

// PATCH /api/v1/inventory-management/stock-adjustments/:id/reject
const rejectAdjustment = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;
  const data = await service.rejectAdjustment(req.params.id, req.user._id, rejectionReason);
  res.status(200).json({ success: true, message: 'Adjustment rejected', data });
});

// ─────────────────────────────────────────────────────────────────────────────
// Low Stock Alerts
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/v1/inventory-management/low-stock-alerts/stats
const getLowStockStats = asyncHandler(async (req, res) => {
  const data = await service.getLowStockStats();
  res.status(200).json({ success: true, message: 'Low stock stats retrieved', data });
});

// GET /api/v1/inventory-management/low-stock-alerts
const getLowStockAlerts = asyncHandler(async (req, res) => {
  const { search, categoryId, warehouseId, severity, startDate, endDate, page, limit } = req.query;
  const data = await service.getLowStockAlerts({ search, categoryId, warehouseId, severity, startDate, endDate, page, limit });
  res.status(200).json({ success: true, message: 'Low stock alerts retrieved', data });
});

// Branch inventory (origin/dev)
const getInventory = asyncHandler(async (req, res) => {
  const { branchId } = req.query;
  const data = await service.getBranchInventory(branchId);
  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  // Dashboard
  getDashboardKPIs,
  getStockCategoryBreakdown,
  getRecentMovementsForDashboard,
  // Stock Levels
  getStockLevels,
  getStockLevelById,
  updateReorderLevel,
  // Stock Movements
  getMovementKPIs,
  getMovements,
  recordMovement,
  // Stock Adjustments
  getAdjustments,
  createAdjustment,
  approveAdjustment,
  rejectAdjustment,
  // Low Stock Alerts
  getLowStockStats,
  getLowStockAlerts,
  // Branch inventory compatibility
  getInventory,
};
