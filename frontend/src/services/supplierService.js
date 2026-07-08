import api from '../services/api';

const BASE = '/supplier-management';

// ─── Query Keys ────────────────────────────────────────────
export const SUPPLIER_QUERY_KEYS = {
  all:         ['suppliers'],
  list:        (filters) => ['suppliers', 'list', filters],
  detail:      (id) => ['suppliers', 'detail', id],
  stats:       ['suppliers', 'stats'],
  contacts:    (id) => ['suppliers', id, 'contacts'],
  performance: (id) => ['suppliers', id, 'performance'],
};

// ─── Suppliers ────────────────────────────────────────────

/**
 * GET /api/v1/supplier-management
 * @param {{ status, category, search, page, limit }} params
 */
export const getSuppliers = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data;
};

/**
 * GET /api/v1/supplier-management/stats
 */
export const getSupplierStats = async () => {
  const { data } = await api.get(`${BASE}/stats`);
  return data;
};

/**
 * GET /api/v1/supplier-management/:id
 */
export const getSupplierById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
};

/**
 * POST /api/v1/supplier-management
 */
export const createSupplier = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data;
};

/**
 * PUT /api/v1/supplier-management/:id
 */
export const updateSupplier = async (id, payload) => {
  const { data } = await api.put(`${BASE}/${id}`, payload);
  return data;
};

/**
 * DELETE /api/v1/supplier-management/:id
 */
export const deleteSupplier = async (id) => {
  const { data } = await api.delete(`${BASE}/${id}`);
  return data;
};

// ─── Contacts ────────────────────────────────────────────

/**
 * GET /api/v1/supplier-management/:id/contacts
 */
export const getContacts = async (supplierId) => {
  const { data } = await api.get(`${BASE}/${supplierId}/contacts`);
  return data;
};

/**
 * POST /api/v1/supplier-management/:id/contacts
 */
export const addContact = async (supplierId, payload) => {
  const { data } = await api.post(`${BASE}/${supplierId}/contacts`, payload);
  return data;
};

/**
 * PUT /api/v1/supplier-management/:id/contacts/:contactId
 */
export const updateContact = async (supplierId, contactId, payload) => {
  const { data } = await api.put(`${BASE}/${supplierId}/contacts/${contactId}`, payload);
  return data;
};

/**
 * DELETE /api/v1/supplier-management/:id/contacts/:contactId
 */
export const deleteContact = async (supplierId, contactId) => {
  const { data } = await api.delete(`${BASE}/${supplierId}/contacts/${contactId}`);
  return data;
};

// ─── Performance ─────────────────────────────────────────

/**
 * GET /api/v1/supplier-management/:id/performance
 */
export const getPerformance = async (supplierId) => {
  const { data } = await api.get(`${BASE}/${supplierId}/performance`);
  return data;
};

/**
 * PUT /api/v1/supplier-management/:id/performance
 */
export const updatePerformance = async (supplierId, payload) => {
  const { data } = await api.put(`${BASE}/${supplierId}/performance`, payload);
  return data;
};
