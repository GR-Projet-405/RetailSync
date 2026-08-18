const express = require('express');
const router = express.Router();
const controller = require('./promotion.controller');
const { verifyToken, hasRole } = require('../../middleware/auth.middleware');

const MANAGER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'];

// Protect all routes under this module
router.use(verifyToken);

// ─── Collection Routes ─────────────────────────────────────
router.get('/', controller.getPromotions);
router.get('/stats', controller.getPromotionStats);
router.get('/details', controller.getDetails);
router.get('/analytics', controller.getPromotionAnalytics);
router.post('/', hasRole(...MANAGER_ROLES), controller.createPromotion);

// ─── Coupon Sub-Routes ─────────────────────────────────────
router.use('/coupons', require('./coupon.route'));

// ─── Single Resource Routes ────────────────────────────────
router.get('/:id', controller.getPromotionById);
router.put('/:id', hasRole(...MANAGER_ROLES), controller.updatePromotion);
router.delete('/:id', hasRole(...MANAGER_ROLES), controller.deletePromotion);

module.exports = router;
