import api from '../../../services/api';

const BASE = '/customers';

const normalizeCustomer = (customer) => {
  if (!customer) return customer;
  return {
    ...customer,
    name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
  };
};

const getCustomers = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  const payload = data.data || {};
  if (payload.customers) {
    payload.customers = payload.customers.map(normalizeCustomer);
  }
  return payload;
};

const getCustomerById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return normalizeCustomer(data.data);
};

const createCustomer = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return normalizeCustomer(data.data);
};

const updateCustomer = async (id, payload) => {
  const { data } = await api.put(`${BASE}/${id}`, payload);
  return normalizeCustomer(data.data);
};

const deactivateCustomer = async (id) => {
  const { data } = await api.patch(`${BASE}/${id}/deactivate`);
  return normalizeCustomer(data.data);
};

const getCustomerPurchaseHistory = async (id) => {
  const { data } = await api.get(`${BASE}/${id}/purchase-history`);
  return data.data;
};

const getCustomerStats = async () => {
  const { data } = await api.get(`${BASE}/stats`);
  return data.data;
};

export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deactivateCustomer,
  getCustomerPurchaseHistory,
  getCustomerStats,
};
