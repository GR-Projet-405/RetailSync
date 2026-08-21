const mongoose = require('mongoose');
const AIReorderRecommendation = require('./model');
const BusinessAnalyticsSnapshot = require('../business-analytics/model');
const Product = require('../product-management/model');
const PurchaseOrderPageService = require('../purchase-orders/service');

const DAY_MS = 24 * 60 * 60 * 1000;

const buildError = (message, statusCode = 400, code, details) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  if (code) error.code = code;
  if (details) error.details = details;
  return error;
};

const asObjectId = (value) => {
  if (!value) return null;
  return new mongoose.Types.ObjectId(value);
};

const startOfDay = (date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const defaultDateRange = () => {
  const now = new Date();
  return {
    startDate: startOfDay(new Date(now.getTime() - 29 * DAY_MS)),
    endDate: endOfDay(now),
  };
};

const buildSnapshotMatch = (filters = {}) => {
  const defaults = defaultDateRange();
  const startDate = filters.startDate ? startOfDay(filters.startDate) : defaults.startDate;
  const endDate = filters.endDate ? endOfDay(filters.endDate) : defaults.endDate;

  if (endDate < startDate) {
    throw buildError('endDate must be greater than or equal to startDate');
  }

  const match = {
    snapshotDate: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (filters.branchId) match.branchId = asObjectId(filters.branchId);
  if (filters.branchCode) match.branchCode = filters.branchCode;

  return { match, startDate, endDate };
};

const getWindowDays = (startDate, endDate) => {
  return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime() + 1) / DAY_MS));
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getUrgency = ({ currentStock, reorderLevel, projectedStockoutDays, leadTimeDays, inventoryStatus }) => {
  if (currentStock === 0 || inventoryStatus === 'OUT_OF_STOCK') return 'CRITICAL';
  if (projectedStockoutDays !== null && projectedStockoutDays <= leadTimeDays) return 'HIGH';
  if (currentStock < reorderLevel || inventoryStatus === 'LOW_STOCK') return 'MEDIUM';
  return 'LOW';
};

const getConfidenceScore = ({
  snapshotCount,
  averageDailySales,
  currentStock,
  reorderLevel,
  projectedStockoutDays,
  leadTimeDays,
  inventoryStatus,
}) => {
  let score = 50;

  if (snapshotCount >= 7) score += 15;
  else if (snapshotCount >= 3) score += 10;
  else if (snapshotCount >= 1) score += 5;

  if (averageDailySales > 0) score += 12;
  if (currentStock < reorderLevel) score += 10;
  if (projectedStockoutDays !== null && projectedStockoutDays <= leadTimeDays) score += 8;
  if (inventoryStatus === 'OUT_OF_STOCK') score += 5;
  if (inventoryStatus === 'DEAD_STOCK' || inventoryStatus === 'OVERSTOCK') score -= 25;

  return Math.round(clamp(score, 20, 95));
};

const buildReason = ({
  productName,
  currentStock,
  reorderLevel,
  averageDailySales,
  projectedStockoutDays,
  recommendedQuantity,
  leadTimeDays,
  coverageDays,
  inventoryStatus,
}) => {
  if (inventoryStatus === 'OUT_OF_STOCK' || currentStock === 0) {
    return `${productName} is out of stock. Reorder ${recommendedQuantity} units to restore availability for the next ${coverageDays} days.`;
  }

  if (projectedStockoutDays !== null && projectedStockoutDays <= leadTimeDays) {
    return `${productName} may stock out in ${projectedStockoutDays.toFixed(1)} days, which is within the ${leadTimeDays}-day supplier lead time. Recommended reorder quantity is ${recommendedQuantity}.`;
  }

  if (currentStock < reorderLevel) {
    return `${productName} is below its reorder level (${currentStock}/${reorderLevel}). Recommended reorder quantity is ${recommendedQuantity}.`;
  }

  return `${productName} has steady demand of ${averageDailySales.toFixed(2)} units/day. Reorder ${recommendedQuantity} units to maintain ${coverageDays} days of coverage.`;
};

