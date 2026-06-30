const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getBranches = asyncHandler(async (req, res) => {
  const data = await service.getAllBranches();
  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  getBranches,
};
