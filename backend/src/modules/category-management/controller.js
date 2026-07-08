const { validationResult } = require('express-validator');
const categoryService = require('./service');

// ── Validation Error Handler ───────────────────────────────────────────────────
const handleValidationErrors = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  return null;
};

// GET /api/categories
const getCategories = async (req, res) => {
  try {
    const result = await categoryService.fetchAll(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/categories/tree
const getCategoryTree = async (req, res) => {
  try {
    const tree = await categoryService.fetchTree();
    res.status(200).json({ success: true, data: tree });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  try {
    const result = await categoryService.fetchDetails(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/categories
const createCategory = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const category = await categoryService.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (err) {
    const status = err.message.includes('already exists') ? 409 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  try {
    if (handleValidationErrors(req, res)) return;
    const updated = await categoryService.update(
      req.params.id,
      req.body,
      req.user._id
    );
    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updated,
    });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.softDelete(req.params.id, req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCategories,
  getCategoryTree,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};