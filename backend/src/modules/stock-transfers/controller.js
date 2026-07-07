const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// Get all transfers
const getTransfers = asyncHandler(async (req, res) => {
  const data = await service.getAllTransfers(req.query);
  res.status(200).json({
    success: true,
    data,
  });
});

// Get transfer by id
const getTransferById = asyncHandler(async (req, res) => {
  const data = await service.getTransferById(req.params.id);
  res.status(200).json({
    success: true,
    data,
  });
});

// Create transfer request
const createTransfer = asyncHandler(async (req, res) => {
  const data = await service.createTransfer(req.body, req.user._id);
  res.status(201).json({
    success: true,
    message: 'Stock transfer request created successfully',
    data,
  });
});

// Update transfer status
const updateTransferStatus = asyncHandler(async (req, res) => {
  const { status, notes, driverName, vehicleNumber, estimatedTime } = req.body;
  
  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required',
    });
  }

  const data = await service.updateTransferStatus(req.params.id, status, req.user._id, notes, {
    driverName,
    vehicleNumber,
    estimatedTime,
  });
  
  res.status(200).json({
    success: true,
    message: `Transfer status updated to ${status} successfully`,
    data,
  });
});

module.exports = {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransferStatus,
};
