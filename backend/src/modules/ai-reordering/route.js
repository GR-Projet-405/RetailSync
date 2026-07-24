const express = require('express');
const controller = require('./controller');
const { verifyToken, hasPermission } = require('../../middleware/auth.middleware');
const { PERMISSIONS } = require('../../config/permissions');
const {
  generateRecommendationsSchema,
  listRecommendationsSchema,
  createRecommendationSchema,
  updateStatusSchema,
  convertToPurchaseOrderSchema,
  validateBody,
  validateQuery,
} = require('./validation');

const router = express.Router();

router.use(verifyToken);

const canReadInventory = hasPermission(PERMISSIONS.INVENTORY_VIEW);
const canManageInventory = hasPermission(PERMISSIONS.INVENTORY_MANAGE);

router.get('/', canReadInventory, controller.getDetails);
router.post(
  '/generate',
  canManageInventory,
  validateBody(generateRecommendationsSchema),
  controller.generateRecommendations
);

router
  .route('/recommendations')
  .get(canReadInventory, validateQuery(listRecommendationsSchema), controller.getRecommendations)
  .post(canManageInventory, validateBody(createRecommendationSchema), controller.createRecommendation);

router
  .route('/recommendations/:id')
  .get(canReadInventory, controller.getRecommendationById);

router.patch(
  '/recommendations/:id/status',
  canManageInventory,
  validateBody(updateStatusSchema),
  controller.updateRecommendationStatus
);

router.post(
  '/recommendations/:id/convert-to-po',
  canManageInventory,
  validateBody(convertToPurchaseOrderSchema),
  controller.convertToPurchaseOrder
);

module.exports = router;
