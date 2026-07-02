const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// @desc    Get logged-in user profile details
// @route   GET /api/v1/profile-settings
// @access  Private
const getDetails = asyncHandler(async (req, res) => {
  // Pass the already fetched and populated user object from the middleware to the service
  const data = await service.fetchDetails(req.user);
  
  res.status(200).json({
    success: true,
    message: 'Profile details fetched successfully.',
    timestamp: new Date().toISOString(),
    data
  });
});

module.exports = {
  getDetails
};