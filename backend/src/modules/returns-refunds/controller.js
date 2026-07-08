const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const verifyReceiptHandler = asyncHandler(async (req, res) => {
  const { receiptId } = req.params;
  
  try {
    const data = await service.verifyReceipt(receiptId);
    return res.status(200).json({
      success: true,
      message: 'Receipt verified successfully.',
      data
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Internal Server Error',
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

const getHistoryHandler = asyncHandler(async (req, res) => {
  const data = await service.getReturnHistory();
  res.status(200).json({
    success: true,
    data
  });
});

module.exports = {
  verifyReceiptHandler,
  createReturnHandler,
  getReturnStatusHandler,
  getHistoryHandler 
};

const reviewReturnHandler = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const { status, internalNotes, managerId } = req.body;

  const data = await service.reviewReturnRequest(returnId, status, internalNotes, managerId);

  res.status(200).json({
    success: true,
    message: `Return request ${status} successfully.`,
    data
  });
});

module.exports = {
  verifyReceiptHandler,
  createReturnHandler,
  getReturnStatusHandler,
  getHistoryHandler,
  reviewReturnHandler 
};

const processRefundHandler = asyncHandler(async (req, res) => {
  const { returnId } = req.params;
  const { refundMethod, managerEmail, managerPassword } = req.body;

  const data = await service.processRefund(returnId, refundMethod, managerEmail, managerPassword);

  res.status(200).json({
    success: true,
    message: `Refund processed successfully.`,
    data
  });
});

module.exports = {
  verifyReceiptHandler,
  createReturnHandler,
  getReturnStatusHandler,
  getHistoryHandler,
  reviewReturnHandler,
  processRefundHandler
};
