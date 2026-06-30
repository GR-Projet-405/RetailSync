const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'Branch Management module active. Under development.',
    timestamp: new Date().toISOString(),
    data,
  });
});

const getActiveBranches = asyncHandler(async (req, res) => {
  const branches = await service.fetchActiveBranches();
  res.status(200).json({
    success: true,
    message: 'Active branches fetched successfully',
    data: branches,
  });
});

module.exports = { getDetails, getActiveBranches };
