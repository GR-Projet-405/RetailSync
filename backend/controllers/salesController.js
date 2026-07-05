const mongoose = require('mongoose');
const Sale = require('../models/Sale');
require('../models/Customer');

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

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildTransactionMatchFilter = (req) => {
  const { status, paymentMethod, cashier, startDate, endDate } = req.query;
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
  }

  if (status) {
    match.status = String(status).trim().toLowerCase();
  }

  if (paymentMethod) {
    match.paymentMethod = String(paymentMethod).trim().toLowerCase();
  }

  if (cashier) {
    if (!mongoose.Types.ObjectId.isValid(cashier)) {
      const error = new Error('Invalid cashier provided.');
      error.statusCode = 400;
      throw error;
    }

    match.cashier = new mongoose.Types.ObjectId(cashier);
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
                $sum: 1,
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

const getTransactions = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const baseMatch = buildTransactionMatchFilter(req);

    const pipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerData',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'cashier',
          foreignField: '_id',
          as: 'cashierData',
        },
      },
      {
        $lookup: {
          from: 'branches',
          localField: 'branch',
          foreignField: '_id',
          as: 'branchData',
        },
      },
      {
        $unwind: {
          path: '$customerData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$cashierData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$branchData',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          customerName: {
            $let: {
              vars: {
                customerFirst: { $ifNull: ['$customerData.firstName', ''] },
                customerLast: { $ifNull: ['$customerData.lastName', ''] },
              },
              in: {
                $trim: {
                  input: {
                    $ifNull: [
                      '$customerData.name',
                      {
                        $ifNull: [
                          '$customerData.fullName',
                          {
                            $concat: ['$$customerFirst', ' ', '$$customerLast'],
                          },
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
          cashierName: {
            $let: {
              vars: {
                cashierFirst: { $ifNull: ['$cashierData.firstName', ''] },
                cashierLast: { $ifNull: ['$cashierData.lastName', ''] },
              },
              in: {
                $trim: {
                  input: {
                    $ifNull: [
                      '$cashierData.fullName',
                      {
                        $concat: ['$$cashierFirst', ' ', '$$cashierLast'],
                      },
                    ],
                  },
                },
              },
            },
          },
          branchName: { $ifNull: ['$branchData.name', ''] },
        },
      },
    ];

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      pipeline.push({
        $match: {
          $or: [
            { transactionId: searchRegex },
            { customerName: searchRegex },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        transactions: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              transactionId: 1,
              subtotal: 1,
              discountTotal: 1,
              tax: 1,
              totalAmount: 1,
              paymentMethod: 1,
              status: 1,
              items: 1,
              note: 1,
              createdAt: 1,
              customer: {
                _id: '$customerData._id',
                name: '$customerName',
                fullName: '$customerData.fullName',
                firstName: '$customerData.firstName',
                lastName: '$customerData.lastName',
              },
              cashier: {
                _id: '$cashierData._id',
                name: '$cashierName',
                fullName: '$cashierData.fullName',
                firstName: '$cashierData.firstName',
                lastName: '$cashierData.lastName',
                username: '$cashierData.username',
              },
              branch: {
                _id: '$branchData._id',
                name: '$branchName',
                code: '$branchData.code',
              },
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
        summary: [
          {
            $group: {
              _id: null,
              totalTransactions: { $sum: 1 },
              totalRevenue: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0],
                },
              },
              completedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
              },
              refundedCount: {
                $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] },
              },
            },
          },
        ],
      },
    });

    const [result = {}] = await Sale.aggregate(pipeline);
    const transactions = result.transactions || [];
    const totalRecords = result.totalCount?.[0]?.count || 0;
    const summary = result.summary?.[0] || {};
    const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / limit) : 0;

    return res.status(200).json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        limit,
      },
      summary: {
        totalTransactions: summary.totalTransactions || totalRecords,
        totalRevenue: summary.totalRevenue || 0,
        completedCount: summary.completedCount || 0,
        refundedCount: summary.refundedCount || 0,
      },
    });
  } catch (error) {
    console.error('getTransactions Error:', error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch transactions.',
    });
  }
};

module.exports = {
  getSalesDashboard,
  getTransactions,
};
