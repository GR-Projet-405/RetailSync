const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');

router.use(verifyToken);

// GET /api/v1/supplier-management
router.get('/', hasPermission(PERMISSIONS.SUPPLIERS_VIEW), controller.getSuppliers);
// GET /api/v1/supplier-management/:id
router.get('/:id', hasPermission(PERMISSIONS.SUPPLIERS_VIEW), controller.getSupplierById);
// POST /api/v1/supplier-management
router.post('/', hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.createSupplier);
// PUT /api/v1/supplier-management/:id
router.put('/:id', hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.updateSupplier);
// PATCH /api/v1/supplier-management/:id/deactivate
router.patch('/:id/deactivate', hasPermission(PERMISSIONS.SUPPLIERS_MANAGE), controller.deactivateSupplier);

module.exports = router;
