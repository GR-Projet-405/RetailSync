const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const env = require('../src/config/env');
const User = require('../src/modules/user-management/user.model');

dotenv.config({ path: path.join(__dirname, '../.env') });

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. No token provided.',
      });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET || 'supersecretjwtkeyforretailsyncpos2026');

    const user = await User.findById(decoded.id)
      .populate('roleId')
      .populate('branchId');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'User account is not active. Please contact administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid token.',
    });
  }
};

module.exports = { protect, authMiddleware: protect };
