import api from './api';

// 🔑 Query key factory - same pattern as USER_QUERY_KEYS in userService.js
export const GR_QUERY_KEYS = {
  all: ['goods-receiving'],
  dashboard: ['goods-receiving', 'dashboard'],
  history: (filters) => ['goods-receiving', 'history', filters],
  reports: (filters) => ['goods-receiving', 'reports', filters],
  detail: (id) => ['goods-receiving', 'detail', id],
  verification: (id) => ['goods-receiving', 'verification', id],
};

// ─── Goods Receipt Form 📝 ─────────────────────────────────
export const createReceipt = async (payload) => {
  const res = await api.post('/goods-receiving', payload);
  return res.data.data;
};

export const getReceiptById = async (id) => {
  const res = await api.get(`/goods-receiving/${id}`);
  return res.data.data;
};

// ─── Receiving Dashboard 📊 ────────────────────────────────
export const getDashboardStats = async (params) => {
  const res = await api.get('/goods-receiving/dashboard', { params });
  return res.data.data;
};

// ─── Received Items History 📜 ─────────────────────────────
export const getReceivedItemsHistory = async (params) => {
  const res = await api.get('/goods-receiving/history/list', { params });
  return res.data; // { data, summary, page, limit }
};

// ─── Receiving Reports 📈 ──────────────────────────────────
export const getReceivingReports = async (params) => {
  const res = await api.get('/goods-receiving/reports/summary', { params });
  return res.data.data;
};

// ─── Verification Screen ✅ ────────────────────────────────
export const getReceiptForVerification = async (id) => {
  const res = await api.get(`/goods-receiving/${id}/verify`);
  return res.data.data;
};

export const verifyItem = async (id, itemId, body) => {
  const res = await api.patch(`/goods-receiving/${id}/items/${itemId}/verify`, body);
  return res.data.data;
};

export const approveAllItems = async (id, body) => {
  const res = await api.patch(`/goods-receiving/${id}/approve-all`, body);
  return res.data.data;
};

export const partialApproveItems = async (id, body) => {
  const res = await api.patch(`/goods-receiving/${id}/partial-approve`, body);
  return res.data.data;
};

export const rejectReceipt = async (id, body) => {
  const res = await api.patch(`/goods-receiving/${id}/reject`, body);
  return res.data.data;
};

export const flagReceiptForManager = async (id, body) => {
  const res = await api.patch(`/goods-receiving/${id}/flag`, body);
  return res.data.data;
};