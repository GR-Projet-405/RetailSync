const express = require('express');
const router = express.Router();
const controller = require('./coupon.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Protect all coupon routes
router.use(verifyToken);

// ─── Collection Routes ─────────────────────────────────────
router.route('/')
  .get(controller.getCoupons)
  .post(controller.createCoupon);

// ─── Single Resource Routes ────────────────────────────────
router.route('/:id')
  .get(controller.getCouponById)
  .put(controller.updateCoupon)
  .delete(controller.deleteCoupon);

module.exports = router;
