const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');


const verifyReceiptHandler = asyncHandler(async (req, res) => {
  const { receiptId } = req.params;
  
  try {
    const data = await service.verifyReceipt(receiptId);
    res.status(200).json({
      success: true,
      message: 'Receipt verified successfully.',
      data
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
      isExpired: error.isExpired || false
    });
  }
});


const createReturnHandler = asyncHandler(async (req, res) => {
  const returnRequest = await service.createReturnRequest(req.body);
  res.status(201).json({
    success: true,
    message: 'Return request submitted successfully.',
    data: returnRequest
  });
});


const getReturnStatusHandler = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const data = await service.getReturnByReturnId(returnId);
  res.status(200).json({
    success: true,
    data
  });
});

module.exports = {
  verifyReceiptHandler,
  createReturnHandler,
  getReturnStatusHandler
};