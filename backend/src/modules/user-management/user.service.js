const mongoose = require('mongoose');
const User = require('./user.model');
const Role = require('../role-management/role.model');
// ─── Helpers ──────────────────────────────────────────────
const buildQuery = ({ search, roleId, status, branchId }) => {
const query = {};

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }

  if (roleId && roleId !== 'all') query.roleId = roleId;
  if (status && status !== 'all') query.status = status;
  if (branchId && branchId !== 'all') query.branchId = branchId;
  

  return query;
};

// ─── Service Methods ──────────────────────────────────────

/**
 * Get paginated list of users with optional filters
 */
const getUsers = async ({ search, roleId, status, branchId, page = 1, limit = 10 }) => {
  const query = buildQuery({ search, roleId, status, branchId });
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('roleId', 'name description isSystemRole')
      .populate('branchId', 'branchName branchCode name code address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single user by ID
 */
const getUserById = async (id) => {
  const user = await User.findById(id)
    .populate('roleId', 'name description permissions isSystemRole')
    .populate('branchId', 'branchName branchCode name code address phone email')
    .lean();
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Create a new user
 */
const createUser = async (userData) => {
 
  // Check if branch already has a Branch Manager
  if (userData.roleId) {
    const role = await Role.findById(userData.roleId);
    if (role?.name === 'BRANCH_MANAGER' && userData.branchId) {
      const existingBM = await User.findOne({
        branchId: userData.branchId,
        roleId: userData.roleId,
        status: { $ne: 'INACTIVE' }
      }).populate('roleId');
      
      if (existingBM?.roleId?.name === 'BRANCH_MANAGER') {
        const err = new Error('This branch already has an active Branch Manager.');
        err.statusCode = 409;
        throw err;
      }
    }
  }
  
  // Check uniqueness
  const existing = await User.findOne({
    $or: [{ username: userData.username }, { email: userData.email }],
  });

  if (existing) {
    const field = existing.username === userData.username ? 'Username' : 'Email';
    const err = new Error(`${field} already exists`);
    err.statusCode = 409;
    throw err;
  }

  const user = new User(userData);
  await user.save();

  return await User.findById(user._id)
    .populate('roleId', 'name description')
    .populate('branchId', 'branchName branchCode name code address')
    .lean();
};

/**
 * Update user details (excluding password and _id)
 */
const updateUser = async (id, updateData) => {
  // If updating username or email, check uniqueness
  if (updateData.username || updateData.email) {
    const orConditions = [];
    if (updateData.username) orConditions.push({ username: updateData.username });
    if (updateData.email) orConditions.push({ email: updateData.email });

    const existing = await User.findOne({
      $or: orConditions,
      _id: { $ne: id },
    });

    if (existing) {
      const field = existing.username === updateData.username ? 'Username' : 'Email';
      const err = new Error(`${field} already in use by another account`);
      err.statusCode = 409;
      throw err;
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('roleId', 'name description')
   .populate('branchId', 'branchName branchCode name code address');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

/**
 * Delete user
 */
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Update user status (ACTIVE / INACTIVE / SUSPENDED)
 */
const updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).populate('roleId', 'name description')
   .populate('branchId', 'branchName branchCode name code address');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

/**
 * Reset user password
 */
const resetPassword = async (id, newPassword) => {
  const user = await User.findById(id).select('+password');
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  user.password = newPassword; // Pre-save hook will hash it
  await user.save();

  return { reset: true, id };
};

/**
 * Update user role
 */
const updateUserRole = async (id, roleId) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { roleId } },
    { new: true, runValidators: true }
  ).populate('roleId', 'name description')
   .populate('branchId', 'branchName branchCode name code address');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return user;
};

/**
 * Get aggregated stats for dashboard
 */
const getUserStats = async (branchId = null) => {
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  fourteenDaysAgo.setHours(0, 0, 0, 0); // round to midnight

  const branchFilter = branchId
    ? { $match: { branchId: new mongoose.Types.ObjectId(String(branchId)) } }
    : null;

  const stats = await User.aggregate([
    ...(branchFilter ? [branchFilter] : []),
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ['$status', 'INACTIVE'] }, 1, 0] } },
        suspended: { $sum: { $cond: [{ $eq: ['$status', 'SUSPENDED'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
        onLeave: { $sum: { $cond: [{ $eq: ['$isOnLeave', true] }, 1, 0] } },
        newHires: { $sum: { $cond: [{ $gte: ['$createdAt', fourteenDaysAgo] }, 1, 0] } },
      },
    },
  ]);

  const byRole = await User.aggregate([
    ...(branchFilter ? [branchFilter] : []),
    {
      $lookup: {
        from: 'roles', // Name of the roles collection
        localField: 'roleId',
        foreignField: '_id',
        as: 'roleData',
      },
    },
    { $unwind: '$roleData' },
    { $group: { _id: '$roleData.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    summary: stats[0] || { total: 0, active: 0, inactive: 0, suspended: 0, pending: 0,
    onLeave: 0,
    newHires: 0,},
    byRole,
  };
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetPassword,
  updateUserRole,
  getUserStats,
};
