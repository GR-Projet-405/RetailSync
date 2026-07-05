const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const { generateExcel, generatePDF, normalizeFields, FIELD_DEFINITIONS } = require('../utils/exportHelper');
require('../models/Customer');
require('../models/Product');

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

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const roleName = normalizeRole(req.user.roleId?.name);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found.',
      });
    }

    const sale = await Sale.findById(id)
      .populate({ path: 'customer', select: 'name phone email loyaltyPoints fullName firstName lastName' })
      .populate({ path: 'cashier', select: 'firstName lastName email username' })
      .populate({ path: 'branch', select: 'name location.address location.city location.state location.country code' })
      .populate({ path: 'items.product', select: 'name sku category' })
      .lean();

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found.',
      });
    }

    const branchAddress = sale.branch?.location?.address || sale.branch?.address || '';
    const customerName =
      sale.customer?.name ||
      sale.customer?.fullName ||
      [sale.customer?.firstName, sale.customer?.lastName].filter(Boolean).join(' ').trim() ||
      'Walk-in Customer';
    const cashierName =
      sale.cashier?.firstName || sale.cashier?.lastName
        ? [sale.cashier.firstName, sale.cashier.lastName].filter(Boolean).join(' ').trim()
        : sale.cashier?.username || 'Unknown';

    return res.status(200).json({
      success: true,
      data: {
        ...sale,
        customer: {
          ...sale.customer,
          name: customerName,
        },
        cashier: {
          ...sale.cashier,
          name: cashierName,
        },
        branch: {
          ...sale.branch,
          address: branchAddress,
        },
        accessContext: {
          viewerRole: roleName,
        },
      },
    });
  } catch (error) {
    console.error('getSaleById Error:', error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch sale details.',
    });
  }
};

const parseListParam = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => String(item).trim())
    .filter(Boolean);
};

