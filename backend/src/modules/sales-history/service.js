const mongoose = require('mongoose');
const Sale = require('../../../models/Sale');
const { Transaction } = require('../payment-processing/model');

const normalizeRole = (role) =>
  String(role || '').trim().toUpperCase().replace(/-/g, '_');

const buildMatchFilter = (req) => {
  const { branchId, startDate, endDate } = req.query;
  const match = {};
  const roleName = normalizeRole(req.user?.roleId?.name);

  if (roleName === 'BRANCH_MANAGER') {
    const userBranch = req.user?.branchId?._id || req.user?.branchId;

    if (!userBranch) {
      const error = new Error('Branch assignment is required for branch managers.');
      error.statusCode = 403;
      throw error;
    }

    match.branch = new mongoose.Types.ObjectId(userBranch);
  } else if (branchId) {
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      const error = new Error('Invalid branchId provided.');
      error.statusCode = 400;
      throw error;
    }

    match.branch = new mongoose.Types.ObjectId(branchId);
  }

  if (startDate || endDate) {
    match.createdAt = {};

    if (startDate) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        const error = new Error('Invalid startDate provided.');
        error.statusCode = 400;
        throw error;
      }

      match.createdAt.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        const error = new Error('Invalid endDate provided.');
        error.statusCode = 400;
        throw error;
      }

      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  return match;
};

// Build a date-range-only match for the Transaction collection (no branch field)
const buildTransactionMatchFilter = (req) => {
  const { startDate, endDate } = req.query;
  const match = {};

  if (startDate || endDate) {
    match.createdAt = {};

    if (startDate) {
      const start = new Date(startDate);
      if (!Number.isNaN(start.getTime())) match.createdAt.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!Number.isNaN(end.getTime())) {
        end.setHours(23, 59, 59, 999);
        match.createdAt.$lte = end;
      }
    }
  }

  return match;
};

class SalesHistoryPageService {
  async fetchDetails() {
    return {
      module: 'Sales History',
      status: 'Under Development',
    };
  }

  async fetchDashboard(req) {
    const saleMatch = buildMatchFilter(req);
    const txnMatch = buildTransactionMatchFilter(req);

    // ── Query both collections in parallel ──────────────────────────────────
    const [
      saleKpiResult,
      saleRevenueByDay,
      saleByCategoryRaw,
      recentSales,
      txnKpiResult,
      txnRevenueByDay,
      txnByCategoryRaw,
      recentTxns,
    ] = await Promise.all([
      // --- Sale collection (written by the new Sales module) ---
      Sale.aggregate([
        { $match: saleMatch },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0],
              },
            },
            totalTransactions: { $sum: 1 },
            completedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },
            refundCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0],
              },
            },
          },
        },
      ]),
      Sale.aggregate([
        { $match: { ...saleMatch, status: 'completed' } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: '$_id',
            revenue: { $round: ['$revenue', 2] },
          },
        },
      ]),
      Sale.aggregate([
        { $match: { ...saleMatch, status: 'completed' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productInfo',
          },
        },
        {
          $addFields: {
            category: {
              $let: {
                vars: { product: { $arrayElemAt: ['$productInfo', 0] } },
                in: {
                  $ifNull: [
                    '$$product.categoryName',
                    {
                      $ifNull: ['$$product.category', 'Uncategorized'],
                    },
                  ],
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$items.lineTotal' },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Sale.find(saleMatch)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer')
        .populate('cashier', 'firstName lastName username email')
        .populate('branch', 'name code')
        .lean(),

      // --- Transaction collection (written by POS Billing / payment-processing) ---
      Transaction.aggregate([
        { $match: txnMatch },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Completed'] }, '$finalTotal', 0],
              },
            },
            totalTransactions: { $sum: 1 },
            completedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0],
              },
            },
            refundCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Refunded'] }, 1, 0],
              },
            },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { ...txnMatch, status: 'Completed' } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$finalTotal' },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: '$_id',
            revenue: { $round: ['$revenue', 2] },
          },
        },
      ]),
      Transaction.aggregate([
        { $match: { ...txnMatch, status: 'Completed' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: { $ifNull: ['$items.category', 'Uncategorized'] },
            total: { $sum: '$items.total' },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Transaction.find(txnMatch)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customerId', 'firstName lastName phone email')
        .populate('cashierId', 'firstName lastName username email')
        .lean(),
    ]);

    // ── Merge KPIs ──────────────────────────────────────────────────────────
    const saleKpi = saleKpiResult[0] || {};
    const txnKpi = txnKpiResult[0] || {};

    const totalRevenue = (saleKpi.totalRevenue || 0) + (txnKpi.totalRevenue || 0);
    const totalTransactions = (saleKpi.totalTransactions || 0) + (txnKpi.totalTransactions || 0);
    const refundCount = (saleKpi.refundCount || 0) + (txnKpi.refundCount || 0);
    const completedCount = (saleKpi.completedCount || 0) + (txnKpi.completedCount || 0);
    const avgOrderValue =
      completedCount > 0
        ? Math.round((totalRevenue / completedCount) * 100) / 100
        : 0;

    // ── Merge revenue-by-day from both collections ──────────────────────────
    const revenueMap = {};
    for (const entry of saleRevenueByDay) {
      revenueMap[entry.date] = (revenueMap[entry.date] || 0) + entry.revenue;
    }
    for (const entry of txnRevenueByDay) {
      revenueMap[entry.date] = (revenueMap[entry.date] || 0) + entry.revenue;
    }
    const revenueByDay = Object.entries(revenueMap)
      .map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    // ── Merge sales-by-category from both collections ───────────────────────
    const categoryMap = {};
    for (const entry of saleByCategoryRaw) {
      categoryMap[entry._id] = (categoryMap[entry._id] || 0) + entry.total;
    }
    for (const entry of txnByCategoryRaw) {
      categoryMap[entry._id] = (categoryMap[entry._id] || 0) + entry.total;
    }
    const categoryGrandTotal = Object.values(categoryMap).reduce((s, v) => s + v, 0);
    const salesByCategory = Object.entries(categoryMap)
      .map(([category, total]) => ({
        category,
        total: Math.round(total * 100) / 100,
        percentage:
          categoryGrandTotal > 0
            ? Math.round((total / categoryGrandTotal) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => b.total - a.total);

    // ── Merge & trim recent transactions to 5 ──────────────────────────────
    // Normalize Transaction records to a common shape for the UI
    const normalizedTxns = recentTxns.map((t) => ({
      _id: t._id,
      transactionId: t.receiptId,
      totalAmount: t.finalTotal,
      paymentMethod: t.paymentMethod,
      status:
        t.status === 'Completed'
          ? 'completed'
          : t.status === 'Refunded'
          ? 'refunded'
          : 'pending',
      createdAt: t.createdAt,
      customer: t.customerId
        ? {
            _id: t.customerId._id,
            name: `${t.customerId.firstName || ''} ${t.customerId.lastName || ''}`.trim(),
          }
        : null,
      cashier: t.cashierId
        ? {
            _id: t.cashierId._id,
            firstName: t.cashierId.firstName,
            lastName: t.cashierId.lastName,
          }
        : null,
      source: 'transaction',
    }));

    const normalizedSales = recentSales.map((s) => ({ ...s, source: 'sale' }));

    const recentTransactions = [...normalizedSales, ...normalizedTxns]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      refundCount,
      revenueByDay,
      salesByCategory,
      recentTransactions,
    };
  }
}

module.exports = new SalesHistoryPageService();
