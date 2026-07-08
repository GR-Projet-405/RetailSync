const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');

// NOTE: permissions.js has no dedicated CATEGORIES_* entries yet, so this
// module reuses PRODUCTS_* permissions (categories are part of the product
// catalogue per REQ-PROD-002). If you'd rather have separate permissions,
// add CATEGORIES_VIEW / CATEGORIES_CREATE / CATEGORIES_EDIT / CATEGORIES_DELETE
// to permissions.js and swap them in below.

router.use(verifyToken);

router.get('/', hasPermission(PERMISSIONS.PRODUCTS_VIEW), controller.getCategories);
router.get('/:id', hasPermission(PERMISSIONS.PRODUCTS_VIEW), controller.getCategoryById);
router.post('/', hasPermission(PERMISSIONS.PRODUCTS_CREATE), controller.createCategory);
router.put('/:id', hasPermission(PERMISSIONS.PRODUCTS_EDIT), controller.updateCategory);
router.delete('/:id', hasPermission(PERMISSIONS.PRODUCTS_DELETE), controller.deleteCategory);

module.exports = router;
