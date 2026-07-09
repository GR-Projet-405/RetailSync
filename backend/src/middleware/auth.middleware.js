const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../modules/user-management/user.model');  // ✅ Correct

// Remove any line that has require('./controller')

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

// Middleware to check if user has required role(s)
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. User role information missing.',
      });
    }

    const userRoleName = req.user.roleId.name || req.user.roleId;
    
    if (!roles.includes(userRoleName)) {
      return res.status(403).json({
        success: false,
        message: `Role ${userRoleName} is not authorized to access this route`,
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

    // Super Admin override
    const roleName = req.user.roleId.name || req.user.roleId;
    if (roleName === 'SUPER_ADMIN') {
      return next();
    }

    const permissions = req.user.roleId.permissions || [];
    if (!permissions.includes(requiredPermission)) {
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