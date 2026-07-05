const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// ─── GET /api/v1/branch-management/branches ───────────────
const getBranches = asyncHandler(async (req, res) => {
  const data = await service.getAllBranches();
  
  res.status(200).json({
    success: true,
    message: 'Branches retrieved successfully',
    data
  });
});

module.exports = {
  getBranches,
};


