import api from './api';  // ✅ Use api instance instead of direct axios

const categoryService = {
  // GET /category-management
  getAll: (params = {}) =>
    api.get('/category-management', { params }),

  // GET /category-management/tree
  getTree: () =>
    api.get('/category-management/tree'),

  // GET /category-management/:id
  getById: (id) =>
    api.get(`/category-management/${id}`),

  // POST /category-management
  create: (data) =>
    api.post('/category-management', data),

  // PUT /category-management/:id
  update: (id, data) =>
    api.put(`/category-management/${id}`, data),

  // DELETE /category-management/:id
  remove: (id) =>
    api.delete(`/category-management/${id}`),
};

export default categoryService;