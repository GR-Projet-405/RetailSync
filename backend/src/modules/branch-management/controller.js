const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const Branch = require('./branch.model'); // Ensure the path matches your schema file location

// GET Boilerplate handler
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'Branch Management module active. Under development.',
    timestamp: new Date().toISOString(),
    data
  });
});



// ─── GET /api/v1/branch-management ────────────────────────
const getBranches = asyncHandler(async (req, res) => {
  const branches = await Branch.find({ status: 'ACTIVE' }).sort({ name: 1 });
  
  res.status(200).json({
    success: true,
    message: 'Branches retrieved successfully',
    data: branches
  });
});

module.exports = {
  getDetails,
  getBranches,
};


