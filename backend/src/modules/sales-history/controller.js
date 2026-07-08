const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// GET Boilerplate handler
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'Sales History module active. Under development.',
    timestamp: new Date().toISOString(),
    data
  });
});

const getDashboard = asyncHandler(async (req, res) => {
  const data = await service.fetchDashboard(req);

  res.status(200).json(data);
});

module.exports = {
  getDetails,
  getDashboard
};
