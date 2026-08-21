const express = require('express');
const router = express.Router();
const controller = require('./discountRule.controller');
const { verifyToken, hasRole } = require('../../middleware/auth.middleware');

const MANAGER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'];

// Protect all routes
router.use(verifyToken);

// ─── Collection & Custom Actions ───────────────────────────
router.route('/')
  .get(controller.getDiscountRules)
  .post(hasRole(...MANAGER_ROLES), controller.createDiscountRule);

router.put('/reorder', hasRole(...MANAGER_ROLES), controller.reorderRules);
router.post('/evaluate', controller.evaluateDiscountRules);

// ─── Single Resource Actions ───────────────────────────────
router.route('/:id')
  .get(controller.getDiscountRuleById)
  .put(hasRole(...MANAGER_ROLES), controller.updateDiscountRule)
  .delete(hasRole(...MANAGER_ROLES), controller.deleteDiscountRule);

module.exports = router;
