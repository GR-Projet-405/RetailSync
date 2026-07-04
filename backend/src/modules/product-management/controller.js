// const asyncHandler = require('../../utils/asyncHandler');
// const service = require('./service');

// // GET Boilerplate handler
// const getDetails = asyncHandler(async (req, res) => {
//   const data = await service.fetchDetails();
//   res.status(200).json({
//     success: true,
//     message: 'Product Management module active. Under development.',
//     timestamp: new Date().toISOString(),
//     data
//   });
// });

// module.exports = {
//   getDetails
// };
const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// POST /api/v1/product-management
// REQ-PROD-001 - Add New Product screen
const createProduct = asyncHandler(async (req, res) => {
  const branch = req.body.branch || req.user.branchId?._id;
  const product = await service.createProduct({ ...req.body, branch }, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: product
  });
});

// GET /api/v1/product-management
// Product List screen
const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, category, status, search } = req.query;
  const branch = req.user.branchId?._id;

  const result = await service.getProducts({ page, limit, category, status, search, branch });

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully.',
    ...result
  });
});

// GET /api/v1/product-management/search
// Product Search screen
const searchProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, inStock, page, limit, sortBy } = req.query;
  const branch = req.user.branchId?._id;

  const result = await service.searchProducts({
    q,
    category,
    minPrice,
    maxPrice,
    inStock: inStock === 'true',
    page,
    limit,
    sortBy,
    branch
  });

  res.status(200).json({
    success: true,
    message: `Found ${result.pagination.total} results${q ? ` for "${q}"` : ''}.`,
    ...result
  });
});

// GET /api/v1/product-management/:id
// Product Details screen
const getProductById = asyncHandler(async (req, res) => {
  const product = await service.getProductById(req.params.id);

  res.status(200).json({
    success: true,
    data: product
  });
});

// PUT /api/v1/product-management/:id
// Edit Product screen
const updateProduct = asyncHandler(async (req, res) => {
  const product = await service.updateProduct(req.params.id, req.body, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    data: product
  });
});

// DELETE /api/v1/product-management/:id
// "Delete this product" action on Edit Product screen
const deleteProduct = asyncHandler(async (req, res) => {
  const result = await service.deleteProduct(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully.',
    data: result
  });
});

module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
