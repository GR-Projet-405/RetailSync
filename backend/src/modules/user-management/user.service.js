const User = require('./user.model');

// ─── Helpers ──────────────────────────────────────────────
const buildQuery = ({ search, role, status, branch }) => {
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

  if (role) query.role = role;
  if (status) query.status = status;
  if (branch && branch !== 'all') query.branch = branch;

  return query;
};

// ─── Service Methods ──────────────────────────────────────

/**
 * Get paginated list of users with optional filters
 */
const getUsers = async ({ search, role, status, branch, page = 1, limit = 10 }) => {
  const query = buildQuery({ search, role, status, branch });
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .populate('branch', 'name code city')
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
  const user = await User.findById(id).populate('branch', 'name code city').lean();
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

  return await User.findById(user._id).populate('branch', 'name code city').lean();
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
  ).populate('branch', 'name code city');

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
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return { deleted: true, id };
};

/**
 * Update user status (ACTIVE / INACTIVE / SUSPENDED)
 */
const updateUserStatus = async (id, status) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).populate('branch', 'name code city');

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
const updateUserRole = async (id, role) => {
  const user = await User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true, runValidators: true }
  ).populate('branch', 'name code city');

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
const getUserStats = async () => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
        inactive: { $sum: { $cond: [{ $eq: ['$status', 'INACTIVE'] }, 1, 0] } },
        suspended: { $sum: { $cond: [{ $eq: ['$status', 'SUSPENDED'] }, 1, 0] } },
      },
    },
  ]);

  const byRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    summary: stats[0] || { total: 0, active: 0, inactive: 0, suspended: 0 },
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
