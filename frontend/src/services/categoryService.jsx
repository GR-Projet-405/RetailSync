import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const categoryService = {
  // GET /category-management
  getAll: (params = {}) =>
    axios.get(`${API_BASE}/category-management`, {
      headers: getAuthHeaders(),
      params,
    }),

  // GET /category-management/tree
  getTree: () =>
    axios.get(`${API_BASE}/category-management/tree`, {
      headers: getAuthHeaders(),
    }),

  // GET /category-management/:id
  getById: (id) =>
    axios.get(`${API_BASE}/category-management/${id}`, {
      headers: getAuthHeaders(),
    }),

  // POST /category-management
  create: (data) =>
    axios.post(`${API_BASE}/category-management`, data, {
      headers: getAuthHeaders(),
    }),

  // PUT /category-management/:id
  update: (id, data) =>
    axios.put(`${API_BASE}/category-management/${id}`, data, {
      headers: getAuthHeaders(),
    }),

  // DELETE /category-management/:id
  remove: (id) =>
    axios.delete(`${API_BASE}/category-management/${id}`, {
      headers: getAuthHeaders(),
    }),
};

export default categoryService;