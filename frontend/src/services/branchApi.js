import api from './api';

export const branchApi = {
  // Collection methods
  getBranches: async (params) => {
    const { data } = await api.get('/branch-management', { params });
    return data;
  },

  createBranch: async (branchData) => {
    const { data } = await api.post('/branch-management', branchData);
    return data;
  },

  // Individual branch methods
  getBranchById: async (id) => {
    const { data } = await api.get(`/branch-management/${id}`);
    return data;
  },

  updateBranch: async (id, branchData) => {
    const { data } = await api.patch(`/branch-management/${id}`, branchData);
    return data;
  },

  updateBranchStatus: async (id, status) => {
    const { data } = await api.patch(`/branch-management/${id}/status`, { status });
    return data;
  },

  assignManager: async (id, managerId) => {
    const { data } = await api.patch(`/branch-management/${id}/manager`, { managerId });
    return data;
  },

  // Dashboards & Summaries
  getAdminComparison: async () => {
    const { data } = await api.get('/branch-management/admin/comparison');
    return data;
  },

  getMyDashboard: async () => {
    const { data } = await api.get('/branch-management/my-branch/dashboard');
    return data;
  },

  getBranchDashboard: async (id) => {
    const { data } = await api.get(`/branch-management/${id}/dashboard`);
    return data;
  },

  // Tabs
  getBranchEmployees: async (id) => {
    const { data } = await api.get(`/branch-management/${id}/employees`);
    return data;
  },

  getBranchInventory: async (id) => {
    const { data } = await api.get(`/branch-management/${id}/inventory-summary`);
    return data;
  },

  getBranchTransfers: async (id) => {
    const { data } = await api.get(`/branch-management/${id}/transfers`);
    return data;
  },

  getBranchAuditLogs: async (id) => {
    const { data } = await api.get(`/branch-management/${id}/audit-logs`);
    return data;
  },
};
