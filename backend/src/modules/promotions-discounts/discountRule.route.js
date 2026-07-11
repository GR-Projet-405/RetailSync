const express = require('express');
const router = express.Router();
const controller = require('./discountRule.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

// Protect all routes
router.use(verifyToken);

// ─── Collection & Custom Actions ───────────────────────────
router.route('/')
  .get(controller.getDiscountRules)
  .post(controller.createDiscountRule);

router.put('/reorder', controller.reorderRules);
router.post('/evaluate', controller.evaluateDiscountRules);

// ─── Single Resource Actions ───────────────────────────────
router.route('/:id')
  .get(controller.getDiscountRuleById)
  .put(controller.updateDiscountRule)
  .delete(controller.deleteDiscountRule);

module.exports = router;
