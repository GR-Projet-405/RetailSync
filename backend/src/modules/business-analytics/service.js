const mongoose = require('mongoose');
const BusinessAnalyticsSnapshot = require('./model');

const DAY_MS = 24 * 60 * 60 * 1000;

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
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

const buildMatch = (filters = {}) => {
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
  if (filters.channel) match.channel = filters.channel;

  return { match, startDate, endDate };
};

const calculateNetRevenue = (sales = {}) => {
  if (sales.netRevenue !== undefined && sales.netRevenue !== null) {
    return sales.netRevenue;
  }

  const grossRevenue = sales.grossRevenue || 0;
  const discounts = sales.discounts || 0;
  const tax = sales.tax || 0;
  const refunds = sales.refunds || 0;

  return Math.max(grossRevenue - discounts + tax - refunds, 0);
};

const deriveInventoryCounts = (products = [], inventory = {}) => {
  const hasInventoryTotals =
    inventory.totalSkuCount ||
    inventory.lowStockCount ||
    inventory.outOfStockCount ||
    inventory.overstockCount ||
    inventory.deadStockCount;

  if (hasInventoryTotals || products.length === 0) {
    return inventory;
  }

  return {
    ...inventory,
    totalSkuCount: products.length,
    lowStockCount: products.filter((product) => product.inventoryStatus === 'LOW_STOCK').length,
    outOfStockCount: products.filter((product) => product.inventoryStatus === 'OUT_OF_STOCK').length,
    overstockCount: products.filter((product) => product.inventoryStatus === 'OVERSTOCK').length,
    deadStockCount: products.filter((product) => product.inventoryStatus === 'DEAD_STOCK').length,
  };
};

const normalizeSnapshotPayload = (payload, userId, isUpdate = false) => {
  const normalized = { ...payload };

  if (normalized.branchId === '') normalized.branchId = null;
  if (normalized.branchCode) normalized.branchCode = normalized.branchCode.toUpperCase();

  if (normalized.products) {
    normalized.products = normalized.products.map((product) => ({
      ...product,
      productId: product.productId || null,
      category: product.category || 'Uncategorized',
    }));
  }

  if (normalized.sales && (!isUpdate || normalized.sales.netRevenue !== undefined)) {
    normalized.sales = {
      ...normalized.sales,
      netRevenue: calculateNetRevenue(normalized.sales),
    };
  }

  if (!isUpdate && normalized.inventory) {
    normalized.inventory = deriveInventoryCounts(normalized.products || [], normalized.inventory);
  }

  if (userId) {
    normalized[isUpdate ? 'updatedBy' : 'createdBy'] = userId;
  }

  return normalized;
};

const flattenSnapshotUpdate = (payload) => {
  const set = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (
      ['sales', 'inventory', 'customers'].includes(key) &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        set[`${key}.${nestedKey}`] = nestedValue;
      });
      return;
    }

    set[key] = value;
  });

  return set;
};

const getDateFormat = (period) => {
  if (period === 'monthly') return '%Y-%m';
  if (period === 'weekly') return '%G-W%V';
  return '%Y-%m-%d';
};

const getModuleDetails = async () => ({
  module: 'Business Analytics',
  status: 'Active',
  endpoints: [
    'GET /api/v1/business-analytics/summary',
    'GET /api/v1/business-analytics/sales-trends',
    'GET /api/v1/business-analytics/top-products',
    'GET /api/v1/business-analytics/branch-performance',
    'GET /api/v1/business-analytics/inventory-health',
    'GET /api/v1/business-analytics/snapshots',
    'POST /api/v1/business-analytics/snapshots',
  ],
});

const createSnapshot = async (payload, userId) => {
  const snapshot = new BusinessAnalyticsSnapshot(
    normalizeSnapshotPayload(payload, userId)
  );
  await snapshot.save();
  return snapshot;
};

