import api from './api';

const BASE = '/category-management';

const categoryService = {
  // List all with filters + pagination
  getAll: (params = {}) =>
    api.get(BASE, { params }),

  // Full category tree
  getTree: () =>
    api.get(`${BASE}/tree`),

  // Single category by ID
  getById: (id) =>
    api.get(`${BASE}/${id}`),

  // Create
  create: (data) =>
    api.post(BASE, data),

  // Update
  update: (id, data) =>
    api.put(`${BASE}/${id}`, data),

  // Delete (soft)
  remove: (id) =>
    api.delete(`${BASE}/${id}`),

  // Legacy — used by ProductPage dropdowns
  listAll: async () => {
    const { data } = await api.get(BASE, { params: { limit: 200 } });
    return Array.isArray(data.data) ? data.data : data.data?.items || [];
  },
};

export default categoryService;