import api from './api';

const BASE = '/audit-logs';

// ─── Query Keys ───────────────────────────────────────────
export const AUDIT_QUERY_KEYS = {
  all: ['audit'],
  dashboard: ['audit', 'dashboard'],
  activityLogs: (filters, page) => ['audit', 'activity-logs', filters, page],
};

// ─── API Functions ────────────────────────────────────────

/**
 * GET /api/v1/audit-logs
 */
export const getAuditDetails = async () => {
  const { data } = await api.get(BASE);
  return data;
};

/**
 * GET /api/v1/audit-logs/dashboard
 * Returns KPIs, activity trends, branch distribution, and recent activities
 */
export const getDashboardData = async () => {
  const { data } = await api.get(`${BASE}/dashboard`);
  return data;
};

/**
 * GET /api/v1/audit-logs/activity-logs
 * @param {{ dateRange, branch, user, module, eventType, page, limit }} params
 */
export const getActivityLogs = async (params = {}) => {
  const { data } = await api.get(`${BASE}/activity-logs`, { params });
  return data;
};
