const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const dateValue = Joi.alternatives().try(Joi.date().iso(), Joi.date());

const productMetricSchema = Joi.object({
  productId: objectId.allow(null, '').optional(),
  sku: Joi.string().trim().max(80).required(),
  name: Joi.string().trim().max(160).required(),
  category: Joi.string().trim().max(100).default('Uncategorized'),
  quantitySold: Joi.number().min(0).default(0),
  revenue: Joi.number().min(0).default(0),
  grossProfit: Joi.number().default(0),
  currentStock: Joi.number().min(0).default(0),
  reorderLevel: Joi.number().min(0).default(0),
  daysOfSupply: Joi.number().min(0).default(0),
  inventoryStatus: Joi.string()
    .valid('HEALTHY', 'LOW_STOCK', 'OUT_OF_STOCK', 'OVERSTOCK', 'DEAD_STOCK')
    .default('HEALTHY'),
});

const salesSchema = Joi.object({
  orderCount: Joi.number().min(0).default(0),
  itemCount: Joi.number().min(0).default(0),
  grossRevenue: Joi.number().min(0).default(0),
  discounts: Joi.number().min(0).default(0),
  tax: Joi.number().min(0).default(0),
  refunds: Joi.number().min(0).default(0),
  netRevenue: Joi.number().min(0).optional(),
  cogs: Joi.number().min(0).default(0),
}).default();

const partialSalesSchema = Joi.object({
  orderCount: Joi.number().min(0).optional(),
  itemCount: Joi.number().min(0).optional(),
  grossRevenue: Joi.number().min(0).optional(),
  discounts: Joi.number().min(0).optional(),
  tax: Joi.number().min(0).optional(),
  refunds: Joi.number().min(0).optional(),
  netRevenue: Joi.number().min(0).optional(),
  cogs: Joi.number().min(0).optional(),
}).min(1);

const inventorySchema = Joi.object({
  totalSkuCount: Joi.number().min(0).default(0),
  lowStockCount: Joi.number().min(0).default(0),
  outOfStockCount: Joi.number().min(0).default(0),
  overstockCount: Joi.number().min(0).default(0),
  deadStockCount: Joi.number().min(0).default(0),
  stockValue: Joi.number().min(0).default(0),
}).default();

const partialInventorySchema = Joi.object({
  totalSkuCount: Joi.number().min(0).optional(),
  lowStockCount: Joi.number().min(0).optional(),
  outOfStockCount: Joi.number().min(0).optional(),
  overstockCount: Joi.number().min(0).optional(),
  deadStockCount: Joi.number().min(0).optional(),
  stockValue: Joi.number().min(0).optional(),
}).min(1);

const customersSchema = Joi.object({
  newCustomers: Joi.number().min(0).default(0),
  returningCustomers: Joi.number().min(0).default(0),
  loyaltyPointsIssued: Joi.number().min(0).default(0),
}).default();

const partialCustomersSchema = Joi.object({
  newCustomers: Joi.number().min(0).optional(),
  returningCustomers: Joi.number().min(0).optional(),
  loyaltyPointsIssued: Joi.number().min(0).optional(),
}).min(1);

const createSnapshotSchema = Joi.object({
  snapshotDate: dateValue.required(),
  branchId: objectId.allow(null, '').optional(),
  branchName: Joi.string().trim().max(120).default('All Branches'),
  branchCode: Joi.string().trim().max(30).uppercase().default('ALL'),
  channel: Joi.string().valid('POS', 'ONLINE', 'WHOLESALE', 'MIXED').default('POS'),
  sales: salesSchema,
  inventory: inventorySchema,
  customers: customersSchema,
  products: Joi.array().items(productMetricSchema).default([]),
  notes: Joi.string().trim().max(500).allow('').default(''),
});

const updateSnapshotSchema = Joi.object({
  snapshotDate: dateValue.optional(),
  branchId: objectId.allow(null, '').optional(),
  branchName: Joi.string().trim().max(120).optional(),
  branchCode: Joi.string().trim().max(30).uppercase().optional(),
  channel: Joi.string().valid('POS', 'ONLINE', 'WHOLESALE', 'MIXED').optional(),
  sales: partialSalesSchema.optional(),
  inventory: partialInventorySchema.optional(),
  customers: partialCustomersSchema.optional(),
  products: Joi.array().items(productMetricSchema).optional(),
  notes: Joi.string().trim().max(500).allow('').optional(),
}).min(1);

const analyticsQuerySchema = Joi.object({
  startDate: dateValue.optional(),
  endDate: dateValue.optional(),
  branchId: objectId.allow('', null).optional(),
  branchCode: Joi.string().trim().max(30).uppercase().allow('', null).optional(),
  channel: Joi.string().valid('POS', 'ONLINE', 'WHOLESALE', 'MIXED').allow('', null).optional(),
  period: Joi.string().valid('daily', 'weekly', 'monthly').default('daily'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('revenue', 'quantitySold', 'grossProfit').default('revenue'),
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
  createSnapshotSchema,
  updateSnapshotSchema,
  analyticsQuerySchema,
  validateBody,
  validateQuery,
};
