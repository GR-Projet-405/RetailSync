const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password',
    });
  }

  const { user, token } = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);

  res.status(200).json({
    success: true,
    message: 'User data retrieved successfully',
    data: user,
  });
});

const logout = asyncHandler(async (req, res) => {
  // Since we use JWT in local storage, logout is mostly a frontend action.
  // We just return a success response.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: {},
  });
});

module.exports = {
  login,
  getMe,
  logout,
};
