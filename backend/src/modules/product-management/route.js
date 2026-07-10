const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');

// All Product Management routes require a valid session (REQ-AUTH-002)
router.use(verifyToken);

// NOTE: '/search' must be declared before '/:id' or Express will treat
// "search" as an :id param.
router.get('/search', hasPermission(PERMISSIONS.PRODUCTS_VIEW), controller.searchProducts);

router.get('/',     hasPermission(PERMISSIONS.PRODUCTS_VIEW),   controller.getProducts);
router.get('/:id',  hasPermission(PERMISSIONS.PRODUCTS_VIEW),   controller.getProductById);

router.post('/',    hasPermission(PERMISSIONS.PRODUCTS_CREATE),  controller.createProduct);
router.put('/:id',  hasPermission(PERMISSIONS.PRODUCTS_EDIT),    controller.updateProduct);
router.delete('/:id', hasPermission(PERMISSIONS.PRODUCTS_DELETE), controller.deleteProduct);

module.exports = router;