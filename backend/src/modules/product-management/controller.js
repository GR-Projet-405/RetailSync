const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// GET Boilerplate handler
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails();
  res.status(200).json({
    success: true,
    message: 'Product Management module active. Mock inventory backend ready.',
    timestamp: new Date().toISOString(),
    data
  });
});

const getInventory = asyncHandler(async (req, res) => {
  const data = await service.fetchInventory(req.query);

  res.status(200).json({
    success: true,
    message: 'Mock inventory products loaded successfully.',
    timestamp: new Date().toISOString(),
    data,
  });
});

module.exports = {
  getDetails,
  getInventory,
};
