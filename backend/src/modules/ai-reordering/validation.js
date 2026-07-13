const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const dateValue = Joi.alternatives().try(Joi.date().iso(), Joi.date());

const generateRecommendationsSchema = Joi.object({
  startDate: dateValue.optional(),
  endDate: dateValue.optional(),
  branchId: objectId.allow('', null).optional(),
  branchCode: Joi.string().trim().max(30).uppercase().allow('', null).optional(),
  category: Joi.string().trim().max(100).allow('', null).optional(),
  coverageDays: Joi.number().integer().min(1).max(120).default(14),
  leadTimeDays: Joi.number().integer().min(0).max(90).default(7),
  safetyStockDays: Joi.number().integer().min(0).max(60).default(3),
  minimumConfidence: Joi.number().min(0).max(100).default(0),
  includeHealthy: Joi.boolean().default(false),
  replacePending: Joi.boolean().default(false),
});

const listRecommendationsSchema = Joi.object({
  startDate: dateValue.optional(),
  endDate: dateValue.optional(),
  branchId: objectId.allow('', null).optional(),
  branchCode: Joi.string().trim().max(30).uppercase().allow('', null).optional(),
  sku: Joi.string().trim().max(80).allow('', null).optional(),
  status: Joi.string()
    .valid('PENDING', 'APPROVED', 'REJECTED', 'CONVERTED_TO_PO')
    .allow('', null)
    .optional(),
  urgency: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
    .allow('', null)
    .optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const createRecommendationSchema = Joi.object({
  productId: objectId.allow('', null).optional(),
  sku: Joi.string().trim().max(80).required(),
  productName: Joi.string().trim().max(160).required(),
  category: Joi.string().trim().max(100).default('Uncategorized'),
  branchId: objectId.allow('', null).optional(),
  branchName: Joi.string().trim().max(120).default('All Branches'),
  branchCode: Joi.string().trim().max(30).uppercase().default('ALL'),
  supplierId: objectId.allow('', null).optional(),
  supplierName: Joi.string().trim().max(160).allow('').default(''),
  currentStock: Joi.number().min(0).default(0),
  reorderLevel: Joi.number().min(0).default(0),
  averageDailySales: Joi.number().min(0).default(0),
  projectedStockoutDays: Joi.number().min(0).allow(null).default(null),
  recommendedQuantity: Joi.number().integer().min(1).required(),
  confidenceScore: Joi.number().min(0).max(100).default(50),
  urgency: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').default('LOW'),
  reason: Joi.string().trim().max(700).required(),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').required(),
  decisionNote: Joi.string().trim().max(500).allow('').default(''),
});

const convertToPurchaseOrderSchema = Joi.object({
  supplierId: objectId.allow('', null).optional(),
  supplierName: Joi.string().trim().max(160).allow('').optional(),
  note: Joi.string().trim().max(500).allow('').default('Generated from AI reorder recommendation.'),
});

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Invalid query parameters',
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.query = value;
  next();
};

module.exports = {
  generateRecommendationsSchema,
  listRecommendationsSchema,
  createRecommendationSchema,
  updateStatusSchema,
  convertToPurchaseOrderSchema,
  validateBody,
  validateQuery,
};
