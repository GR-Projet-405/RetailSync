const asyncHandler = require('../../utils/asyncHandler');
const service = require('./user.service');

// ─── GET /api/users ────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { search, roleId, status, branchId, page = 1, limit = 10 } = req.query;

  // Branch Managers can only see employees from their own branch
  // We ignore whatever branchId they send in the query and force their own
  let effectiveBranchId = branchId;
  if (req.user.roleId.name === 'BRANCH_MANAGER') {
    if (!req.user.branchId) {
      // Branch Manager not assigned to any branch — return empty result
      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: { users: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } },
      });
    }
    effectiveBranchId = req.user.branchId._id;
  }
  const result = await service.getUsers({
    search,
    roleId,
    status,
     branchId: effectiveBranchId,
    page: Number(page),
    limit: Number(limit),
  });

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

// ─── GET /api/users/stats ──────────────────────────────────
const getUserStats = asyncHandler(async (req, res) => {
  // Branch Managers only see stats for their own branch
  let branchId = null;
  if (req.user.roleId.name === 'BRANCH_MANAGER') {
    branchId = req.user.branchId?._id || null;
  }
  const stats = await service.getUserStats(branchId);

  res.status(200).json({
    success: true,
    message: 'User stats retrieved successfully',
    data: stats,
  });
});

// ─── GET /api/users/:id ────────────────────────────────────
const getUserById = asyncHandler(async (req, res) => {
  const user = await service.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});

// ─── POST /api/users ───────────────────────────────────────
const createUser = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.profileImage = `/uploads/employees/${req.file.filename}`;
  }

  // BR-USR-003: Branch Managers can only create Cashier and Inventory Staff
  if (req.user.roleId.name === 'BRANCH_MANAGER') {
    const allowedRoles = ['CASHIER', 'INVENTORY_MANAGER'];
    
    // Find the role document to get its name
    const Role = require('../role-management/role.model');
    const assignedRole = await Role.findById(req.body.roleId);
    
    if (!assignedRole || !allowedRoles.includes(assignedRole.name)) {
      return res.status(403).json({
        success: false,
        message: 'Branch Managers can only create Cashier and Inventory Staff accounts.',
      });
    }

    // Also force the branch to their own branch
    req.body.branchId = req.user.branchId._id;
  }

  const user = await service.createUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

// ─── PUT /api/users/:id ────────────────────────────────────
const updateUser = asyncHandler(async (req, res) => {
  if (req.file) {
    req.body.profileImage = `/uploads/employees/${req.file.filename}`;
  }

  const user = await service.updateUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

// ─── DELETE /api/users/:id ─────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  const result = await service.updateUserStatus(req.params.id, 'INACTIVE');

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

// ─── PATCH /api/users/:id/status ──────────────────────────
const updateUserStatus = asyncHandler(async (req, res) => {
  const targetUser = await service.getUserById(req.params.id);

  // Prevent self-deactivation
  if (String(req.params.id) === String(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'You cannot change your own account status.',
    });
  }

   // Branch Managers cannot change status of Admins or other Branch Managers
  if (req.user.roleId.name === 'BRANCH_MANAGER') {
    const restrictedRoles = ['SUPER_ADMIN', 'ADMIN', 'BRANCH_MANAGER'];
    if (restrictedRoles.includes(targetUser.roleId?.name)) {
      return res.status(403).json({
        success: false,
        message: 'Branch Managers cannot change status of Admins or other Branch Managers.',
      });
    }
// Also enforce branch ownership
    if (String(targetUser.branchId?._id) !== String(req.user.branchId?._id)) {
      return res.status(403).json({
        success: false,
        message: 'Branch Managers can only manage employees in their own branch.',
      });
    }
  }

  const { status } = req.body;
  const user = await service.updateUserStatus(req.params.id, status);

  res.status(200).json({
    success: true,
    message: 'User status updated successfully',
    data: user,
  });
});
  
// ─── PATCH /api/users/:id/reset-password ──────────────────
const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const result = await service.resetPassword(req.params.id, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
    data: result,
  });
});

// ─── PATCH /api/users/:id/role ─────────────────────────────
const updateUserRole = asyncHandler(async (req, res) => {
  const { roleId } = req.body;
  const user = await service.updateUserRole(req.params.id, roleId);

  res.status(200).json({
    success: true,
    message: `User role updated successfully`,
    data: user,
  });
});

module.exports = {
  getUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  resetPassword,
  updateUserRole,
};
