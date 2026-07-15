const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

/* GET /api/v1/pos-billing/ */
const getDetails = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'POS Billing module is active.',
    data: { module: 'POS Billing', status: 'Active' },
  });
});

/* POST /api/v1/pos-billing/send-receipt */
const sendReceipt = asyncHandler(async (req, res) => {
  const result = await service.sendReceipt(req.body);

  res.status(200).json({
    success: true,
    message: 'Receipt dispatch processed.',
    data: result,
  });
});

/* POST /api/v1/pos-billing/adjust-stock */
const adjustStock = asyncHandler(async (req, res) => {
  let branchId = req.user?.branchId?._id || req.user?.branchId;
  if (!branchId) {
    const Branch = require('../branch-management/branch.model');
    const defaultBranch = await Branch.findOne({ status: 'ACTIVE' });
    branchId = defaultBranch ? defaultBranch._id : null;
  }

  if (!branchId) {
    res.status(400).json({
      success: false,
      message: 'Branch identification required. Please verify user profile.'
    });
    return;
  }

  const results = await service.adjustStocks(req.body, branchId);

  res.status(200).json({
    success: true,
    message: 'Stock levels updated successfully.',
    data: results
  });
});

module.exports = { getDetails, sendReceipt, adjustStock };