const getSnapshots = async (filters = {}) => {
  const { match } = buildMatch(filters);
  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 10);
  const skip = (page - 1) * limit;

  const [snapshots, total] = await Promise.all([
    BusinessAnalyticsSnapshot.find(match)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ snapshotDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BusinessAnalyticsSnapshot.countDocuments(match),
  ]);

  return {
    snapshots,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getSnapshotById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError('Invalid snapshot ID format');
  }

  const snapshot = await BusinessAnalyticsSnapshot.findById(id)
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!snapshot) {
    throw buildError('Business analytics snapshot not found', 404);
  }

  return snapshot;
};

const updateSnapshot = async (id, payload, userId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError('Invalid snapshot ID format');
  }

  const updatePayload = flattenSnapshotUpdate(
    normalizeSnapshotPayload(payload, userId, true)
  );

  const snapshot = await BusinessAnalyticsSnapshot.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true, runValidators: true }
  );

  if (!snapshot) {
    throw buildError('Business analytics snapshot not found', 404);
  }

  return snapshot;
};

const deleteSnapshot = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError('Invalid snapshot ID format');
  }

  const snapshot = await BusinessAnalyticsSnapshot.findByIdAndDelete(id);
  if (!snapshot) {
    throw buildError('Business analytics snapshot not found', 404);
  }

  return { deleted: true, id };
};

const getSummary = async (filters = {}) => {
  const { match, startDate, endDate } = buildMatch(filters);

  const [totals] = await BusinessAnalyticsSnapshot.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        snapshotCount: { $sum: 1 },
        totalOrders: { $sum: '$sales.orderCount' },
        totalItemsSold: { $sum: '$sales.itemCount' },
        grossRevenue: { $sum: '$sales.grossRevenue' },
        netRevenue: { $sum: '$sales.netRevenue' },
        discounts: { $sum: '$sales.discounts' },
        tax: { $sum: '$sales.tax' },
        refunds: { $sum: '$sales.refunds' },
        cogs: { $sum: '$sales.cogs' },
        newCustomers: { $sum: '$customers.newCustomers' },
        returningCustomers: { $sum: '$customers.returningCustomers' },
        loyaltyPointsIssued: { $sum: '$customers.loyaltyPointsIssued' },
        lowStockCount: { $sum: '$inventory.lowStockCount' },
        outOfStockCount: { $sum: '$inventory.outOfStockCount' },
        stockValue: { $sum: '$inventory.stockValue' },
      },
    },
  ]);

  const topProducts = await getTopProducts({ ...filters, limit: 5, sortBy: 'revenue' });

  const data = totals || {
    snapshotCount: 0,
    totalOrders: 0,
    totalItemsSold: 0,
    grossRevenue: 0,
    netRevenue: 0,
    discounts: 0,
    tax: 0,
    refunds: 0,
    cogs: 0,
    newCustomers: 0,
    returningCustomers: 0,
    loyaltyPointsIssued: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    stockValue: 0,
  };

  const grossProfit = data.netRevenue - data.cogs;

  return {
    dateRange: { startDate, endDate },
    kpis: {
      snapshotCount: data.snapshotCount,
      totalOrders: data.totalOrders,
      totalItemsSold: data.totalItemsSold,
      grossRevenue: data.grossRevenue,
      netRevenue: data.netRevenue,
      averageOrderValue: data.totalOrders ? data.netRevenue / data.totalOrders : 0,
      grossProfit,
      grossMarginPercent: data.netRevenue ? (grossProfit / data.netRevenue) * 100 : 0,
      discounts: data.discounts,
      tax: data.tax,
      refunds: data.refunds,
      newCustomers: data.newCustomers,
      returningCustomers: data.returningCustomers,
      loyaltyPointsIssued: data.loyaltyPointsIssued,
      lowStockCount: data.lowStockCount,
      outOfStockCount: data.outOfStockCount,
      stockValue: data.stockValue,
    },
    topProducts: topProducts.products,
  };
};

