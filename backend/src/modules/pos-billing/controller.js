const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'POS Billing module active. Under development.',
    timestamp: new Date().toISOString(),
    data
  });
});

module.exports = {
  getDetails
};
