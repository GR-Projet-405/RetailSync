const asyncHandler = require('../../utils/asyncHandler');
const service = require('./discountRule.service');

// ─── GET /api/v1/promotions-discounts/discount-rules ────────
const getDiscountRules = asyncHandler(async (req, res) => {
  const { search, type, status, page = 1, limit = 10 } = req.query;

  const result = await service.getDiscountRules({
    search,
    type,
    status,
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: 'Discount rules retrieved successfully',
    data: result,
  });
});

// ─── GET /api/v1/promotions-discounts/discount-rules/:id ────
const getDiscountRuleById = asyncHandler(async (req, res) => {
  const rule = await service.getDiscountRuleById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Discount rule details retrieved successfully',
    data: rule,
  });
});

// ─── POST /api/v1/promotions-discounts/discount-rules ───────
const createDiscountRule = asyncHandler(async (req, res) => {
  // Automatically inject creator ID from authorization session
  const ruleData = {
    ...req.body,
    createdBy: req.user._id,
  };

  const rule = await service.createDiscountRule(ruleData);

  res.status(201).json({
    success: true,
    message: 'Discount rule created successfully',
    data: rule,
  });
});

// ─── PUT /api/v1/promotions-discounts/discount-rules/:id ─────
const updateDiscountRule = asyncHandler(async (req, res) => {
  const rule = await service.updateDiscountRule(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Discount rule updated successfully',
    data: rule,
  });
});

// ─── DELETE /api/v1/promotions-discounts/discount-rules/:id ──
const deleteDiscountRule = asyncHandler(async (req, res) => {
  const result = await service.deleteDiscountRule(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Discount rule deleted successfully',
    data: result,
  });
});

// ─── PUT /api/v1/promotions-discounts/discount-rules/reorder ─
const reorderRules = asyncHandler(async (req, res) => {
  const { ruleIds } = req.body;
  const result = await service.reorderRules(ruleIds);

  res.status(200).json({
    success: true,
    message: 'Discount rules prioritized successfully',
    data: result,
  });
});

// ─── POST /api/v1/promotions-discounts/discount-rules/evaluate ─
const evaluateDiscountRules = asyncHandler(async (req, res) => {
  const result = await service.evaluateRules(req.body);

  res.status(200).json({
    success: true,
    message: 'Discount rules evaluated successfully',
    matchedRules: result.matchedRules,
    summary: result.summary,
    data: {
      matchedRules: result.matchedRules,
      summary: result.summary,
    },
  });
});

module.exports = {
  getDiscountRules,
  getDiscountRuleById,
  createDiscountRule,
  updateDiscountRule,
  deleteDiscountRule,
  reorderRules,
  evaluateDiscountRules,
};
