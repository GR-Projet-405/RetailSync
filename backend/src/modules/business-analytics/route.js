const express = require('express');
const controller = require('./controller');
const { verifyToken, hasPermission, hasRole } = require('../../middleware/auth.middleware');
const {
  createSnapshotSchema,
  updateSnapshotSchema,
  analyticsQuerySchema,
  validateBody,
  validateQuery,
} = require('./validation');

const router = express.Router();

router.use(verifyToken);

const canReadAnalytics = hasPermission('reports.view');
const canManageSnapshots = hasRole('SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER');

router.get('/', canReadAnalytics, controller.getDetails);
router.get('/summary', canReadAnalytics, validateQuery(analyticsQuerySchema), controller.getSummary);
router.get('/sales-trends', canReadAnalytics, validateQuery(analyticsQuerySchema), controller.getSalesTrends);
router.get('/top-products', canReadAnalytics, validateQuery(analyticsQuerySchema), controller.getTopProducts);
router.get('/branch-performance', canReadAnalytics, validateQuery(analyticsQuerySchema), controller.getBranchPerformance);
router.get('/inventory-health', canReadAnalytics, validateQuery(analyticsQuerySchema), controller.getInventoryHealth);

router
  .route('/snapshots')
  .get(canReadAnalytics, validateQuery(analyticsQuerySchema), controller.getSnapshots)
  .post(canManageSnapshots, validateBody(createSnapshotSchema), controller.createSnapshot);

router
  .route('/snapshots/:id')
  .get(canReadAnalytics, controller.getSnapshotById)
  .put(canManageSnapshots, validateBody(updateSnapshotSchema), controller.updateSnapshot)
  .delete(canManageSnapshots, controller.deleteSnapshot);

module.exports = router;
