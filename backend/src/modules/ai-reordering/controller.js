const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const sendSuccess = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: true,
    message,
    timestamp: new Date().toISOString(),
    data,
  });
};

const getDetails = asyncHandler(async (req, res) => {
  const data = await service.getModuleDetails();
  sendSuccess(res, 200, 'AI Reordering module is active.', data);
});

const generateRecommendations = asyncHandler(async (req, res) => {
  const data = await service.generateRecommendations(req.body, req.user?._id);
  sendSuccess(res, 201, 'AI reorder recommendations generated successfully.', data);
});

const getRecommendations = asyncHandler(async (req, res) => {
  const data = await service.getRecommendations(req.query);
  sendSuccess(res, 200, 'AI reorder recommendations retrieved successfully.', data);
});

const getRecommendationById = asyncHandler(async (req, res) => {
  const data = await service.getRecommendationById(req.params.id);
  sendSuccess(res, 200, 'AI reorder recommendation retrieved successfully.', data);
});

const createRecommendation = asyncHandler(async (req, res) => {
  const data = await service.createRecommendation(req.body, req.user?._id);
  sendSuccess(res, 201, 'AI reorder recommendation created successfully.', data);
});

const updateRecommendationStatus = asyncHandler(async (req, res) => {
  const data = await service.updateRecommendationStatus(req.params.id, req.body, req.user?._id);
  sendSuccess(res, 200, 'AI reorder recommendation status updated successfully.', data);
});

const convertToPurchaseOrder = asyncHandler(async (req, res) => {
  const data = await service.convertToPurchaseOrder(req.params.id, req.body, req.user?._id);
  sendSuccess(res, 200, 'AI reorder recommendation converted to purchase order draft.', data);
});

module.exports = {
  getDetails,
  generateRecommendations,
  getRecommendations,
  getRecommendationById,
  createRecommendation,
  updateRecommendationStatus,
  convertToPurchaseOrder,
};
