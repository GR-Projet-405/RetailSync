const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');

// Secure all Warehouse Management routes
router.use(verifyToken);

router.get('/', hasPermission(PERMISSIONS.INVENTORY_VIEW), controller.getWarehouses);
router.post('/', hasPermission(PERMISSIONS.INVENTORY_MANAGE), controller.createWarehouse);
router.get('/:id', hasPermission(PERMISSIONS.INVENTORY_VIEW), controller.getWarehouseById);
router.get('/:id/locations', hasPermission(PERMISSIONS.INVENTORY_VIEW), controller.getWarehouseLocations);

module.exports = router;
