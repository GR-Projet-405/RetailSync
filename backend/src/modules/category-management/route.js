const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const controller = require('./controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');

// NOTE: permissions.js has no dedicated CATEGORIES_* entries yet, so this
// module reuses PRODUCTS_* permissions (categories are part of the product
// catalogue per REQ-PROD-002). If you'd rather have separate permissions,
// add CATEGORIES_VIEW / CATEGORIES_CREATE / CATEGORIES_EDIT / CATEGORIES_DELETE
// to permissions.js and swap them in below.

router.use(verifyToken);

// ── Validation Rules (cherry-picked from Product Management branch) ────────────
const categoryValidation = [
  check('name', 'Category name is required').not().isEmpty(),
  check('name', 'Category name must be at least 2 characters').isLength({ min: 2 }),
  check('name', 'Category name cannot exceed 100 characters').isLength({ max: 100 }),
  check('parentCategory', 'Invalid parent category ID').optional({ nullable: true }).isMongoId(),
  check('sortOrder', 'Sort order must be a positive number').optional().isInt({ min: 0 })
];

// ── Read routes ───────────────────────────────────────────────────────────────
// NOTE: '/tree' must be declared before '/:id' or Express treats "tree" as an :id
router.get('/tree', hasPermission(PERMISSIONS.PRODUCTS_VIEW), controller.getCategoryTree);
router.get('/',     hasPermission(PERMISSIONS.PRODUCTS_VIEW), controller.getCategories);
router.get('/:id',  hasPermission(PERMISSIONS.PRODUCTS_VIEW), controller.getCategoryById);

// ── Write routes ──────────────────────────────────────────────────────────────
router.post(
  '/',
  hasPermission(PERMISSIONS.PRODUCTS_CREATE),
  categoryValidation,
  controller.createCategory
);

router.put(
  '/:id',
  hasPermission(PERMISSIONS.PRODUCTS_EDIT),
  categoryValidation,
  controller.updateCategory
);

router.delete(
  '/:id',
  hasPermission(PERMISSIONS.PRODUCTS_DELETE),
  controller.deleteCategory
);

module.exports = router;