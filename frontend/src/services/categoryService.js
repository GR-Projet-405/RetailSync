import api from './api';

const BASE = '/category-management';

export const categoryService = {
  // List all with filters + pagination (GET /category-management)
  getAll: (params = {}) =>
    api.get(BASE, { params }),

  // Full category tree (GET /category-management/tree)
  getTree: () =>
    api.get(`${BASE}/tree`),

  // Single category by ID (GET /category-management/:id)
  getById: (id) =>
    api.get(`${BASE}/${id}`),

  // Create (POST /category-management)
  create: (data) =>
    api.post(BASE, data),

  // Update (PUT /category-management/:id)
  update: (id, data) =>
    api.put(`${BASE}/${id}`, data),

  // Delete (soft) (DELETE /category-management/:id)
  remove: (id) =>
    api.delete(`${BASE}/${id}`),

  /**
   * Returns the full category list (no pagination) — used to populate
   * dropdowns in Product List filters and the Add/Edit Product form.
   * Legacy — used by ProductPage dropdowns
   */
  listAll: async () => {
    const { data } = await api.get(BASE, { params: { limit: 200 } });
    return Array.isArray(data.data) ? data.data : data.data?.items || [];
  },
};

export default categoryService;