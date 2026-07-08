const express = require('express');
const router = express.Router();
const controller = require('./promotion.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Protect all routes under this module
router.use(verifyToken);

// ─── Collection Routes ─────────────────────────────────────
router.get('/', controller.getPromotions);
router.get('/stats', controller.getPromotionStats);
router.get('/details', controller.getDetails);
router.get('/analytics', controller.getPromotionAnalytics);
router.post('/', controller.createPromotion);

// ─── Coupon Sub-Routes ─────────────────────────────────────
router.use('/coupons', require('./coupon.route'));

// ─── Single Resource Routes ────────────────────────────────
router.get('/:id', controller.getPromotionById);
router.put('/:id', controller.updatePromotion);
router.delete('/:id', controller.deletePromotion);

module.exports = router;
