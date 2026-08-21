// Add this line to server.js:
// app.use('/api/sales', require('./routes/salesRoutes'));

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../src/middleware/auth.middleware');
const { authorize } = require('../middleware/roleMiddleware');
const { getSalesDashboard, getTransactions, getFilteredSales, getSaleById, exportSales } = require('../controllers/salesController');

router.get('/', verifyToken, authorize('admin', 'branch_manager'), getTransactions);
router.get('/filter', verifyToken, authorize('admin', 'branch_manager'), getFilteredSales);
router.get('/export', verifyToken, authorize('admin', 'branch_manager'), exportSales);
router.get(
  '/dashboard',
  verifyToken,
  authorize('admin', 'branch_manager'),
  getSalesDashboard
);
router.get('/:id', verifyToken, authorize('admin', 'branch_manager', 'cashier'), getSaleById);

module.exports = router;
