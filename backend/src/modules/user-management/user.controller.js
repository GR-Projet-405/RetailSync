const asyncHandler = require('../../utils/asyncHandler');
const service = require('./user.service');

// ─── GET /api/users ────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { search, roleId, status, branchId, page = 1, limit = 10 } = req.query;

  const result = await service.getUsers({
    search,
    roleId,
    status,
    branchId,
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
  const stats = await service.getUserStats();

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
  const user = await service.createUser(req.body);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
});

// ─── PUT /api/users/:id ────────────────────────────────────
const updateUser = asyncHandler(async (req, res) => {
  const user = await service.updateUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
});

// ─── DELETE /api/users/:id ─────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  const result = await service.deleteUser(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

// ─── PATCH /api/users/:id/status ──────────────────────────
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await service.updateUserStatus(req.params.id, status);

  res.status(200).json({
    success: true,
    message: `User status updated to ${status}`,
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
