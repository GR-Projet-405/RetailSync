const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const categoryController = require('./controller');

// ✅ Fix: correct filename (auth.middleware.js) + correct function names
const { verifyToken, hasRole } = require('../../middleware/auth.middleware');

// ── Validation Rules ──────────────────────────────────────────────────────────
const categoryValidation = [
  check('name', 'Category name is required').not().isEmpty(),
  check('name', 'Category name must be at least 2 characters').isLength({ min: 2 }),
  check('name', 'Category name cannot exceed 100 characters').isLength({ max: 100 }),
  check('parentId', 'Invalid parent category ID').optional({ nullable: true }).isMongoId(),
  check('sortOrder', 'Sort order must be a positive number').optional().isInt({ min: 1 }),
];

// ── Read routes (all authenticated roles) ─────────────────────────────────────
router.get('/', verifyToken, categoryController.getCategories);
router.get('/tree', verifyToken, categoryController.getCategoryTree);
router.get('/:id', verifyToken, categoryController.getCategoryById);

// ── Write routes (Admin & Branch Manager only) ────────────────────────────────
router.post(
  '/',
  verifyToken,
  hasRole('ADMIN', 'BRANCH_MANAGER'),
  categoryValidation,
  categoryController.createCategory
);

router.put(
  '/:id',
  verifyToken,
  hasRole('ADMIN', 'BRANCH_MANAGER'),
  categoryValidation,
  categoryController.updateCategory
);

router.delete(
  '/:id',
  verifyToken,
  hasRole('ADMIN', 'BRANCH_MANAGER'),
  categoryController.deleteCategory
);

module.exports = router;