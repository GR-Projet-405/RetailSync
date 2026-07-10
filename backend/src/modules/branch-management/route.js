const express = require('express');
const router = express.Router();
const controller = require('./branch.controller');
const { verifyToken, hasRole, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');
const asyncHandler = require('../../utils/asyncHandler');

// All routes require authentication
router.use(verifyToken);

// Manager specific route (derived from user token)
router.get('/my-branch/dashboard', hasRole('BRANCH_MANAGER', 'SUPER_ADMIN'), asyncHandler(controller.getMyDashboard));

// Admin specific dashboard
router.get('/admin/comparison', hasPermission(PERMISSIONS.BRANCHES_VIEW), asyncHandler(controller.getAdminComparison));

// Active branches list (must be before /:id)
router.get('/active', asyncHandler(controller.getActiveBranches));

// Collection routes
router.route('/')
  .get(hasPermission(PERMISSIONS.BRANCHES_VIEW), asyncHandler(controller.getBranches))
  .post(hasPermission(PERMISSIONS.BRANCHES_MANAGE), asyncHandler(controller.createBranch));

// Individual branch routes
router.route('/:id')
  .get(hasPermission(PERMISSIONS.BRANCHES_VIEW), asyncHandler(controller.getBranchById))
  .patch(hasPermission(PERMISSIONS.BRANCHES_MANAGE), asyncHandler(controller.updateBranch));

router.patch('/:id/status', hasPermission(PERMISSIONS.BRANCHES_MANAGE), asyncHandler(controller.updateBranchStatus));
router.patch('/:id/manager', hasPermission(PERMISSIONS.BRANCHES_MANAGE), asyncHandler(controller.assignManager));

// Branch detail tabs
router.get('/:id/dashboard', hasPermission(PERMISSIONS.BRANCHES_VIEW), asyncHandler(controller.getBranchDashboard));
router.get('/:id/employees', hasPermission(PERMISSIONS.BRANCHES_VIEW), asyncHandler(controller.getBranchEmployees));
router.get('/:id/inventory-summary', hasPermission(PERMISSIONS.BRANCHES_VIEW), asyncHandler(controller.getBranchInventory));
router.get('/:id/transfers', hasPermission(PERMISSIONS.BRANCHES_VIEW), asyncHandler(controller.getBranchTransfers));
router.get('/:id/audit-logs', hasPermission(PERMISSIONS.AUDITLOGS_VIEW), asyncHandler(controller.getBranchAuditLogs));

router.get('/', hasPermission('branches.view'), controller.getBranches);

module.exports = router;