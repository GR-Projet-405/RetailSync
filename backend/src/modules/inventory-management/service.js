const mongoose = require('mongoose');
const InventoryItem   = require('./inventoryItem.model');
const StockMovement   = require('./stockMovement.model');
const StockAdjustment = require('./stockAdjustment.model');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function notFound(entity) {
  const err = new Error(`${entity} not found`);
  err.statusCode = 404;
  return err;
}

function badRequest(msg) {
  const err = new Error(msg);
  err.statusCode = 400;
  return err;
}

// Movement types that increase stock
const ADD_TYPES = new Set(['PURCHASE', 'TRANSFER_IN', 'ADJUSTMENT_ADD', 'RETURN_IN']);
// Movement types that decrease stock
const SUB_TYPES = new Set(['SALE', 'TRANSFER_OUT', 'ADJUSTMENT_REMOVE', 'RETURN_OUT', 'DAMAGE_WRITE_OFF']);

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregate KPI numbers for the dashboard.
 * Pass warehouseIds[] to scope to a branch (optional).
 */
const getDashboardKPIs = async (warehouseIds) => {
  const match = warehouseIds?.length
    ? { warehouseId: { $in: warehouseIds.map(id => new mongoose.Types.ObjectId(id)) } }
    : {};

  const [valueAgg, totalSKUs, lowStock, outOfStock, weekMovements] = await Promise.all([
    // Total inventory value = sum(currentStock * product.costPrice)
    InventoryItem.aggregate([
      { $match: match },
      { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: { _id: null, total: { $sum: { $multiply: ['$currentStock', '$product.costPrice'] } } } },
    ]),

    // Total distinct product-warehouse combinations (SKUs in stock)
    InventoryItem.countDocuments(match),

    // Low stock: 0 < currentStock <= reorderLevel
    InventoryItem.countDocuments({
      ...match,
      $expr: {
        $and: [
          { $gt: ['$currentStock', 0] },
          { $lte: ['$currentStock', '$reorderLevel'] },
        ],
      },
    }),

    // Out of stock: currentStock === 0
    InventoryItem.countDocuments({ ...match, currentStock: 0 }),

    // Movements this week for stock turnover approximation
    StockMovement.countDocuments({
      type: 'SALE',
      performedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  return {
    totalInventoryValue: valueAgg[0]?.total ?? 0,
    totalSKUs,
    lowStockItems: lowStock,
    outOfStockItems: outOfStock,
    weekSaleMovements: weekMovements,
  };
};

/**
 * Stock breakdown by category for donut chart.
 */
const getStockCategoryBreakdown = async () => {
  const result = await InventoryItem.aggregate([
    { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $lookup: { from: 'categories', localField: 'product.categoryId', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmpty: true } },
    {
      $group: {
        _id: '$category._id',
        name: { $first: '$category.name' },
        totalValue: { $sum: { $multiply: ['$currentStock', '$product.costPrice'] } },
      },
    },
    { $sort: { totalValue: -1 } },
  ]);

  const grandTotal = result.reduce((s, r) => s + r.totalValue, 0);
  return result.map(r => ({
    categoryId: r._id,
    name: r.name || 'Uncategorised',
    value: grandTotal > 0 ? Math.round((r.totalValue / grandTotal) * 100 * 10) / 10 : 0,
  }));
};

/**
 * Most recent movements for the dashboard feed.
 */
const getRecentMovementsForDashboard = async (limit = 5) => {
  return StockMovement.find()
    .populate('productId', 'name sku')
    .populate('warehouseId', 'name code')
    .populate('performedBy', 'firstName lastName')
    .sort({ performedAt: -1 })
    .limit(limit)
    .lean();
};

// ─────────────────────────────────────────────────────────────────────────────
// Stock Levels
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paginated stock levels with optional filters.
 * status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'CRITICAL'
 */
const getStockLevels = async ({
  search, categoryId, warehouseId, status,
  startDate, endDate, page = 1, limit = 20,
}) => {
  const pipeline = [];

  // Join product and warehouse
  pipeline.push(
    { $lookup: { from: 'products',    localField: 'productId',   foreignField: '_id', as: 'product'   } },
    { $unwind: '$product' },
    { $lookup: { from: 'categories',  localField: 'product.categoryId', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmpty: true } },
    { $lookup: { from: 'suppliers',   localField: 'product.supplierId', foreignField: '_id', as: 'supplier' } },
    { $unwind: { path: '$supplier', preserveNullAndEmpty: true } },
    { $lookup: { from: 'warehouses',  localField: 'warehouseId', foreignField: '_id', as: 'warehouse' } },
    { $unwind: '$warehouse' },
  );

  // Add computed stockStatus
  pipeline.push({
    $addFields: {
      stockStatus: {
        $cond: [
          { $eq: ['$currentStock', 0] }, 'OUT_OF_STOCK',
          {
            $cond: [
              { $lte: ['$currentStock', { $multiply: ['$reorderLevel', 0.5] }] }, 'CRITICAL',
              {
                $cond: [
                  { $lte: ['$currentStock', '$reorderLevel'] }, 'LOW_STOCK',
                  'IN_STOCK',
                ],
              },
            ],
          },
        ],
      },
    },
  });

  // Build match filters
  const matchFilters = {};
  if (warehouseId) matchFilters['warehouse._id'] = new mongoose.Types.ObjectId(warehouseId);
  if (categoryId)  matchFilters['category._id']  = new mongoose.Types.ObjectId(categoryId);
  if (status)      matchFilters['stockStatus']    = status;
  if (startDate || endDate) {
    matchFilters['updatedAt'] = {};
    if (startDate) matchFilters['updatedAt'].$gte = new Date(startDate);
    if (endDate)   matchFilters['updatedAt'].$lte = new Date(endDate + 'T23:59:59.999Z');
  }
  if (search) {
    matchFilters.$or = [
      { 'product.name': { $regex: search, $options: 'i' } },
      { 'product.sku':  { $regex: search, $options: 'i' } },
    ];
  }

  if (Object.keys(matchFilters).length) {
    pipeline.push({ $match: matchFilters });
  }

  // Count + paginate in parallel
  const countPipeline  = [...pipeline, { $count: 'total' }];
  const resultPipeline = [
    ...pipeline,
    { $sort: { 'product.name': 1 } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
    {
      $project: {
        productId: 1, warehouseId: 1,
        currentStock: 1, reservedStock: 1, reorderLevel: 1,
        lastMovementAt: 1, stockStatus: 1, updatedAt: 1,
        'product.name': 1, 'product.sku': 1, 'product.unit': 1,
        'product.costPrice': 1, 'product.sellingPrice': 1,
        'category.name': 1,
        'supplier.name': 1,
        'warehouse.name': 1, 'warehouse.code': 1,
      },
    },
  ];

  const [items, countResult] = await Promise.all([
    InventoryItem.aggregate(resultPipeline),
    InventoryItem.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total ?? 0;
  return {
    items,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Single inventory item detail by ID.
 */
const getStockLevelById = async (id) => {
  const item = await InventoryItem.findById(id)
    .populate({ path: 'productId', populate: [{ path: 'categoryId' }, { path: 'supplierId' }] })
    .populate('warehouseId')
    .lean();
  if (!item) throw notFound('Inventory item');
  return item;
};

/**
 * Update reorder level for an inventory item.
 */
const updateReorderLevel = async (id, reorderLevel) => {
  if (reorderLevel < 0) throw badRequest('Reorder level cannot be negative');
  const item = await InventoryItem.findByIdAndUpdate(
    id,
    { $set: { reorderLevel } },
    { new: true, runValidators: true }
  ).populate('productId', 'name sku').populate('warehouseId', 'name code');
  if (!item) throw notFound('Inventory item');
  return item;
};

// ─────────────────────────────────────────────────────────────────────────────
// Stock Movements
// ─────────────────────────────────────────────────────────────────────────────

/**
 * KPI counts for the stock movements screen header.
 */
const getMovementKPIs = async (warehouseIds) => {
  const warehouseMatch = warehouseIds?.length
    ? { warehouseId: { $in: warehouseIds.map(id => new mongoose.Types.ObjectId(id)) } }
    : {};

  const [total, received, transferred, adjustments] = await Promise.all([
    StockMovement.countDocuments(warehouseMatch),
    StockMovement.countDocuments({ ...warehouseMatch, type: 'PURCHASE' }),
    StockMovement.countDocuments({ ...warehouseMatch, type: { $in: ['TRANSFER_IN', 'TRANSFER_OUT'] } }),
    StockMovement.countDocuments({ ...warehouseMatch, type: { $in: ['ADJUSTMENT_ADD', 'ADJUSTMENT_REMOVE'] } }),
  ]);

  return { total, received, transferred, adjustments };
};

/**
 * Paginated stock movements with filters.
 */
const getMovements = async ({
  search, type, warehouseId, startDate, endDate, page = 1, limit = 20,
}) => {
  const query = {};
  if (type && type !== 'ALL')    query.type = type;
  if (warehouseId)               query.warehouseId = warehouseId;
  if (startDate || endDate) {
    query.performedAt = {};
    if (startDate) query.performedAt.$gte = new Date(startDate);
    if (endDate)   query.performedAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }
  if (search) {
    query.$or = [
      { movementId: { $regex: search, $options: 'i' } },
      { referenceId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [movements, total] = await Promise.all([
    StockMovement.find(query)
      .populate('productId',     'name sku')
      .populate('warehouseId',   'name code')
      .populate('toWarehouseId', 'name code')
      .populate('performedBy',   'firstName lastName')
      .sort({ performedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    StockMovement.countDocuments(query),
  ]);

  return {
    movements,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Record a new stock movement and update inventory levels atomically.
 * For TRANSFER_OUT, also creates the matching TRANSFER_IN and credits the destination.
 */
const recordMovement = async ({
  type, productId, warehouseId, toWarehouseId,
  quantity, unitCost, referenceId, notes, performedBy,
}) => {
  if (!type || !productId || !warehouseId || !quantity || !performedBy) {
    throw badRequest('type, productId, warehouseId, quantity, and performedBy are required');
  }
  if (quantity < 1) throw badRequest('Quantity must be at least 1');

  // Validate stock before deducting
  if (SUB_TYPES.has(type)) {
    const item = await InventoryItem.findOne({ productId, warehouseId });
    if (!item)                        throw badRequest('No inventory record found for this product/warehouse');
    if (item.currentStock < quantity) throw badRequest(`Insufficient stock. Available: ${item.currentStock}`);
  }

  // Create movement record
  const movement = await StockMovement.create({
    type, productId, warehouseId, toWarehouseId: toWarehouseId || null,
    quantity, unitCost: unitCost || null, referenceId: referenceId || null,
    notes: notes || null, performedBy, status: 'COMPLETED', performedAt: new Date(),
  });

  // Update source warehouse inventory
  const stockDelta = ADD_TYPES.has(type) ? quantity : -quantity;
  await InventoryItem.findOneAndUpdate(
    { productId, warehouseId },
    { $inc: { currentStock: stockDelta }, lastMovementAt: new Date() },
    { upsert: true, new: true }
  );

  // For transfers: credit the destination warehouse + log the TRANSFER_IN
  if (type === 'TRANSFER_OUT' && toWarehouseId) {
    await InventoryItem.findOneAndUpdate(
      { productId, warehouseId: toWarehouseId },
      { $inc: { currentStock: quantity }, lastMovementAt: new Date() },
      { upsert: true, new: true }
    );
    await StockMovement.create({
      type: 'TRANSFER_IN', productId,
      warehouseId: toWarehouseId, toWarehouseId: warehouseId,
      quantity, unitCost: unitCost || null,
      referenceId: referenceId || movement.movementId,
      notes, performedBy, status: 'COMPLETED', performedAt: new Date(),
    });
  }

  return movement.populate([
    { path: 'productId', select: 'name sku' },
    { path: 'warehouseId', select: 'name code' },
    { path: 'performedBy', select: 'firstName lastName' },
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// Stock Adjustments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paginated stock adjustments with filters.
 */
const getAdjustments = async ({
  search, type, warehouseId, status, startDate, endDate, page = 1, limit = 20,
}) => {
  const query = {};
  if (type && type !== 'ALL')     query.type      = type;
  if (warehouseId)                query.warehouseId = warehouseId;
  if (status && status !== 'ALL') query.status    = status;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate)   query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
  }
  if (search) {
    query.$or = [
      { adjustmentId: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [adjustments, total] = await Promise.all([
    StockAdjustment.find(query)
      .populate('productId',   'name sku')
      .populate('warehouseId', 'name code')
      .populate('requestedBy', 'firstName lastName')
      .populate('reviewedBy',  'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    StockAdjustment.countDocuments(query),
  ]);

  return {
    adjustments,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Create a new stock adjustment (starts as PENDING).
 */
const createAdjustment = async ({
  productId, warehouseId, type, quantity, reason, notes, evidenceUrl, requestedBy,
}) => {
  if (!productId || !warehouseId || !type || !quantity || !reason || !requestedBy) {
    throw badRequest('productId, warehouseId, type, quantity, reason, and requestedBy are required');
  }

  // Validate sufficient stock for REMOVE adjustments
  if (type === 'REMOVE') {
    const item = await InventoryItem.findOne({ productId, warehouseId });
    if (!item || item.currentStock < quantity) {
      throw badRequest(`Insufficient stock to remove. Available: ${item?.currentStock ?? 0}`);
    }
  }

  return StockAdjustment.create({
    productId, warehouseId, type, quantity, reason,
    notes: notes || null, evidenceUrl: evidenceUrl || null,
    requestedBy, status: 'PENDING',
  });
};

/**
 * Approve a pending adjustment — applies the stock change.
 */
const approveAdjustment = async (id, reviewedBy) => {
  const adj = await StockAdjustment.findById(id);
  if (!adj)                    throw notFound('Stock adjustment');
  if (adj.status !== 'PENDING') throw badRequest('Only PENDING adjustments can be approved');

  // Apply inventory change via the movement recorder
  await recordMovement({
    type:        adj.type === 'ADD' ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_REMOVE',
    productId:   adj.productId,
    warehouseId: adj.warehouseId,
    quantity:    adj.quantity,
    referenceId: adj.adjustmentId,
    notes:       adj.notes,
    performedBy: reviewedBy,
  });

  adj.status     = 'APPROVED';
  adj.reviewedBy = reviewedBy;
  adj.reviewedAt = new Date();
  await adj.save();

  return adj.populate([
    { path: 'productId',   select: 'name sku' },
    { path: 'warehouseId', select: 'name code' },
    { path: 'requestedBy', select: 'firstName lastName' },
    { path: 'reviewedBy',  select: 'firstName lastName' },
  ]);
};

/**
 * Reject a pending adjustment — no stock change.
 */
const rejectAdjustment = async (id, reviewedBy, rejectionReason) => {
  const adj = await StockAdjustment.findById(id);
  if (!adj)                    throw notFound('Stock adjustment');
  if (adj.status !== 'PENDING') throw badRequest('Only PENDING adjustments can be rejected');

  adj.status          = 'REJECTED';
  adj.reviewedBy      = reviewedBy;
  adj.reviewedAt      = new Date();
  adj.rejectionReason = rejectionReason || null;
  await adj.save();

  return adj.populate([
    { path: 'productId',   select: 'name sku' },
    { path: 'warehouseId', select: 'name code' },
    { path: 'requestedBy', select: 'firstName lastName' },
    { path: 'reviewedBy',  select: 'firstName lastName' },
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// Low Stock Alerts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Items where currentStock <= reorderLevel, with severity computed server-side.
 * severity: CRITICAL (stock = 0 or <= 50% of reorder) | LOW (> 50% but <= 100%)
 */
const getLowStockAlerts = async ({
  search, categoryId, warehouseId, severity, startDate, endDate, page = 1, limit = 20,
}) => {
  const pipeline = [
    // Only items at or below reorder level
    { $match: { $expr: { $lte: ['$currentStock', '$reorderLevel'] } } },

    { $lookup: { from: 'products',   localField: 'productId',          foreignField: '_id', as: 'product'   } },
    { $unwind: '$product' },
    { $lookup: { from: 'categories', localField: 'product.categoryId', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmpty: true } },
    { $lookup: { from: 'suppliers',  localField: 'product.supplierId', foreignField: '_id', as: 'supplier' } },
    { $unwind: { path: '$supplier', preserveNullAndEmpty: true } },
    { $lookup: { from: 'warehouses', localField: 'warehouseId',        foreignField: '_id', as: 'warehouse' } },
    { $unwind: '$warehouse' },

    // Compute severity
    {
      $addFields: {
        severity: {
          $cond: [
            { $eq: ['$currentStock', 0] }, 'CRITICAL',
            {
              $cond: [
                { $lte: ['$currentStock', { $multiply: ['$reorderLevel', 0.5] }] }, 'CRITICAL',
                'LOW',
              ],
            },
          ],
        },
      },
    },
  ];

  // Filters after joins
  const postMatch = {};
  if (warehouseId) postMatch['warehouse._id'] = new mongoose.Types.ObjectId(warehouseId);
  if (categoryId)  postMatch['category._id']  = new mongoose.Types.ObjectId(categoryId);
  if (severity)    postMatch['severity']       = severity;
  if (startDate || endDate) {
    postMatch['lastMovementAt'] = {};
    if (startDate) postMatch['lastMovementAt'].$gte = new Date(startDate);
    if (endDate)   postMatch['lastMovementAt'].$lte = new Date(endDate + 'T23:59:59.999Z');
  }
  if (search) {
    postMatch.$or = [
      { 'product.name': { $regex: search, $options: 'i' } },
      { 'product.sku':  { $regex: search, $options: 'i' } },
    ];
  }
  if (Object.keys(postMatch).length) pipeline.push({ $match: postMatch });

  // Count + result in parallel
  const countPipeline  = [...pipeline, { $count: 'total' }];
  const resultPipeline = [
    ...pipeline,
    { $sort: { currentStock: 1 } },
    { $skip: (Number(page) - 1) * Number(limit) },
    { $limit: Number(limit) },
    {
      $project: {
        productId: 1, warehouseId: 1,
        currentStock: 1, reorderLevel: 1, severity: 1, lastMovementAt: 1,
        'product.name': 1, 'product.sku': 1,
        'category.name': 1,
        'supplier.name': 1,
        'warehouse.name': 1, 'warehouse.code': 1,
      },
    },
  ];

  const [items, countResult] = await Promise.all([
    InventoryItem.aggregate(resultPipeline),
    InventoryItem.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total ?? 0;
  return {
    alerts: items,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Summary counts by severity for the alert header KPIs.
 */
const getLowStockStats = async () => {
  const result = await InventoryItem.aggregate([
    { $match: { $expr: { $lte: ['$currentStock', '$reorderLevel'] } } },
    {
      $addFields: {
        severity: {
          $cond: [
            { $eq: ['$currentStock', 0] }, 'CRITICAL',
            {
              $cond: [
                { $lte: ['$currentStock', { $multiply: ['$reorderLevel', 0.5] }] }, 'CRITICAL',
                'LOW',
              ],
            },
          ],
        },
      },
    },
    { $group: { _id: '$severity', count: { $sum: 1 } } },
  ]);

  const stats = { CRITICAL: 0, LOW: 0 };
  result.forEach(r => { stats[r._id] = r.count; });
  stats.total = stats.CRITICAL + stats.LOW;
  return stats;
};

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Dashboard
  getDashboardKPIs,
  getStockCategoryBreakdown,
  getRecentMovementsForDashboard,

  // Stock Levels
  getStockLevels,
  getStockLevelById,
  updateReorderLevel,

  // Stock Movements
  getMovementKPIs,
  getMovements,
  recordMovement,

  // Stock Adjustments
  getAdjustments,
  createAdjustment,
  approveAdjustment,
  rejectAdjustment,

  // Low Stock Alerts
  getLowStockAlerts,
  getLowStockStats,
};