const getModuleDetails = async () => ({
  module: 'AI Reordering',
  status: 'Active',
  strategy: 'Rule-based recommendation engine using Business Analytics snapshots.',
  purchaseOrderConversion: {
    allowedRecommendationStatuses: ['PENDING', 'APPROVED'],
    requiresLinkedProduct: true,
    requiresExistingSupplier: true,
    resultStatus: 'DRAFT',
  },
  endpoints: [
    'POST /api/v1/ai-reordering/generate',
    'GET /api/v1/ai-reordering/recommendations',
    'GET /api/v1/ai-reordering/recommendations/:id',
    'PATCH /api/v1/ai-reordering/recommendations/:id/status',
    'POST /api/v1/ai-reordering/recommendations/:id/convert-to-po',
  ],
});

const getProductDemandSignals = async (filters = {}) => {
  const { match, startDate, endDate } = buildSnapshotMatch(filters);

  const pipeline = [
    { $match: match },
    { $sort: { snapshotDate: -1, createdAt: -1 } },
    { $unwind: '$products' },
  ];

  if (filters.category) {
    pipeline.push({ $match: { 'products.category': filters.category } });
  }

  pipeline.push(
    {
      $group: {
        _id: {
          branchId: '$branchId',
          branchCode: '$branchCode',
          sku: '$products.sku',
        },
        productId: { $first: '$products.productId' },
        sku: { $first: '$products.sku' },
        productName: { $first: '$products.name' },
        category: { $first: '$products.category' },
        branchId: { $first: '$branchId' },
        branchName: { $first: '$branchName' },
        branchCode: { $first: '$branchCode' },
        currentStock: { $first: '$products.currentStock' },
        reorderLevel: { $first: '$products.reorderLevel' },
        daysOfSupply: { $first: '$products.daysOfSupply' },
        inventoryStatus: { $first: '$products.inventoryStatus' },
        totalQuantitySold: { $sum: '$products.quantitySold' },
        totalRevenue: { $sum: '$products.revenue' },
        snapshotCount: { $sum: 1 },
        sourceSnapshotIds: { $addToSet: '$_id' },
      },
    },
    { $sort: { totalQuantitySold: -1, totalRevenue: -1 } }
  );

  const signals = await BusinessAnalyticsSnapshot.aggregate(pipeline);
  const productIds = signals.map((signal) => signal.productId).filter(Boolean);
  const products = productIds.length
    ? await Product.find({ _id: { $in: productIds } })
        .select('_id supplier')
        .populate('supplier', 'name')
        .lean()
    : [];
  const supplierByProductId = new Map(
    products.map((product) => [String(product._id), product.supplier || null])
  );

  const enrichedSignals = signals.map((signal) => {
    const supplier = signal.productId
      ? supplierByProductId.get(String(signal.productId))
      : null;
    return {
      ...signal,
      supplierId: supplier?._id || null,
      supplierName: supplier?.name || '',
    };
  });

  return {
    signals: enrichedSignals,
    startDate,
    endDate,
    demandWindowDays: getWindowDays(startDate, endDate),
  };
};

