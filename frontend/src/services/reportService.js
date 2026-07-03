import api from './api';

// ─── Query key factory ────────────────────────────────────────────────────────

export const REPORT_KEYS = {
  all:               () => ['reports'],
  lists:             () => ['reports', 'list'],
  list:              (params) => ['reports', 'list', params],
  summary:           () => ['reports', 'summary'],
  detail:            (id) => ['reports', 'detail', id],
  branches:          () => ['branches', 'active'],
  branchPerformance: () => ['reports', 'branch-performance'],
};

// ─── API calls ────────────────────────────────────────────────────────────────

export const reportService = {
  /**
   * Fetch paginated list of recent reports.
   * @param {{ page?, limit?, type?, status?, search? }} params
   */
  getRecentReports: (params = {}) =>
    api.get('/reports', { params }).then((r) => r.data),

  /**
   * Fetch dashboard summary stats (KPI cards).
   */
  getSummaryStats: () =>
    api.get('/reports/summary').then((r) => r.data),

  /**
   * Generate a new report.
   * @param {{ type, name?, dateFrom?, dateTo?, allBranches?, branches?, additionalFilters? }} body
   */
  generateReport: (body) =>
    api.post('/reports/generate', body).then((r) => r.data),

  /**
   * Fetch a single report by ID.
   */
  getReportById: (id) =>
    api.get(`/reports/${id}`).then((r) => r.data),

  /**
   * Delete a report by ID.
   */
  deleteReport: (id) =>
    api.delete(`/reports/${id}`).then((r) => r.data),

  /**
   * Fetch all active branches (used by config page branch selector).
   */
  getBranches: () =>
    api.get('/branch-management/active').then((r) => r.data),

  /**
   * Fetch branch performance ranking derived from report metadata.
   */
  getBranchPerformance: () =>
    api.get('/reports/branch-performance').then((r) => r.data),
};