const getSalesTrends = async (filters = {}) => {
  const { match, startDate, endDate } = buildMatch(filters);
  const period = filters.period || 'daily';

  const trends = await BusinessAnalyticsSnapshot.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          $dateToString: {
            format: getDateFormat(period),
            date: '$snapshotDate',
          },
        },
        orderCount: { $sum: '$sales.orderCount' },
        itemCount: { $sum: '$sales.itemCount' },
        grossRevenue: { $sum: '$sales.grossRevenue' },
        netRevenue: { $sum: '$sales.netRevenue' },
        grossProfit: { $sum: { $subtract: ['$sales.netRevenue', '$sales.cogs'] } },
        refunds: { $sum: '$sales.refunds' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        period: '$_id',
        orderCount: 1,
        itemCount: 1,
        grossRevenue: 1,
        netRevenue: 1,
        grossProfit: 1,
        refunds: 1,
        averageOrderValue: {
          $cond: [
            { $gt: ['$orderCount', 0] },
            { $divide: ['$netRevenue', '$orderCount'] },
            0,
          ],
        },
      },
    },
  ]);

  return {
    period,
    dateRange: { startDate, endDate },
    trends,
  };
};

const getTopProducts = async (filters = {}) => {
  const { match, startDate, endDate } = buildMatch(filters);
  const limit = Number(filters.limit || 10);
  const sortBy = filters.sortBy || 'revenue';
  const sortMap = {
    revenue: 'revenue',
    quantitySold: 'quantitySold',
    grossProfit: 'grossProfit',
  };

  const products = await BusinessAnalyticsSnapshot.aggregate([
    { $match: match },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.productId',
        quantitySold: { $sum: '$products.quantitySold' },
        revenue: { $sum: '$products.revenue' },
        grossProfit: { $sum: '$products.grossProfit' },
        averageCurrentStock: { $avg: '$products.currentStock' },
        averageDaysOfSupply: { $avg: '$products.daysOfSupply' },
        snapshotCount: { $sum: 1 },
      },
    },
    { $sort: { [sortMap[sortBy]]: -1, quantitySold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        productId: '$_id',
        sku: '$productDetails.sku',
        name: '$productDetails.name',
        category: '$productDetails.category',
        quantitySold: 1,
        revenue: 1,
        grossProfit: 1,
        averageCurrentStock: 1,
        averageDaysOfSupply: 1,
        snapshotCount: 1,
      },
    },
  ]);

  return {
    dateRange: { startDate, endDate },
    sortBy,
    products,
  };
};

const getBranchPerformance = async (filters = {}) => {
  const { match, startDate, endDate } = buildMatch(filters);

  const branches = await BusinessAnalyticsSnapshot.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          branchId: '$branchId',
          branchName: '$branchName',
          branchCode: '$branchCode',
        },
        snapshotCount: { $sum: 1 },
        orderCount: { $sum: '$sales.orderCount' },
        itemCount: { $sum: '$sales.itemCount' },
        grossRevenue: { $sum: '$sales.grossRevenue' },
        netRevenue: { $sum: '$sales.netRevenue' },
        grossProfit: { $sum: { $subtract: ['$sales.netRevenue', '$sales.cogs'] } },
        lowStockCount: { $sum: '$inventory.lowStockCount' },
        outOfStockCount: { $sum: '$inventory.outOfStockCount' },
        newCustomers: { $sum: '$customers.newCustomers' },
        returningCustomers: { $sum: '$customers.returningCustomers' },
      },
    },
    { $sort: { netRevenue: -1, orderCount: -1 } },
    {
      $project: {
        _id: 0,
        branchId: '$_id.branchId',
        branchName: '$_id.branchName',
        branchCode: '$_id.branchCode',
        snapshotCount: 1,
        orderCount: 1,
        itemCount: 1,
        grossRevenue: 1,
        netRevenue: 1,
        grossProfit: 1,
        grossMarginPercent: {
          $cond: [
            { $gt: ['$netRevenue', 0] },
            { $multiply: [{ $divide: ['$grossProfit', '$netRevenue'] }, 100] },
            0,
          ],
        },
        averageOrderValue: {
          $cond: [
            { $gt: ['$orderCount', 0] },
            { $divide: ['$netRevenue', '$orderCount'] },
            0,
          ],
        },
        lowStockCount: 1,
        outOfStockCount: 1,
        newCustomers: 1,
        returningCustomers: 1,
      },
    },
  ]);

  return {
    dateRange: { startDate, endDate },
    branches,
  };
};