const buildRecommendationPayload = (signal, config, generatedBy) => {
  const averageDailySales = signal.totalQuantitySold / config.demandWindowDays;
  const projectedStockoutDays =
    averageDailySales > 0 ? signal.currentStock / averageDailySales : null;
  const targetStock = Math.ceil(
    averageDailySales * (config.coverageDays + config.leadTimeDays + config.safetyStockDays)
  );
  const minimumTarget = Math.max(signal.reorderLevel || 0, targetStock);
  let recommendedQuantity = Math.max(minimumTarget - signal.currentStock, 0);

  if (signal.currentStock < signal.reorderLevel && recommendedQuantity === 0) {
    recommendedQuantity = signal.reorderLevel - signal.currentStock;
  }

  const shouldRecommend =
    recommendedQuantity > 0 ||
    signal.currentStock === 0 ||
    signal.inventoryStatus === 'OUT_OF_STOCK' ||
    signal.inventoryStatus === 'LOW_STOCK';

  if (!shouldRecommend && !config.includeHealthy) return null;
  if (signal.inventoryStatus === 'DEAD_STOCK' && recommendedQuantity <= 0) return null;
  if (signal.inventoryStatus === 'OVERSTOCK' && recommendedQuantity <= 0) return null;

  const urgency = getUrgency({
    currentStock: signal.currentStock,
    reorderLevel: signal.reorderLevel,
    projectedStockoutDays,
    leadTimeDays: config.leadTimeDays,
    inventoryStatus: signal.inventoryStatus,
  });
  const confidenceScore = getConfidenceScore({
    snapshotCount: signal.snapshotCount,
    averageDailySales,
    currentStock: signal.currentStock,
    reorderLevel: signal.reorderLevel,
    projectedStockoutDays,
    leadTimeDays: config.leadTimeDays,
    inventoryStatus: signal.inventoryStatus,
  });

  if (confidenceScore < config.minimumConfidence) return null;

  return {
    productId: signal.productId || null,
    sku: signal.sku,
    productName: signal.productName,
    category: signal.category || 'Uncategorized',
    branchId: signal.branchId || null,
    branchName: signal.branchName || 'All Branches',
    branchCode: signal.branchCode || 'ALL',
    supplierId: signal.supplierId || null,
    supplierName: signal.supplierName || '',
    currentStock: signal.currentStock || 0,
    reorderLevel: signal.reorderLevel || 0,
    averageDailySales,
    projectedStockoutDays,
    recommendedQuantity: Math.ceil(recommendedQuantity),
    confidenceScore,
    urgency,
    reason: buildReason({
      productName: signal.productName,
      currentStock: signal.currentStock || 0,
      reorderLevel: signal.reorderLevel || 0,
      averageDailySales,
      projectedStockoutDays,
      recommendedQuantity: Math.ceil(recommendedQuantity),
      leadTimeDays: config.leadTimeDays,
      coverageDays: config.coverageDays,
      inventoryStatus: signal.inventoryStatus,
    }),
    generationConfig: {
      coverageDays: config.coverageDays,
      leadTimeDays: config.leadTimeDays,
      safetyStockDays: config.safetyStockDays,
      demandWindowDays: config.demandWindowDays,
    },
    sourceSnapshotIds: signal.sourceSnapshotIds || [],
    sourceDateRange: {
      startDate: config.startDate,
      endDate: config.endDate,
    },
    generatedBy,
  };
};

const generateRecommendations = async (payload = {}, userId) => {
  const { signals, startDate, endDate, demandWindowDays } = await getProductDemandSignals(payload);
  const config = {
    coverageDays: payload.coverageDays || 14,
    leadTimeDays: payload.leadTimeDays || 7,
    safetyStockDays: payload.safetyStockDays || 3,
    minimumConfidence: payload.minimumConfidence || 0,
    includeHealthy: Boolean(payload.includeHealthy),
    demandWindowDays,
    startDate,
    endDate,
  };

  const recommendations = signals
    .map((signal) => buildRecommendationPayload(signal, config, userId))
    .filter(Boolean);

  if (payload.replacePending && recommendations.length) {
    const deleteFilter = { status: 'PENDING' };
    if (payload.branchId) deleteFilter.branchId = asObjectId(payload.branchId);
    if (payload.branchCode) deleteFilter.branchCode = payload.branchCode;
    await AIReorderRecommendation.deleteMany(deleteFilter);
  }

  const created = recommendations.length
    ? await AIReorderRecommendation.insertMany(recommendations)
    : [];

  return {
    dateRange: { startDate, endDate },
    config,
    sourceProductsEvaluated: signals.length,
    recommendationsCreated: created.length,
    recommendations: created,
  };
};

const buildRecommendationQuery = (filters = {}) => {
  const query = {};

  if (filters.startDate || filters.endDate) {
    const defaults = defaultDateRange();
    query.recommendationDate = {
      $gte: filters.startDate ? startOfDay(filters.startDate) : defaults.startDate,
      $lte: filters.endDate ? endOfDay(filters.endDate) : defaults.endDate,
    };
  }

  if (filters.branchId) query.branchId = asObjectId(filters.branchId);
  if (filters.branchCode) query.branchCode = filters.branchCode;
  if (filters.sku) query.sku = filters.sku;
  if (filters.status) query.status = filters.status;
  if (filters.urgency) query.urgency = filters.urgency;

  return query;
};

