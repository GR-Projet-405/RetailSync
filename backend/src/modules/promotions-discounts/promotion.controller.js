const asyncHandler = require('../../utils/asyncHandler');
const service = require('./promotion.service');

// ─── GET /api/v1/promotions-discounts ───────────────────────
const getPromotions = asyncHandler(async (req, res) => {
  const { search, status, branchId, page = 1, limit = 10 } = req.query;

  const result = await service.getPromotions({
    search,
    status,
    branchId,
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: 'Promotions retrieved successfully',
    data: result,
  });
});

// ─── GET /api/v1/promotions-discounts/stats ─────────────────
const getPromotionStats = asyncHandler(async (req, res) => {
  const { branchId } = req.query;
  const stats = await service.getPromotionStats(branchId);

  res.status(200).json({
    success: true,
    message: 'Promotion statistics retrieved successfully',
    data: stats,
  });
});

// ─── GET /api/v1/promotions-discounts/:id ───────────────────
const getPromotionById = asyncHandler(async (req, res) => {
  const promotion = await service.getPromotionById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Promotion details retrieved successfully',
    data: promotion,
  });
});

// ─── POST /api/v1/promotions-discounts ──────────────────────
const createPromotion = asyncHandler(async (req, res) => {
  // Attach user ID from verifyToken middleware
  const promotionData = {
    ...req.body,
    createdBy: req.user._id,
  };

  const promotion = await service.createPromotion(promotionData);

  res.status(201).json({
    success: true,
    message: 'Promotion created successfully',
    data: promotion,
  });
});

// ─── PUT /api/v1/promotions-discounts/:id ────────────────────
const updatePromotion = asyncHandler(async (req, res) => {
  const promotion = await service.updatePromotion(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Promotion updated successfully',
    data: promotion,
  });
});

// ─── DELETE /api/v1/promotions-discounts/:id ─────────────────
const deletePromotion = asyncHandler(async (req, res) => {
  const result = await service.deletePromotion(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Promotion deleted successfully',
    data: result,
  });
});

// ─── GET /api/v1/promotions-discounts/details (Original Boilerplate) ───
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'Promotions & Discounts module active.',
    timestamp: new Date().toISOString(),
    data,
  });
});

// ─── GET /api/v1/promotions-discounts/analytics ──────────────
const getPromotionAnalytics = asyncHandler(async (req, res) => {
  const analytics = await service.getPromotionAnalytics();

  res.status(200).json({
    success: true,
    message: 'Promotion monthly analytics retrieved successfully',
    data: analytics,
  });
});

module.exports = {
  getPromotions,
  getPromotionStats,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getDetails,
  getPromotionAnalytics
};
