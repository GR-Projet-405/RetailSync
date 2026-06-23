import api from '../services/api';

const BASE = '/user-management';

// ─── Query Keys ───────────────────────────────────────────
export const USER_QUERY_KEYS = {
  all:    ['users'],
  list:   (filters) => ['users', 'list', filters],
  detail: (id) => ['users', 'detail', id],
  stats:  ['users', 'stats'],
};

// ─── API Functions ────────────────────────────────────────

/**
 * GET /api/v1/user-management
 * @param {{ search, role, status, branch, page, limit }} params
 */
export const getUsers = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data;
};

/**
 * GET /api/v1/user-management/stats
 */
export const getUserStats = async () => {
  const { data } = await api.get(`${BASE}/stats`);
  return data;
};

/**
 * GET /api/v1/user-management/:id
 */
export const getUserById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
};

/**
 * POST /api/v1/user-management
 */
export const createUser = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data;
};

/**
 * PUT /api/v1/user-management/:id
 */
export const updateUser = async (id, payload) => {
  const { data } = await api.put(`${BASE}/${id}`, payload);
  return data;
};

/**
 * DELETE /api/v1/user-management/:id
 */
export const deleteUser = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
};

/**
 * PATCH /api/v1/user-management/:id/status
 */
export const updateUserStatus = async (id, status) => {
  const { data } = await api.patch(`${BASE}/${id}/status`, { status });
  return data;
};

/**
 * PATCH /api/v1/user-management/:id/reset-password
 */
export const resetUserPassword = async (id, newPassword, confirmPassword) => {
  const { data } = await api.patch(`${BASE}/${id}/reset-password`, {
    newPassword,
    confirmPassword,
  });
  return data;
};

/**
 * PATCH /api/v1/user-management/:id/role
 */
export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`${BASE}/${id}/role`, { role });
  return data;
};
