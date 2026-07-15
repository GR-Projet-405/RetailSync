const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getWarehouses = asyncHandler(async (req, res) => {
  const data = await service.getWarehouses();
  res.status(200).json({
    success: true,
    message: 'Warehouse inventory summary loaded.',
    timestamp: new Date().toISOString(),
    data
  });
});

const getWarehouseById = asyncHandler(async (req, res) => {
  const data = await service.getWarehouseById(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Warehouse details loaded.',
    timestamp: new Date().toISOString(),
    data
  });
});

const createWarehouse = asyncHandler(async (req, res) => {
  const data = await service.createWarehouse(req.body);
  res.status(201).json({
    success: true,
    message: 'Warehouse created successfully.',
    timestamp: new Date().toISOString(),
    data
  });
});

const getWarehouseLocations = asyncHandler(async (req, res) => {
  const data = await service.getWarehouseLocations(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Warehouse locations loaded.',
    timestamp: new Date().toISOString(),
    data
  });
});

module.exports = {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  getWarehouseLocations
};
