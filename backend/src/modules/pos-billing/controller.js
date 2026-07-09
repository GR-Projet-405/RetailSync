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

module.exports = { getDetails, sendReceipt };
