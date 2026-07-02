const asyncHandler = require('../../utils/asyncHandler');
const service = require('./service');

// @desc    Get logged-in user profile details
// @route   GET /api/v1/profile-settings
// @access  Private
const getDetails = asyncHandler(async (req, res) => {
  const data = await service.fetchDetails(req.user);
  res.status(200).json({
    success: true,
    message: 'Profile details fetched successfully.',
    timestamp: new Date().toISOString(),
    data
  });
});

// @desc    Update logged-in user profile fields
// @route   PUT /api/v1/profile-settings/update
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNumber } = req.body;
  
  // Pass the updated values along with the active user context
  const updatedData = await service.modifyProfile(req.user, { 
    firstName, 
    lastName, 
    phoneNumber 
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    timestamp: new Date().toISOString(),
    data: updatedData
  });
});


// @desc    Change logged-in user password
// @route   PUT /api/v1/profile-settings/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await service.modifyPassword(req.user, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Your password was modified successfully.',
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getDetails,
  updateProfile,
  changePassword
};