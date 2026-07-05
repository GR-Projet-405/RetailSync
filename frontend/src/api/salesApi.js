import axios from 'axios';

const salesApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

salesApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('retailsync_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getDashboardData = async (params = {}) => {
  const { branchId, startDate, endDate } = params;

  const response = await salesApi.get('/sales/dashboard', {
    params: {
      ...(branchId && { branchId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    },
  });

  return response.data;
};

export const getTransactions = async (params = {}) => {
  const {
    page,
    limit,
    status,
    paymentMethod,
    search,
    startDate,
    endDate,
    cashier,
  } = params;

  const response = await salesApi.get('/sales', {
    params: {
      ...(page && { page }),
      ...(limit && { limit }),
      ...(status && { status }),
      ...(paymentMethod && { paymentMethod }),
      ...(search && { search }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(cashier && { cashier }),
    },
  });

  return response.data;
};
