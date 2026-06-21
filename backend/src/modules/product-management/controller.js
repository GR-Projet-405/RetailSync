const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// GET Boilerplate handler
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'Product Management module active. Under development.',
    timestamp: new Date().toISOString(),
    data
  });
});

module.exports = {
  getDetails
};
