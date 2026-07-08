const controller = require('./controller');
const express = require('express');
const router = express.Router();

router.get('/', controller.getDetails);

module.exports = router;

// ==========================================
// NEW ROUTE: GET Inventory Stats for Dashboard
// ==========================================
router.get('/stats', (req, res) => {
  // NOTE: In the future, you will use Mongoose to count real database documents
  // Example: const totalProducts = await Product.countDocuments();
  
  const inventoryStats = {
    totalProducts: 100,
    totalStockUnits: 2456,
    lowStockItems: 20,
    returnItems: 15,
    pendingOrders: 10
  };

  res.status(200).json(inventoryStats);
});

module.exports = router;