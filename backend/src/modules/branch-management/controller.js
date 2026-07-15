const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getBranches = asyncHandler(async (req, res) => {
  const branches = await service.getBranches();

  res.status(200).json({
    success: true,
    message: 'Branches retrieved successfully',
    data: branches,
  });
});

module.exports = { getBranches };