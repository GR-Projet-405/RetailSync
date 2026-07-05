// Add this line to server.js:
// app.use('/api/sales', require('./routes/salesRoutes'));

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { getSalesDashboard, getTransactions, getFilteredSales, getSaleById, exportSales } = require('../controllers/salesController');

router.get('/', authMiddleware, roleMiddleware('admin', 'branch_manager'), getTransactions);
router.get('/filter', authMiddleware, roleMiddleware('admin', 'branch_manager'), getFilteredSales);
router.get('/export', authMiddleware, roleMiddleware('admin', 'branch_manager'), exportSales);
router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('admin', 'branch_manager'),
  getSalesDashboard
);
router.get('/:id', authMiddleware, roleMiddleware('admin', 'branch_manager', 'cashier'), getSaleById);

module.exports = router;
