const User = require('../user-management/user.model');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: '30d',
  });
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
  login,
  getMe,
};
