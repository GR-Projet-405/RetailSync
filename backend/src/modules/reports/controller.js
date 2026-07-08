const asyncHandler = require('../../utils/asyncHandler');
const service      = require('./service');

// GET /api/v1/reports
const getRecentReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, status, search } = req.query;

  const result = await service.getRecentReports({
    page:   parseInt(page),
    limit:  parseInt(limit),
    type,
    status,
    search,
  });

  res.status(200).json({
    success: true,
    message: 'Reports fetched successfully',
    data: result,
  });
});

// GET /api/v1/reports/branch-performance
const getBranchPerformance = asyncHandler(async (req, res) => {
  const data = await service.getBranchPerformance();

  res.status(200).json({
    success: true,
    message: 'Branch performance fetched successfully',
    data,
  });
});

// GET /api/v1/reports/summary
const getSummaryStats = asyncHandler(async (req, res) => {
  const data = await service.getSummaryStats();

  res.status(200).json({
    success: true,
    message: 'Summary stats fetched successfully',
    data,
  });
});

// POST /api/v1/reports/generate
const generateReport = asyncHandler(async (req, res) => {
  const report = await service.generateReport(req.body, req.user._id);

  res.status(201).json({
    success: true,
    message: 'Report generated successfully',
    data: report,
  });
});

// GET /api/v1/reports/:id
const getReportById = asyncHandler(async (req, res) => {
  const report = await service.getReportById(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Report fetched successfully',
    data: report,
  });
});

// DELETE /api/v1/reports/:id
const deleteReport = asyncHandler(async (req, res) => {
  const result = await service.deleteReport(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Report deleted successfully',
    data: result,
  });
});

module.exports = {
  getRecentReports,
  getSummaryStats,
  getBranchPerformance,
  generateReport,
  getReportById,
  deleteReport,
};
