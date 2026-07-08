const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getCategories = asyncHandler(async (req, res) => {
  const { page, limit, status, search } = req.query;
  const result = await service.getCategories({ page, limit, status, search });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully.',
    ...result
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await service.getCategoryById(req.params.id);
  res.status(200).json({ success: true, data: category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await service.createCategory(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Category created successfully.',
    data: category
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await service.updateCategory(req.params.id, req.body, req.user._id);
  res.status(200).json({
    success: true,
    message: 'Category updated successfully.',
    data: category
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const result = await service.deleteCategory(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Category deleted successfully.',
    data: result
  });
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
