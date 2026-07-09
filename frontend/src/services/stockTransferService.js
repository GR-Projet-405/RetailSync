import api from './api';

// Fetch all stock transfers
export const getTransfers = async (params = {}) => {
  const { data } = await api.get('/stock-transfers', { params });
  return data;
};

// Fetch transfer by ID
export const getTransferById = async (id) => {
  const { data } = await api.get(`/stock-transfers/${id}`);
  return data;
};

// Create a stock transfer request
export const createTransfer = async (payload) => {
  const { data } = await api.post('/stock-transfers', payload);
  return data;
};

// Update transfer status (Approve, Reject, Cancel, etc.)
export const updateTransferStatus = async (id, status, notes = '', driverDetails = {}) => {
  const { data } = await api.patch(`/stock-transfers/${id}/status`, { status, notes, ...driverDetails });
  return data;
};

// Fetch all branches
export const getBranches = async () => {
  const { data } = await api.get('/branch-management');
  return data;
};

// Fetch all products
export const getProducts = async () => {
  const { data } = await api.get('/product-management');
  return data;
};

// Fetch inventory for a branch
export const getInventory = async (branchId) => {
  const { data } = await api.get('/inventory-management', {
    params: { branchId }
  });
  return data;
};
