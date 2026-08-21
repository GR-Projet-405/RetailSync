const Branch = require('./branch.model');
const User = require('../user-management/user.model');
const { createLog } = require('../audit-logs/auditLog.service');
const mongoose = require('mongoose');
const inventoryService = require('../inventory-management/service');
const StockTransfer = require('../stock-transfers/model');
const Sale = require('../../../models/Sale');
const Inventory = require('../inventory-management/model');

const getBranches = async (query = {}) => {
  const { page = 1, limit = 10, search, status, manager, city } = query;
  
  const filter = {};
  
  if (status) filter.status = status.toUpperCase();
  if (city) filter['address.city'] = { $regex: city, $options: 'i' };
  
  if (manager === 'Assigned') {
    filter.managerId = { $ne: null };
  } else if (manager === 'Unassigned') {
    filter.managerId = null;
  }
  
  if (search) {
    filter.$or = [
      { branchName: { $regex: search, $options: 'i' } },
      { branchCode: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const [data, total] = await Promise.all([
    Branch.find(filter)
      .populate('managerId', 'firstName lastName email status')
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 })
      .lean(),
    Branch.countDocuments(filter)
  ]);

  // Aggregate staff count and stock value - mocked for now as per SRS
  const enrichedData = data.map(branch => ({
    ...branch,
    totalStaff: Math.floor(Math.random() * 50) + 10,
    currentStockValue: Math.floor(Math.random() * 10000000) + 1000000,
    todaySales: Math.floor(Math.random() * 500000) + 10000,
  }));

  return {
    data: enrichedData,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber)
    }
  };
};

const getBranchById = async (id) => {
  const branch = await Branch.findById(id).populate('managerId', 'firstName lastName email phone status');
  if (!branch) {
    throw new Error('Branch not found');
  }
  return branch;
};

const createBranch = async (branchData, performedBy) => {
  const existingBranch = await Branch.findOne({ branchCode: branchData.branchCode.toUpperCase() });
  if (existingBranch) {
    throw new Error('Branch code already exists');
  }

  const branch = await Branch.create({ ...branchData, createdBy: performedBy });

  if (branch.managerId) {
    await User.findByIdAndUpdate(branch.managerId, { branchId: branch._id });
  }

  await createLog({
    module: 'BRANCH',
    action: 'CREATE',
    entityType: 'BRANCH',
    entityId: branch._id,
    performedBy,
    newValues: branch.toObject()
  });

  return branch;
};

const updateBranch = async (id, updateData, performedBy) => {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw new Error('Branch not found');
  }

  if (updateData.branchCode && updateData.branchCode.toUpperCase() !== branch.branchCode) {
    const existingBranch = await Branch.findOne({ branchCode: updateData.branchCode.toUpperCase() });
    if (existingBranch) {
      throw new Error('Branch code already exists');
    }
  }

  // Prevent manager assignment via regular update, must use specific endpoint
  delete updateData.managerId;
  
  // Sanitize immutable identifiers from update payload to prevent MongoServerError
  delete updateData._id;
  delete updateData.id;

  const oldValues = branch.toObject();
  const updatedBranch = await Branch.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

  await createLog({
    module: 'BRANCH',
    action: 'UPDATE',
    entityType: 'BRANCH',
    entityId: updatedBranch._id,
    performedBy,
    oldValues,
    newValues: updatedBranch.toObject()
  });

  return updatedBranch;
};

const updateBranchStatus = async (id, status, performedBy) => {
  const branch = await Branch.findById(id);
  if (!branch) {
    throw new Error('Branch not found');
  }

  const newStatus = status.toUpperCase();
  if (!['ACTIVE', 'INACTIVE'].includes(newStatus)) {
    throw new Error('Invalid status');
  }

  const oldValues = { status: branch.status, deactivatedAt: branch.deactivatedAt, deactivatedBy: branch.deactivatedBy };
  
  branch.status = newStatus;
  if (newStatus === 'INACTIVE') {
    branch.deactivatedAt = new Date();
    branch.deactivatedBy = performedBy;
  } else {
    branch.deactivatedAt = undefined;
    branch.deactivatedBy = undefined;
  }

  await branch.save();

  await createLog({
    module: 'BRANCH',
    action: newStatus === 'ACTIVE' ? 'ACTIVATE' : 'DEACTIVATE',
    entityType: 'BRANCH',
    entityId: branch._id,
    performedBy,
    oldValues,
    newValues: { status: branch.status, deactivatedAt: branch.deactivatedAt, deactivatedBy: branch.deactivatedBy }
  });

  return branch;
};

