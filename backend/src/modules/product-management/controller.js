const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getProducts = asyncHandler(async (req, res) => {
  const data = await service.getAllProducts();
  res.status(200).json({
    success: true,
    data,
  });
});

module.exports = {
  getProducts,
};
