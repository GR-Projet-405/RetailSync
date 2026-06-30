const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasRole } = require('../../middleware/auth.middleware');
const {
  reorderLevelSchema,
  recordMovementSchema,
  createAdjustmentSchema,
  rejectAdjustmentSchema,
  validate,
} = require('./validation');

// Roles allowed to access inventory module
const INVENTORY_ROLES = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'INVENTORY_MANAGER'];
// Roles allowed to approve / reject adjustments
const APPROVER_ROLES  = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'];

// All routes require a valid JWT
router.use(verifyToken);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard/kpis',              hasRole(...INVENTORY_ROLES), controller.getDashboardKPIs);
router.get('/dashboard/category-breakdown',hasRole(...INVENTORY_ROLES), controller.getStockCategoryBreakdown);
router.get('/dashboard/recent-movements',  hasRole(...INVENTORY_ROLES), controller.getRecentMovementsForDashboard);

// ─── Stock Levels ─────────────────────────────────────────────────────────────
router.get('/stock-levels',                hasRole(...INVENTORY_ROLES), controller.getStockLevels);
router.get('/stock-levels/:id',            hasRole(...INVENTORY_ROLES), controller.getStockLevelById);
router.patch('/stock-levels/:id/reorder-level',
  hasRole(...INVENTORY_ROLES),
  validate(reorderLevelSchema),
  controller.updateReorderLevel
);

// ─── Stock Movements ──────────────────────────────────────────────────────────
// /kpis must be declared before /:id to avoid route collision
router.get('/stock-movements/kpis',        hasRole(...INVENTORY_ROLES), controller.getMovementKPIs);
router.get('/stock-movements',             hasRole(...INVENTORY_ROLES), controller.getMovements);
router.post('/stock-movements',
  hasRole(...INVENTORY_ROLES),
  validate(recordMovementSchema),
  controller.recordMovement
);

// ─── Stock Adjustments ────────────────────────────────────────────────────────
router.get('/stock-adjustments',           hasRole(...INVENTORY_ROLES), controller.getAdjustments);
router.post('/stock-adjustments',
  hasRole(...INVENTORY_ROLES),
  validate(createAdjustmentSchema),
  controller.createAdjustment
);
router.patch('/stock-adjustments/:id/approve',
  hasRole(...APPROVER_ROLES),
  controller.approveAdjustment
);
router.patch('/stock-adjustments/:id/reject',
  hasRole(...APPROVER_ROLES),
  validate(rejectAdjustmentSchema),
  controller.rejectAdjustment
);

// ─── Low Stock Alerts ─────────────────────────────────────────────────────────
// /stats before /:id to avoid collision
router.get('/low-stock-alerts/stats',      hasRole(...INVENTORY_ROLES), controller.getLowStockStats);
router.get('/low-stock-alerts',            hasRole(...INVENTORY_ROLES), controller.getLowStockAlerts);

module.exports = router;
