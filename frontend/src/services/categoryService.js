import api from './api';

// Matches app.js dynamic route mounting: app.use(`/api/v1/${folderName}`, router)
// where folderName === 'category-management'. If your category module's
// folder is named differently, just change BASE below.
const BASE = '/category-management';

export const categoryService = {
  /**
   * Returns the full category list (no pagination) — used to populate
   * dropdowns in Product List filters and the Add/Edit Product form.
   */
  listAll: async () => {
    const { data } = await api.get(BASE, { params: { limit: 200 } });
    // Supports either { data: [...] } or { data: { items: [...] } } shapes
    return Array.isArray(data.data) ? data.data : data.data?.items || [];
  },
};

export default categoryService;
