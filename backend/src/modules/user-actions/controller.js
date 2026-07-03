const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// 1. POST /api/v1/user-actions - Create a new audit log
const createLog = asyncHandler(async (req, res) => {
  const newLog = await service.createLog(req.body);
  res.status(201).json({
    success: true,
    message: 'User action log created successfully',
    data: newLog
  });
});

// 2. GET /api/v1/user-actions - Retrieve audit logs with filters & search
const getLogs = asyncHandler(async (req, res) => {
  const { search, page, limit, module, riskLevel, startDate, endDate } = req.query;

  const result = await service.getLogs({
    search,
    page,
    limit,
    module,
    riskLevel,
    startDate,
    endDate
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

// 3. GET /api/v1/user-actions/stats - Retrieve aggregated stats
const getStats = asyncHandler(async (req, res) => {
  const stats = await service.getStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

// 4. GET /api/v1/user-actions/:id - Retrieve a single audit log
const getLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const log = await service.getLogById(id);
  res.status(200).json({
    success: true,
    data: log
  });
});

module.exports = {
  createLog,
  getLogs,
  getStats,
  getLogById
};
