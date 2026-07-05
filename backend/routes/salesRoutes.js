// Add this line to server.js:
// app.use('/api/sales', require('./routes/salesRoutes'));

const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');
const { getSalesDashboard } = require('../controllers/salesController');

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware('admin', 'branch_manager'),
  getSalesDashboard
);

module.exports = router;
