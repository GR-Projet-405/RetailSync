import api from './api';

const BASE = '/warehouse-management';

/**
 * GET /api/v1/warehouse-management
 * @param {{ branchId }} params
 */
export const getWarehouses = async (params = {}) => {
  const { data } = await api.get(BASE, { params });
  return data;
};

/**
 * GET /api/v1/warehouse-management/:id
 */
export const getWarehouseById = async (id) => {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
};

/**
 * POST /api/v1/warehouse-management
 */
export const createWarehouse = async (payload) => {
  const { data } = await api.post(BASE, payload);
  return data;
};

/**
 * GET /api/v1/warehouse-management/:id/locations
 */
export const getWarehouseLocations = async (id) => {
  const { data } = await api.get(`${BASE}/${id}/locations`);
  return data;
};
