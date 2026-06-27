const User = require('../user-management/user.model');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const OTP = require('./otp.model');
const sendEmail = require('../../config/email');

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Registration with OTP
const register = async (userData) => {
  // Check if user exists
  const existingUser = await User.findOne({ 
    $or: [{ email: userData.email }, { username: userData.username }] 
  });

  if (existingUser) {
    const err = new Error('User with this email or username already exists');
    err.statusCode = 409;
    throw err;
  }

  // Create user (inactive until email verified)
  const user = await User.create({
    ...userData,
    status: 'INACTIVE',
    isEmailVerified: false,
  });

  // Generate OTP
  const otp = OTP.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await OTP.create({
    userId: user._id,
    otp,
    purpose: 'EMAIL_VERIFICATION',
    expiresAt,
  });

  // Send verification email
  await sendEmail({
    email: user.email,
    subject: 'Verify Your Email - RetailSync',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to RetailSync!</h2>
        <p>Your OTP for email verification is:</p>
        <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  return { 
    message: 'Registration successful. Please verify your email.',
    userId: user._id 
  };
};

// Verify OTP
const verifyOTP = async (userId, otp, purpose) => {
  const otpDoc = await OTP.findOne({
    userId,
    otp,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpDoc) {
    const err = new Error('Invalid or expired OTP');
    err.statusCode = 400;
    throw err;
  }

  // Mark OTP as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  // If email verification, activate user
  if (purpose === 'EMAIL_VERIFICATION') {
    await User.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      status: 'ACTIVE',
    });
  }

  return { success: true };
};

// Resend OTP
const resendOTP = async (userId, purpose) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Invalidate previous OTPs
  await OTP.updateMany(
    { userId, purpose, isUsed: false },
    { isUsed: true }
  );

  // Generate new OTP
  const otp = OTP.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.create({
    userId,
    otp,
    purpose,
    expiresAt,
  });

  // Send email
  const subject = purpose === 'EMAIL_VERIFICATION' 
    ? 'Verify Your Email - RetailSync'
    : 'Password Reset - RetailSync';

  await sendEmail({
    email: user.email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${purpose === 'EMAIL_VERIFICATION' ? 'Email Verification' : 'Password Reset'}</h2>
        <p>Your OTP is:</p>
        <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      </div>
    `,
  });

  return { message: 'OTP sent successfully' };
};

// Forgot Password
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if user exists
    return { message: 'If the email exists, a reset OTP has been sent' };
  }

  // Generate OTP
  const otp = OTP.generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.create({
    userId: user._id,
    otp,
    purpose: 'PASSWORD_RESET',
    expiresAt,
  });

  // Send email
  await sendEmail({
    email: user.email,
    subject: 'Password Reset - RetailSync',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Your OTP for password reset is:</p>
        <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  return { message: 'If the email exists, a reset OTP has been sent', userId: user._id };
};

// Reset Password
const resetPassword = async (userId, otp, newPassword, confirmPassword) => {
  if (newPassword !== confirmPassword) {
    const err = new Error('Passwords do not match');
    err.statusCode = 400;
    throw err;
  }

  // Verify OTP
  await verifyOTP(userId, otp, 'PASSWORD_RESET');

  // Update password
  const user = await User.findById(userId);
  user.password = newPassword; // Will be hashed by pre-save hook
  await user.save();

  return { message: 'Password reset successful' };
};

const login = async (email, password) => {
  // Check for user
  const user = await User.findOne({ email }).select('+password').populate('roleId').populate('branchId');

  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  // Check if password matches
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  if (user.status !== 'ACTIVE') {
    const err = new Error('Your account is not active. Please contact an administrator.');
    err.statusCode = 403;
    throw err;
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Create token
  const token = generateToken(user._id);

  // Remove password from output
  const userObj = user.toObject();
  delete userObj.password;

  return { user: userObj, token };
};

const getMe = async (id) => {
  const user = await User.findById(id).populate('roleId').populate('branchId').lean();
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  login,
  getMe,
};
