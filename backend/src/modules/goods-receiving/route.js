// const express = require('express');
// const router = express.Router();
// const controller = require('./controller');

// router.get('/', controller.getDetails);

// module.exports = router;
const express = require('express');
const router = express.Router();
const controller = require('./controller');

// If your project's auth/permission middleware lives elsewhere, adjust these two requires.
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');

// All Goods Receiving routes require a logged-in user
router.use(verifyToken);

/* --------------------------- Dashboard --------------------------- */
// GET /api/v1/goods-receiving/dashboard
router.get('/dashboard', hasPermission(PERMISSIONS.GOODS_RECEIVING_VIEW), controller.getDashboardStats);

/* ------------------------ Goods Receipt Form ----------------------- */
// POST /api/v1/goods-receiving
router.post('/', hasPermission(PERMISSIONS.GOODS_RECEIVING_CREATE), controller.createReceipt);
// GET /api/v1/goods-receiving/:id  (fetch a single receipt, e.g. "Preview Receipt")
router.get('/:id', hasPermission(PERMISSIONS.GOODS_RECEIVING_VIEW), controller.getReceiptById);

/* --------------------- Received Items History ---------------------- */
// GET /api/v1/goods-receiving/history/list
router.get('/history/list', hasPermission(PERMISSIONS.GOODS_RECEIVING_VIEW), controller.getReceivedItemsHistory);

/* --------------------------- Reports -------------------------------- */
// GET /api/v1/goods-receiving/reports/summary
router.get('/reports/summary', hasPermission(PERMISSIONS.REPORTS_VIEW), controller.getReceivingReports);

/* ------------------------ Verification Screen ------------------------ */
// GET /api/v1/goods-receiving/:id/verify
router.get('/:id/verify', hasPermission(PERMISSIONS.GOODS_RECEIVING_VERIFY), controller.getReceiptForVerification);
// PATCH /api/v1/goods-receiving/:id/items/:itemId/verify
router.patch(
  '/:id/items/:itemId/verify',
  hasPermission(PERMISSIONS.GOODS_RECEIVING_VERIFY),
  controller.verifyItem
);
// PATCH /api/v1/goods-receiving/:id/approve-all
router.patch('/:id/approve-all', hasPermission(PERMISSIONS.GOODS_RECEIVING_VERIFY), controller.approveAll);
// PATCH /api/v1/goods-receiving/:id/partial-approve
router.patch('/:id/partial-approve', hasPermission(PERMISSIONS.GOODS_RECEIVING_VERIFY), controller.partialApprove);
// PATCH /api/v1/goods-receiving/:id/reject
router.patch('/:id/reject', hasPermission(PERMISSIONS.GOODS_RECEIVING_VERIFY), controller.rejectReceipt);
// PATCH /api/v1/goods-receiving/:id/flag
router.patch('/:id/flag', hasPermission(PERMISSIONS.GOODS_RECEIVING_VERIFY), controller.flagForManager);

module.exports = router;
