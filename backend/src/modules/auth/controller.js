const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password, phoneNumber } = req.body;

  if (!firstName || !lastName || !username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  const result = await authService.register({
    firstName,
    lastName,
    username,
    email,
    password,
    phoneNumber,
  });

  res.status(201).json({
    success: true,
    message: result.message,
    data: { userId: result.userId },
  });
});

const verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp, purpose } = req.body;

  if (!userId || !otp || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Please provide userId, OTP, and purpose',
    });
  }

  await authService.verifyOTP(userId, otp, purpose);

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
  });
});

const resendOTP = asyncHandler(async (req, res) => {
  const { userId, purpose } = req.body;

  if (!userId || !purpose) {
    return res.status(400).json({
      success: false,
      message: 'Please provide userId and purpose',
    });
  }

  await authService.resendOTP(userId, purpose);

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email address',
    });
  }

  const result = await authService.forgotPassword(email);

  res.status(200).json({
    success: true,
    message: result.message,
    data: result.userId ? { userId: result.userId } : {},
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { userId, otp, newPassword, confirmPassword } = req.body;

  if (!userId || !otp || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields',
    });
  }

  await authService.resetPassword(userId, otp, newPassword, confirmPassword);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

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
  register,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  login,
  getMe,
  logout,
};
