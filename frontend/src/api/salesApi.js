import api from '../services/api';

const getSalesBaseURL = () => {
  const base = api.defaults.baseURL || '/api/v1';
  return base.endsWith('/v1') ? base.slice(0, -3) : base;
};

const salesApi = {
  get: (url, config = {}) => api.get(url, { ...config, baseURL: getSalesBaseURL() }),
  post: (url, data, config = {}) => api.post(url, data, { ...config, baseURL: getSalesBaseURL() }),
  put: (url, data, config = {}) => api.put(url, data, { ...config, baseURL: getSalesBaseURL() }),
  delete: (url, config = {}) => api.delete(url, { ...config, baseURL: getSalesBaseURL() }),
};

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

export const getSaleById = async (id) => {
  const response = await salesApi.get(`/sales/${id}`);
  return response.data;
};

export const getFilteredSales = async (filters = {}) => {
  const response = await salesApi.get('/sales/filter', {
    params: filters,
  });

  return response.data;
};

const getDownloadFileName = (response, fallbackName) => {
  const disposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition'] || '';
  const fileNameMatch = disposition.match(/filename="?([^";]+)"?/i);

  if (fileNameMatch?.[1]) {
    return fileNameMatch[1];
  }

  return fallbackName;
};

export const exportSalesReport = async (params = {}) => {
  const response = await salesApi.get('/sales/export', {
    params,
    responseType: 'blob',
  });

  const format = String(params.format || 'xlsx').toLowerCase();
  const extension = format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'xlsx';
  const fallbackName = `SalesReport_${new Date().toISOString().slice(0, 10)}.${extension}`;
  const fileName = getDownloadFileName(response, fallbackName);

  const blob = new Blob([response.data], {
    type: response.headers?.['content-type'] || response.headers?.['Content-Type'] || 'application/octet-stream',
  });

  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);

  return fileName;
};
