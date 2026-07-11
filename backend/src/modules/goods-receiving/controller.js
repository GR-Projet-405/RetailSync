const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

/* ------------------------- Goods Receipt Form ------------------------- */
const createReceipt = asyncHandler(async (req, res) => {
  const receipt = await service.createReceipt(req.body, req.user);
  res.status(201).json({ success: true, data: receipt });
});

const getReceiptById = asyncHandler(async (req, res) => {
  const receipt = await service.getReceiptById(req.params.id);
  res.status(200).json({ success: true, data: receipt });
});

/* --------------------------- Receiving Dashboard --------------------------- */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await service.getDashboardStats(req.query);
  res.status(200).json({ success: true, data: stats });
});

/* ------------------------ Received Items History ------------------------ */
const getReceivedItemsHistory = asyncHandler(async (req, res) => {
  const result = await service.getReceivedItemsHistory(req.query);
  res.status(200).json({ success: true, ...result });
});

/* ------------------------------ Receiving Reports ------------------------------ */
const getReceivingReports = asyncHandler(async (req, res) => {
  const report = await service.getReceivingReports(req.query);
  res.status(200).json({ success: true, data: report });
});

/* ------------------------------ Verification Screen ------------------------------ */
const getReceiptForVerification = asyncHandler(async (req, res) => {
  const receipt = await service.getReceiptForVerification(req.params.id);
  res.status(200).json({ success: true, data: receipt });
});

const verifyItem = asyncHandler(async (req, res) => {
  const { action, note } = req.body;
  const receipt = await service.verifyItem(req.params.id, req.params.itemId, action, note);
  res.status(200).json({ success: true, data: receipt });
});

const approveAll = asyncHandler(async (req, res) => {
  const receipt = await service.approveAll(req.params.id, req.user, req.body.notes);
  res.status(200).json({ success: true, data: receipt });
});

const partialApprove = asyncHandler(async (req, res) => {
  const { approvedItemIds, notes } = req.body;
  const receipt = await service.partialApprove(req.params.id, approvedItemIds, req.user, notes);
  res.status(200).json({ success: true, data: receipt });
});

const rejectReceipt = asyncHandler(async (req, res) => {
  const receipt = await service.rejectReceipt(req.params.id, req.body.reason);
  res.status(200).json({ success: true, data: receipt });
});

const flagForManager = asyncHandler(async (req, res) => {
  const receipt = await service.flagForManager(req.params.id, req.body.notes);
  res.status(200).json({ success: true, data: receipt });
});

module.exports = {
  createReceipt,
  getReceiptById,
  getDashboardStats,
  getReceivedItemsHistory,
  getReceivingReports,
  getReceiptForVerification,
  verifyItem,
  approveAll,
  partialApprove,
  rejectReceipt,
  flagForManager,
};

// const asyncHandler = require('../../utils/asyncHandler');
// const service = require('./service');

// // GET Boilerplate handler
// const getDetails = asyncHandler(async (req, res) => {
//   const data = await service.fetchDetails();
//   res.status(200).json({
//     success: true,
//     message: 'Goods Receiving module active. Under development.',
//     timestamp: new Date().toISOString(),
//     data
//   });
// });

// module.exports = {
//   getDetails
// };
