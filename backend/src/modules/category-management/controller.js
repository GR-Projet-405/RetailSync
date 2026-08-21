const asyncHandler = require('../../utils/asyncHandler');
const { validationResult } = require('express-validator');
const service = require('./service');

// ── Validation Error Helper ───────────────────────────────────────────────────
// Returns true and sends a 400 response if validation failed.
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
    return true;
  }
  return false;
};

// GET /api/v1/category-management
const getCategories = asyncHandler(async (req, res) => {
  const { page, limit, status, search, isActive } = req.query;
  const result = await service.getCategories({ page, limit, status, search, isActive });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully.',
    ...result
  });
});

// GET /api/v1/category-management/tree
// Cherry-picked: hierarchical tree view for the Category Hierarchy screen
const getCategoryTree = asyncHandler(async (req, res) => {
  const tree = await service.fetchTree();
  res.status(200).json({ success: true, data: tree });
});

// GET /api/v1/category-management/:id
const getCategoryById = asyncHandler(async (req, res) => {
  const result = await service.getCategoryById(req.params.id);
  res.status(200).json({ success: true, data: result });
});

// POST /api/v1/category-management
const createCategory = asyncHandler(async (req, res) => {
  if (handleValidationErrors(req, res)) return;

  const category = await service.createCategory(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Category created successfully.',
    data: category
  });
});

// PUT /api/v1/category-management/:id
const updateCategory = asyncHandler(async (req, res) => {
  if (handleValidationErrors(req, res)) return;

  const category = await service.updateCategory(req.params.id, req.body, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Category updated successfully.',
    data: category
  });
});

// DELETE /api/v1/category-management/:id
const deleteCategory = asyncHandler(async (req, res) => {
  const result = await service.deleteCategory(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: result.message || 'Category deleted successfully.',
    data: result
  });
});

module.exports = {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
