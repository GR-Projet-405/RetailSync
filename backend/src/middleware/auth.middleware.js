const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../modules/user-management/user.model');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
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

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Get user and attach to req
    const user = await User.findById(decoded.id).populate('roleId').populate('branchId');

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
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid token.',
    });
  }
};

// Middleware to check if user has required role(s)
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId || !roles.includes(req.user.roleId.name)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user?.roleId?.name || 'Unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Middleware to check if user has specific permission
const hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route. Role information missing.',
      });
    }

    // Super Admin override (if SUPER_ADMIN role name convention is kept)
    if (req.user.roleId.name === 'SUPER_ADMIN') {
      return next();
    }

    if (!req.user.roleId.permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action. Missing permission.',
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  hasRole,
  hasPermission,
};