const getInventoryHealth = async (filters = {}) => {
  const { match, startDate, endDate } = buildMatch(filters);

  const [overall] = await BusinessAnalyticsSnapshot.aggregate([
    { $match: match },
    { $sort: { snapshotDate: -1, createdAt: -1 } },
    {
      $group: {
        _id: { branchId: '$branchId', branchCode: '$branchCode' },
        snapshotDate: { $first: '$snapshotDate' },
        inventory: { $first: '$inventory' },
      },
    },
    {
      $group: {
        _id: null,
        branchesEvaluated: { $sum: 1 },
        latestSnapshotDate: { $max: '$snapshotDate' },
        totalSkuCount: { $sum: '$inventory.totalSkuCount' },
        lowStockCount: { $sum: '$inventory.lowStockCount' },
        outOfStockCount: { $sum: '$inventory.outOfStockCount' },
        overstockCount: { $sum: '$inventory.overstockCount' },
        deadStockCount: { $sum: '$inventory.deadStockCount' },
        stockValue: { $sum: '$inventory.stockValue' },
      },
    },
    { $project: { _id: 0 } },
  ]);

  const products = await BusinessAnalyticsSnapshot.aggregate([
    { $match: match },
    { $sort: { snapshotDate: -1, createdAt: -1 } },
    { $unwind: '$products' },
    {
      $group: {
        _id: {
          branchId: '$branchId',
          branchCode: '$branchCode',
          sku: '$products.sku',
        },
        branchName: { $first: '$branchName' },
        branchCode: { $first: '$branchCode' },
        productId: { $first: '$products.productId' },
        sku: { $first: '$products.sku' },
        name: { $first: '$products.name' },
        category: { $first: '$products.category' },
        currentStock: { $first: '$products.currentStock' },
        reorderLevel: { $first: '$products.reorderLevel' },
        daysOfSupply: { $first: '$products.daysOfSupply' },
        inventoryStatus: { $first: '$products.inventoryStatus' },
        recentQuantitySold: { $sum: '$products.quantitySold' },
        recentRevenue: { $sum: '$products.revenue' },
      },
    },
    {
      $addFields: {
        shortage: {
          $cond: [
            { $gt: ['$reorderLevel', '$currentStock'] },
            { $subtract: ['$reorderLevel', '$currentStock'] },
            0,
          ],
        },
      },
    },
    { $sort: { shortage: -1, recentQuantitySold: -1 } },
    {
      $project: {
        _id: 0,
        branchName: 1,
        branchCode: 1,
        productId: 1,
        sku: 1,
        name: 1,
        category: 1,
        currentStock: 1,
        reorderLevel: 1,
        shortage: 1,
        daysOfSupply: 1,
        inventoryStatus: 1,
        recentQuantitySold: 1,
        recentRevenue: 1,
      },
    },
  ]);

  return {
    dateRange: { startDate, endDate },
    overall: overall || {
      branchesEvaluated: 0,
      latestSnapshotDate: null,
      totalSkuCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      overstockCount: 0,
      deadStockCount: 0,
      stockValue: 0,
    },
    lowStockProducts: products
      .filter((product) => product.shortage > 0 || product.inventoryStatus === 'LOW_STOCK')
      .slice(0, Number(filters.limit || 10)),
    outOfStockProducts: products
      .filter((product) => product.inventoryStatus === 'OUT_OF_STOCK' || product.currentStock === 0)
      .slice(0, Number(filters.limit || 10)),
    overstockProducts: products
      .filter((product) => product.inventoryStatus === 'OVERSTOCK')
      .slice(0, Number(filters.limit || 10)),
    deadStockProducts: products
      .filter((product) => product.inventoryStatus === 'DEAD_STOCK')
      .slice(0, Number(filters.limit || 10)),
  };
};

module.exports = {
  getModuleDetails,
  createSnapshot,
  getSnapshots,
  getSnapshotById,
  updateSnapshot,
  deleteSnapshot,
  getSummary,
  getSalesTrends,
  getTopProducts,
  getBranchPerformance,
  getInventoryHealth,
};
