const express = require('express');
const router = express.Router();
const controller = require('./coupon.controller');
const { verifyToken, hasRole } = require('../../middleware/auth.middleware');

const MANAGER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'];

// Protect all coupon routes
router.use(verifyToken);

// ─── Integration Routes ───────────────────────────────────
router.post('/validate', controller.validateCoupon);
router.post('/use', controller.recordCouponUsage);

// ─── Collection Routes ─────────────────────────────────────
router.route('/')
  .get(controller.getCoupons)
  .post(hasRole(...MANAGER_ROLES), controller.createCoupon);

// ─── Single Resource Routes ────────────────────────────────
router.route('/:id')
  .get(controller.getCouponById)
  .put(hasRole(...MANAGER_ROLES), controller.updateCoupon)
  .delete(hasRole(...MANAGER_ROLES), controller.deleteCoupon);

module.exports = router;