const assignManager = async (branchId, newManagerId, performedBy) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const branch = await Branch.findById(branchId).session(session);
    if (!branch) throw new Error('Branch not found');

    const newManager = await User.findById(newManagerId).session(session);
    if (!newManager) throw new Error('New manager not found');
    if (newManager.status !== 'ACTIVE') throw new Error('Manager must be an active user');

    const oldManagerId = branch.managerId;

    // Remove old manager from branch
    if (oldManagerId) {
      await User.findByIdAndUpdate(oldManagerId, { $set: { branchId: null } }, { session });
    }

    // Assign branch to new manager
    await User.findByIdAndUpdate(newManagerId, { $set: { branchId: branch._id } }, { session });

    // Remove new manager from their old branch if they had one
    if (newManager.branchId && newManager.branchId.toString() !== branch._id.toString()) {
       await Branch.findByIdAndUpdate(newManager.branchId, { $set: { managerId: null } }, { session });
    }

    // Update current branch
    branch.managerId = newManagerId;
    await branch.save({ session });

    await session.commitTransaction();

    await createLog({
      module: 'BRANCH',
      action: oldManagerId ? 'REASSIGN_MANAGER' : 'ASSIGN_MANAGER',
      entityType: 'BRANCH',
      entityId: branch._id,
      performedBy,
      oldValues: { managerId: oldManagerId },
      newValues: { managerId: newManagerId }
    });

    return branch.populate('managerId', 'firstName lastName email');
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getBranchDashboard = async (branchId) => {
  // First verify branch exists
  await getBranchById(branchId);

  const now = new Date();
  
  // 1. Today's range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 2. Current Month's range
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // 3. Last 6 Months' range
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      monthNum: d.getMonth() + 1,
      monthName: monthNames[d.getMonth()],
      revenue: 0
    });
  }

  const sixMonthsAgoStart = new Date(months[0].year, months[0].monthNum - 1, 1, 0, 0, 0, 0);

  // Concurrency using Promise.all()
  const [todayResult, monthResult, trendData, inventoryValResult, lowStockCount, transfersCount, staffResult] = await Promise.all([
    Sale.aggregate([
      {
        $match: {
          branch: new mongoose.Types.ObjectId(branchId),
          status: 'completed',
          createdAt: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]),
    Sale.aggregate([
      {
        $match: {
          branch: new mongoose.Types.ObjectId(branchId),
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]),
    Sale.aggregate([
      {
        $match: {
          branch: new mongoose.Types.ObjectId(branchId),
          status: 'completed',
          createdAt: { $gte: sixMonthsAgoStart }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]),
    Inventory.aggregate([
      {
        $match: {
          branchId: new mongoose.Types.ObjectId(branchId)
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: [
                '$quantity',
                { $ifNull: ['$product.costPrice', 0] }
              ]
            }
          }
        }
      }
    ]),
    Inventory.countDocuments({
      branchId: new mongoose.Types.ObjectId(branchId),
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }),
    StockTransfer.countDocuments({
      $or: [
        { sourceBranch: new mongoose.Types.ObjectId(branchId) },
        { destinationBranch: new mongoose.Types.ObjectId(branchId) }
      ],
      status: 'PENDING'
    }),
    User.countDocuments({
      branchId: new mongoose.Types.ObjectId(branchId),
      status: 'ACTIVE'
    })
  ]);

  const todaySales = todayResult[0]?.total || 0;
  const monthlySales = monthResult[0]?.total || 0;
  const currentStockValue = inventoryValResult[0]?.totalValue || 0;
  const lowStockItemsCount = lowStockCount || 0;
  const pendingTransfers = transfersCount || 0;
  const staffCount = staffResult || 0;

  // Populate actual revenue into last 6 months list, filling missing months with 0
  trendData.forEach(item => {
    const matched = months.find(m => m.year === item._id.year && m.monthNum === item._id.month);
    if (matched) {
      matched.revenue = item.revenue;
    }
  });

  const salesTrend = months.map(m => ({
    month: m.monthName,
    revenue: m.revenue
  }));

  // Return real calculated metrics for all branch KPIs
  return {
    todaySales,
    monthlySales,
    monthlyRevenue: monthlySales, // alias support
    currentStockValue,
    lowStockItemsCount,
    staffCount,
    pendingTransfers,
    salesTrend
  };
};

const getBranchInventory = async (branchId) => {
  await getBranchById(branchId);
  return await inventoryService.getBranchInventory(branchId);
};

const getBranchTransfers = async (branchId) => {
  await getBranchById(branchId);
  return await StockTransfer.find({
    $or: [
      { sourceBranch: branchId },
      { destinationBranch: branchId }
    ]
  })
  .populate('sourceBranch')
  .populate('destinationBranch')
  .populate('items.productId')
  .populate('createdBy', 'firstName lastName username email')
  .populate('updatedBy', 'firstName lastName username email')
  .sort({ createdAt: -1 });
};

const getAdminDashboardSummary = async () => {
  const branches = await Branch.find().lean();
  
  // Mock cross-branch comparison data as per SRS
  return {
    totalBranches: branches.length,
    activeBranches: branches.filter(b => b.status === 'ACTIVE').length,
    totalRevenue: Math.floor(Math.random() * 100000000) + 40000000,
    totalInventoryValue: Math.floor(Math.random() * 50000000) + 20000000,
    lowStockAlerts: Math.floor(Math.random() * 100),
    revenueByBranch: branches.map(b => ({
      branchName: b.branchName,
      revenue: Math.floor(Math.random() * 15000000) + 2000000
    })).sort((a, b) => b.revenue - a.revenue),
    profitDistribution: branches.slice(0, 5).map(b => ({
      branchName: b.branchName,
      profitShare: Math.floor(Math.random() * 30) + 10
    })),
    ordersByBranch: branches.map(b => ({
      branchName: b.branchName,
      orders: Math.floor(Math.random() * 8000) + 1000
    })).sort((a, b) => b.orders - a.orders)
  };
};

const getBranchEmployees = async (branchId) => {
  return User.find({ branchId }).populate('roleId', 'name').select('-password');
};

const getActiveBranches = async () => {
  const branches = await Branch.find({ status: 'ACTIVE' })
    .sort({ branchName: 1 })
    .lean();
  
  return branches.map(b => ({
    _id: b._id,
    name: b.branchName,
    branchName: b.branchName,
    code: b.branchCode,
    branchCode: b.branchCode,
    location: b.address ? b.address.city : '',
    address: b.address
  }));
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  updateBranchStatus,
  assignManager,
  getBranchDashboard,
  getAdminDashboardSummary,
  getBranchEmployees,
  getActiveBranches,
  getBranchInventory,
  getBranchTransfers
};
