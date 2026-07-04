const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.use(verifyToken);

router.post('/', controller.createCustomer);
router.get('/', controller.getCustomers);
router.get('/stats', controller.getCustomerStats);
router.get('/:id', controller.getCustomerById);
router.put('/:id', controller.updateCustomer);
router.patch('/:id/deactivate', controller.deactivateCustomer);
router.get('/:id/purchase-history', controller.getCustomerPurchaseHistory);

module.exports = router;
