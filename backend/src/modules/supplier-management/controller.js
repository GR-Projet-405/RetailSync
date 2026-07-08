const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await service.getSuppliers(req.query);
  res.status(200).json({ success: true, data: suppliers });
});

const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await service.getSupplierById(req.params.id);
  res.status(200).json({ success: true, data: supplier });
});

const createSupplier = asyncHandler(async (req, res) => {
  const supplier = await service.createSupplier(req.body);
  res.status(201).json({ success: true, data: supplier });
});

const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await service.updateSupplier(req.params.id, req.body);
  res.status(200).json({ success: true, data: supplier });
});

const deactivateSupplier = asyncHandler(async (req, res) => {
  const supplier = await service.deactivateSupplier(req.params.id);
  res.status(200).json({ success: true, data: supplier });
});

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deactivateSupplier,
};
