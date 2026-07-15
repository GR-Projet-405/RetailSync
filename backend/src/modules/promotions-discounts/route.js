const express = require('express');
const router = express.Router();

// Delegation to domain sub-routers
router.use('/coupons', require('./coupon.route'));
router.use('/discount-rules', require('./discountRule.route'));
router.use('/', require('./promotion.route'));

module.exports = router;
