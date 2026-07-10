import api from './api';

// Matches app.js dynamic route mounting: app.use(`/api/v1/${folderName}`, router)
// where folderName === 'product-management'
const BASE = '/product-management';

export const productService = {
  /**
   * Product List screen
   * params: { page, limit, category, status, search }
   * -> { success, message, data: Product[], pagination }
   */
  list: async (params = {}) => {
    const { data } = await api.get(BASE, { params });
    return data;
  },

  /**
   * Product Search screen
   * params: { q, category, minPrice, maxPrice, inStock, page, limit, sortBy }
   * -> { success, message, data: Product[], relatedSearches, pagination }
   */
  search: async (params = {}) => {
    const { data } = await api.get(`${BASE}/search`, { params });
    return data;
  },

  /** Product Details screen */
  getById: async (id) => {
    const { data } = await api.get(`${BASE}/${id}`);
    return data.data;
  },

  /** Add New Product screen */
  create: async (payload) => {
    const { data } = await api.post(BASE, payload);
    return data.data;
  },

  /** Edit Product screen */
  update: async (id, payload) => {
    const { data } = await api.put(`${BASE}/${id}`, payload);
    return data.data;
  },

  /** Delete action (Edit Product screen / row action) */
  remove: async (id) => {
    const { data } = await api.delete(`${BASE}/${id}`);
    return data.data;
  },
};

export default productService;