const getRecommendations = async (filters = {}) => {
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 10);
  const skip = (page - 1) * limit;
  const query = buildRecommendationQuery(filters);

  const [recommendations, total] = await Promise.all([
    AIReorderRecommendation.find(query)
      .populate('generatedBy', 'firstName lastName email')
      .populate('decidedBy', 'firstName lastName email')
      .sort({ urgency: 1, confidenceScore: -1, recommendationDate: -1 })
      .skip(skip)
      .limit(limit),
    AIReorderRecommendation.countDocuments(query),
  ]);

  return {
    recommendations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getRecommendationById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError('Invalid recommendation ID format');
  }

  const recommendation = await AIReorderRecommendation.findById(id)
    .populate('generatedBy', 'firstName lastName email')
    .populate('decidedBy', 'firstName lastName email');

  if (!recommendation) {
    throw buildError('AI reorder recommendation not found', 404);
  }

  return recommendation;
};

const createRecommendation = async (payload, userId) => {
  const recommendation = new AIReorderRecommendation({
    ...payload,
    productId: payload.productId || null,
    branchId: payload.branchId || null,
    supplierId: payload.supplierId || null,
    generatedBy: userId || null,
  });

  await recommendation.save();
  return recommendation;
};

const updateRecommendationStatus = async (id, payload, userId) => {
  const recommendation = await getRecommendationById(id);

  if (recommendation.status === 'CONVERTED_TO_PO') {
    throw buildError('Converted recommendations cannot be changed.', 409);
  }

  recommendation.status = payload.status;
  recommendation.decisionNote = payload.decisionNote || '';
  recommendation.decidedBy = userId || null;
  recommendation.decidedAt = new Date();

  await recommendation.save();
  return recommendation;
};

const convertToPurchaseOrder = async (id, payload = {}, userId) => {
  const recommendation = await getRecommendationById(id);

  if (!['PENDING', 'APPROVED'].includes(recommendation.status)) {
    throw buildError('Only pending or approved recommendations can be converted to a purchase order draft.', 409);
  }

  if (!recommendation.productId) {
    throw buildError(
      'This recommendation cannot be converted because it is not linked to a product.',
      400,
      'AI_REORDER_PRODUCT_REQUIRED',
      [
        {
          field: 'productId',
          message: 'Create or regenerate the recommendation with a valid productId before converting it.',
        },
      ]
    );
  }

  const supplierId = payload.supplierId || recommendation.supplierId;
  if (!supplierId) {
    throw buildError(
      'A supplier must be selected to generate a purchase order draft.',
      400,
      'AI_REORDER_SUPPLIER_REQUIRED',
      [
        {
          field: 'supplierId',
          message: 'Provide an existing supplierId or link a supplier to the recommendation.',
        },
      ]
    );
  }

  // Create a real draft purchase order via the canonical service
  const poDraftBody = {
    supplierId: supplierId.toString(),
    expectedDeliveryDate: payload.expectedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    shippingAddress: payload.shippingAddress || 'Default Warehouse Address',
    items: [
      {
        productId: recommendation.productId.toString(),
        quantity: recommendation.recommendedQuantity,
      }
    ],
    internalNotes: payload.note || 'Generated from AI reorder recommendation.',
    asDraft: true
  };

  const createdPO = await PurchaseOrderPageService.create(poDraftBody, userId);

  const purchaseOrderDraft = {
    supplierId: createdPO.supplier,
    supplierName: createdPO.supplierNameSnapshot,
    branchId: recommendation.branchId || null,
    branchName: recommendation.branchName || '',
    items: createdPO.items.map(item => ({
      productId: item.product,
      sku: item.sku,
      productName: item.name,
      quantity: item.quantity,
    })),
    note: createdPO.internalNotes,
    generatedAt: createdPO.createdAt,
    poNumber: createdPO.poNumber,
    purchaseOrderId: createdPO._id,
  };

  recommendation.status = 'CONVERTED_TO_PO';
  recommendation.purchaseOrderDraft = purchaseOrderDraft;
  recommendation.decisionNote = payload.note || recommendation.decisionNote;
  recommendation.decidedBy = userId || null;
  recommendation.decidedAt = new Date();

  await recommendation.save();

  return {
    recommendation,
    purchaseOrderDraft,
    purchaseOrder: createdPO,
    message: 'AI reorder recommendation successfully converted to a Purchase Order draft.',
  };
};

module.exports = {
  getModuleDetails,
  generateRecommendations,
  getRecommendations,
  getRecommendationById,
  createRecommendation,
  updateRecommendationStatus,
  convertToPurchaseOrder,
};
