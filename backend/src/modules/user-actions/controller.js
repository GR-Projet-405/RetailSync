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
  const { search, page, limit, module, riskLevel, startDate, endDate, userId } = req.query;

  const result = await service.getLogs({
    search,
    page,
    limit,
    module,
    riskLevel,
    startDate,
    endDate,
    userId
  });

  res.status(200).json({
    success: true,
    data: result
  });
});

// 3. GET /api/v1/user-actions/stats - Retrieve aggregated stats
const getStats = asyncHandler(async (req, res) => {
  const { userId } = req.query;
  const stats = await service.getStats({ userId });
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

// 5. POST /api/v1/user-actions/export - Export user logs as PDF
const exportLogs = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }
  const pdfBuffer = await service.generatePdfExport(userId);
  
  const filename = `user_footprint_export_${new Date().toISOString().split('T')[0]}.pdf`;
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', pdfBuffer.length);
  
  res.send(pdfBuffer);
});

module.exports = {
  createLog,
  getLogs,
  getStats,
  getLogById,
  exportLogs
};