const buildFilteredSalesPipeline = (req) => {
  const {
    keyword,
    customerName,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    paymentMethod,
    status,
    category,
    cashier,
    page = 1,
    limit = 10,
  } = req.query;

  const roleName = normalizeRole(req.user.roleId?.name);
  const match = {};
  const appliedFilters = {
    keyword: String(keyword || '').trim(),
    customerName: String(customerName || '').trim(),
    startDate: startDate ? String(startDate).trim() : '',
    endDate: endDate ? String(endDate).trim() : '',
    minAmount: minAmount !== undefined && minAmount !== '' ? Number(minAmount) : null,
    maxAmount: maxAmount !== undefined && maxAmount !== '' ? Number(maxAmount) : null,
    paymentMethod: paymentMethod ? String(paymentMethod).trim().toLowerCase() : '',
    status: parseListParam(status).map((item) => item.toLowerCase()),
    category: String(category || '').trim(),
    cashier: String(cashier || '').trim(),
    page: Math.max(parseInt(page, 10) || 1, 1),
    limit: Math.max(parseInt(limit, 10) || 10, 1),
  };

  if (roleName === 'BRANCH_MANAGER') {
    const userBranch = req.user.branchId?._id || req.user.branchId;

    if (!userBranch) {
      const error = new Error('Branch assignment is required for branch managers.');
      error.statusCode = 403;
      throw error;
    }

    match.branch = new mongoose.Types.ObjectId(userBranch);
  }

  if (appliedFilters.paymentMethod) {
    match.paymentMethod = appliedFilters.paymentMethod;
  }

  if (appliedFilters.status.length) {
    match.status = { $in: appliedFilters.status };
  }

  if (appliedFilters.cashier) {
    if (!mongoose.Types.ObjectId.isValid(appliedFilters.cashier)) {
      const error = new Error('Invalid cashier provided.');
      error.statusCode = 400;
      throw error;
    }

    match.cashier = new mongoose.Types.ObjectId(appliedFilters.cashier);
  }

  if (appliedFilters.startDate || appliedFilters.endDate) {
    match.createdAt = {};

    if (appliedFilters.startDate) {
      const start = new Date(appliedFilters.startDate);

      if (Number.isNaN(start.getTime())) {
        const error = new Error('Invalid startDate provided.');
        error.statusCode = 400;
        throw error;
      }

      match.createdAt.$gte = start;
    }

    if (appliedFilters.endDate) {
      const end = new Date(appliedFilters.endDate);

      if (Number.isNaN(end.getTime())) {
        const error = new Error('Invalid endDate provided.');
        error.statusCode = 400;
        throw error;
      }

      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }

  const safeNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const minValue = safeNumber(appliedFilters.minAmount);
  const maxValue = safeNumber(appliedFilters.maxAmount);

  if (minValue !== null || maxValue !== null) {
    match.totalAmount = {};

    if (minValue !== null) match.totalAmount.$gte = minValue;
    if (maxValue !== null) match.totalAmount.$lte = maxValue;
  }

  const pipeline = [
    { $match: match },
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
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productData',
      },
    },
    { $unwind: { path: '$customerData', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$cashierData', preserveNullAndEmptyArrays: true } },
    { $unwind: { path: '$branchData', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        customerNameText: {
          $trim: {
            input: {
              $ifNull: [
                '$customerData.name',
                {
                  $ifNull: [
                    '$customerData.fullName',
                    {
                      $trim: {
                        input: {
                          $concat: [
                            { $ifNull: ['$customerData.firstName', ''] },
                            ' ',
                            { $ifNull: ['$customerData.lastName', ''] },
                          ],
                        },
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
        cashierNameText: {
          $trim: {
            input: {
              $ifNull: [
                '$cashierData.fullName',
                {
                  $trim: {
                    input: {
                      $concat: [
                        { $ifNull: ['$cashierData.firstName', ''] },
                        ' ',
                        { $ifNull: ['$cashierData.lastName', ''] },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
        productText: {
          $trim: {
            input: {
              $reduce: {
                input: {
                  $map: {
                    input: '$productData',
                    as: 'product',
                    in: {
                      $concat: [
                        { $ifNull: ['$$product.name', ''] },
                        ' ',
                        { $ifNull: ['$$product.category', ''] },
                      ],
                    },
                  },
                },
                initialValue: '',
                in: { $concat: ['$$value', ' ', '$$this'] },
              },
            },
          },
        },
        categoryText: {
          $trim: {
            input: {
              $reduce: {
                input: {
                  $map: {
                    input: '$productData',
                    as: 'product',
                    in: { $ifNull: ['$$product.category', ''] },
                  },
                },
                initialValue: '',
                in: { $concat: ['$$value', ' ', '$$this'] },
              },
            },
          },
        },
      },
    },
  ];

  const searchMatch = {};

  if (appliedFilters.keyword) {
    const regex = new RegExp(escapeRegex(appliedFilters.keyword), 'i');
    searchMatch.$or = [
      { transactionId: regex },
      { customerNameText: regex },
      { productText: regex },
    ];
  }

  if (appliedFilters.customerName) {
    searchMatch.customerNameText = new RegExp(escapeRegex(appliedFilters.customerName), 'i');
  }

  if (appliedFilters.category) {
    searchMatch.categoryText = new RegExp(escapeRegex(appliedFilters.category), 'i');
  }

  if (Object.keys(searchMatch).length) {
    pipeline.push({ $match: searchMatch });
  }

  pipeline.push({
    $facet: {
      transactions: [
        { $sort: { createdAt: -1 } },
        { $skip: (appliedFilters.page - 1) * appliedFilters.limit },
        { $limit: appliedFilters.limit },
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
            createdAt: 1,
            customer: {
              _id: '$customerData._id',
              name: '$customerNameText',
              fullName: '$customerData.fullName',
              firstName: '$customerData.firstName',
              lastName: '$customerData.lastName',
              phone: '$customerData.phone',
              email: '$customerData.email',
              loyaltyPoints: '$customerData.loyaltyPoints',
            },
            cashier: {
              _id: '$cashierData._id',
              name: '$cashierNameText',
              fullName: '$cashierData.fullName',
              firstName: '$cashierData.firstName',
              lastName: '$cashierData.lastName',
              username: '$cashierData.username',
              email: '$cashierData.email',
            },
            branch: {
              _id: '$branchData._id',
              name: '$branchData.name',
              address: {
                $ifNull: ['$branchData.location.address', ''],
              },
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
              totalRevenue: { $sum: '$totalAmount' },
              totalTransactions: { $sum: 1 },
            },
          },
        ],
    },
  });

  return { pipeline, appliedFilters };
};

const getFilteredSales = async (req, res) => {
  try {
    const { pipeline, appliedFilters } = buildFilteredSalesPipeline(req);
    const [result = {}] = await Sale.aggregate(pipeline);
    const transactions = result.transactions || [];
    const matchCount = result.totalCount?.[0]?.count || 0;
    const summary = result.summary?.[0] || {};
    const totalPages = matchCount > 0 ? Math.ceil(matchCount / appliedFilters.limit) : 0;

    return res.status(200).json({
      transactions,
      pagination: {
        currentPage: appliedFilters.page,
        totalPages,
        totalRecords: matchCount,
        limit: appliedFilters.limit,
      },
      summary: {
        totalRevenue: summary.totalRevenue || 0,
        totalTransactions: summary.totalTransactions || matchCount,
      },
      appliedFilters,
      matchCount,
    });
  } catch (error) {
    console.error('getFilteredSales Error:', error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch filtered sales.',
    });
  }
};

const buildExportMatchFilter = (req) => {
  const { startDate, endDate, status, paymentMethod } = req.query;
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

  if (paymentMethod) {
    match.paymentMethod = String(paymentMethod).trim().toLowerCase();
  }

  if (status) {
    const statusList = parseListParam(status).map((item) => item.toLowerCase());
    if (statusList.length) {
      match.status = { $in: statusList };
    }
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

const formatExportFieldValue = (sale, field) => {
  const formatter = FIELD_DEFINITIONS[field];

  if (!formatter) {
    return '';
  }

  const value = formatter.getValue(sale);

  if (field === 'totalAmount' || field === 'discount') {
    return Number(value || 0);
  }

  return value;
};

const buildExportRows = (sales = [], fields = []) => {
  const selectedFields = normalizeFields(fields);

  return sales.map((sale) => {
    const row = {};

    selectedFields.forEach((field) => {
      row[field] = formatExportFieldValue(sale, field);
    });

    return row;
  });
};

const toCsvValue = (value) => {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

const exportSales = async (req, res) => {
  try {
    const format = String(req.query.format || 'xlsx').trim().toLowerCase();
    const fields = normalizeFields(req.query.fields);
    const match = buildExportMatchFilter(req);
    const sales = await Sale.find(match)
      .sort({ createdAt: -1 })
      .populate({ path: 'customer', select: 'name fullName firstName lastName phone email' })
      .populate({ path: 'cashier', select: 'firstName lastName username email' })
      .populate({ path: 'branch', select: 'name code' })
      .populate({ path: 'items.product', select: 'name sku category' })
      .lean();

    const exportData = buildExportRows(sales, fields);
    const reportDate = new Date().toISOString().slice(0, 10);
    const fileNameBase = `SalesReport_${reportDate}`;

    if (format === 'xlsx') {
      const buffer = await generateExcel(sales, fields);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileNameBase}.xlsx"`);
      return res.status(200).send(buffer);
    }

    if (format === 'pdf') {
      const dateRangeLabel = [req.query.startDate, req.query.endDate].filter(Boolean).join(' to ') || 'All available records';
      const buffer = await generatePDF({ records: sales, meta: { dateRangeLabel } }, fields);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileNameBase}.pdf"`);
      return res.status(200).send(buffer);
    }

    if (format === 'csv') {
      const headers = fields.map((field) => FIELD_DEFINITIONS[field].label);
      const rows = exportData.map((row) => fields.map((field) => row[field]));
      const csv = [headers, ...rows]
        .map((row) => row.map(toCsvValue).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileNameBase}.csv"`);
      return res.status(200).send(csv);
    }

    return res.status(400).json({
      success: false,
      message: 'Invalid format. Use xlsx, pdf, or csv.',
    });
  } catch (error) {
    console.error('exportSales Error:', error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to export sales report.',
    });
  }
};

module.exports = {
  getSalesDashboard,
  getTransactions,
  getSaleById,
  getFilteredSales,
  exportSales,
};
