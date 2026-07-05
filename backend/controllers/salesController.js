const mongoose = require('mongoose');
const Sale = require('../models/Sale');

const buildMatchFilter = (req) => {
  const { branchId, startDate, endDate } = req.query;
  const match = {};
  const roleName = normalizeRole(req.user.roleId?.name);

  if (roleName === 'BRANCH_MANAGER') {
    const userBranch = req.user.branchId?._id || req.user.branchId;

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

const normalizeRole = (role) =>
  String(role || '').trim().toUpperCase().replace(/-/g, '_');

const getSalesDashboard = async (req, res) => {
  try {
    const match = buildMatchFilter(req);

    const [kpiResult, revenueByDay, salesByCategoryRaw, recentTransactions] =
      await Promise.all([
        Sale.aggregate([
          { $match: match },
          {
            $group: {
              _id: null,
              totalRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0],
                },
              },
              totalTransactions: {
                $sum: {
                  $cond: [
                    { $in: ['$status', ['completed', 'pending', 'refunded']] },
                    1,
                    0,
                  ],
                },
              },
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
          { $match: { ...match, status: 'completed' } },
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
          { $match: { ...match, status: 'completed' } },
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
        Sale.find(match)
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('customer')
          .populate('cashier', 'firstName lastName username email')
          .populate('branch', 'name code')
          .lean(),
      ]);

    const kpi = kpiResult[0] || {};
    const totalRevenue = kpi.totalRevenue || 0;
    const totalTransactions = kpi.totalTransactions || 0;
    const refundCount = kpi.refundCount || 0;
    const completedCount = kpi.completedCount || 0;
    const avgOrderValue =
      completedCount > 0
        ? Math.round((totalRevenue / completedCount) * 100) / 100
        : 0;

    const categoryGrandTotal = salesByCategoryRaw.reduce(
      (sum, entry) => sum + entry.total,
      0
    );

    const salesByCategory = salesByCategoryRaw.map((entry) => ({
      category: entry._id,
      total: Math.round(entry.total * 100) / 100,
      percentage:
        categoryGrandTotal > 0
          ? Math.round((entry.total / categoryGrandTotal) * 10000) / 100
          : 0,
    }));

    return res.status(200).json({
      success: true,
      totalRevenue,
      totalTransactions,
      avgOrderValue,
      refundCount,
      revenueByDay,
      salesByCategory,
      recentTransactions,
    });
  } catch (error) {
    console.error('getSalesDashboard Error:', error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch sales dashboard data.',
    });
  }
};

module.exports = {
  getSalesDashboard,
};
