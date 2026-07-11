// import api from './api';

// export const getSuppliers = async (params = {}) => {
//   const res = await api.get('/supplier-management', { params });
//   return res.data.data; // array of { _id, name, ... }
// };

// export const getSupplierById = async (id) => {
//   const res = await api.get(`/supplier-management/${id}`);
//   return res.data.data;
// };
import api from './api';

export const SUPPLIER_QUERY_KEYS = {
  all: ['suppliers'],
  list: (params) => ['suppliers', 'list', params],
  detail: (id) => ['suppliers', 'detail', id],
};

export const getSuppliers = async (params = {}) => {
  const res = await api.get('/supplier-management', { params });
  return res.data.data; // array of { _id, name, contactPerson, email, phone, address, status }
};

export const getSupplierById = async (id) => {
  const res = await api.get(`/supplier-management/${id}`);
  return res.data.data;
};

export const createSupplier = async (payload) => {
  const res = await api.post('/supplier-management', payload);
  return res.data.data;
};

export const updateSupplier = async (id, payload) => {
  const res = await api.put(`/supplier-management/${id}`, payload);
  return res.data.data;
};

export const deactivateSupplier = async (id) => {
  const res = await api.patch(`/supplier-management/${id}/deactivate`);
  return res.data.data;
};

