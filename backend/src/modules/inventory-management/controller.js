const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getInventory = asyncHandler(async (req, res) => {
  const { branchId } = req.query;
  const data = await service.getBranchInventory(branchId);
  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  getInventory,
};
