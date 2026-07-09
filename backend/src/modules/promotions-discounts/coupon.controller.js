const asyncHandler = require('../../utils/asyncHandler');
const service = require('./coupon.service');

// ─── GET /api/v1/promotions-discounts/coupons ───────────────
const getCoupons = asyncHandler(async (req, res) => {
  const { search, status, branchId, page = 1, limit = 10 } = req.query;

  const result = await service.getCoupons({
    search,
    status,
    branchId,
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: 'Coupons retrieved successfully',
    data: result,
  });
});

// ─── GET /api/v1/promotions-discounts/coupons/:id ───────────
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await service.getCouponById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Coupon details retrieved successfully',
    data: coupon,
  });
});

// ─── POST /api/v1/promotions-discounts/coupons ──────────────
const createCoupon = asyncHandler(async (req, res) => {
  // Automatically inject creator ID from active request context
  const couponData = {
    ...req.body,
    createdBy: req.user._id,
  };

  const coupon = await service.createCoupon(couponData);

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon,
  });
});

// ─── PUT /api/v1/promotions-discounts/coupons/:id ───────────
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await service.updateCoupon(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon,
  });
});

// ─── DELETE /api/v1/promotions-discounts/coupons/:id ────────
const deleteCoupon = asyncHandler(async (req, res) => {
  const result = await service.deleteCoupon(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully',
    data: result,
  });
});

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
