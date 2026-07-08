const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const createCustomer = asyncHandler(async (req, res) => {
  const customer = await service.createCustomer(req.body);
  res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: customer,
  });
});

const getCustomers = asyncHandler(async (req, res) => {
  const {
    search,
    status,
    customerType,
    page = 1,
    limit = 10,
    sortBy,
  } = req.query;

  const result = await service.getCustomers({
    search,
    status,
    customerType,
    page: Number(page),
    limit: Number(limit),
    sortBy,
  });

  res.status(200).json({
    success: true,
    message: 'Customers retrieved successfully',
    data: result,
  });
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await service.getCustomerById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Customer retrieved successfully',
    data: customer,
  });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await service.updateCustomer(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Customer updated successfully',
    data: customer,
  });
});

const deactivateCustomer = asyncHandler(async (req, res) => {
  const customer = await service.deactivateCustomer(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Customer deactivated successfully',
    data: customer,
  });
});

const getCustomerPurchaseHistory = asyncHandler(async (req, res) => {
  const history = await service.getCustomerPurchaseHistory(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Customer purchase history retrieved successfully',
    data: history,
  });
});

const getCustomerStats = asyncHandler(async (req, res) => {
  const stats = await service.getCustomerStats();
  res.status(200).json({
    success: true,
    message: 'Customer stats retrieved successfully',
    data: stats,
  });
});

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deactivateCustomer,
  getCustomerPurchaseHistory,
  getCustomerStats,
};
