const normalizeRole = (role) =>
  String(role).trim().toUpperCase().replace(/-/g, '_');

const isRoleAllowed = (userRole, allowedRoles) => {
  if (allowedRoles.includes(userRole)) {
    return true;
  }

  if (allowedRoles.includes('ADMIN') && userRole === 'SUPER_ADMIN') {
    return true;
  }

  return false;
};

const authorize = (...roles) => {
  const allowedRoles = roles.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route. Role information missing.',
      });
    }

    const userRole = normalizeRole(req.user.roleId.name);

    if (!isRoleAllowed(userRole, allowedRoles)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.roleId.name} is not authorized to access this route`,
      });
    }

    next();
  };
};

const authorizePermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route. Role information missing.',
      });
    }

    if (req.user.roleId.name === 'SUPER_ADMIN') {
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

const restrictToBranch = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  const roleName = req.user.roleId?.name;
  const crossBranchRoles = ['SUPER_ADMIN', 'ADMIN'];

  if (crossBranchRoles.includes(roleName)) {
    return next();
  }

  const requestedBranchId =
    req.params.branchId || req.body.branchId || req.query.branchId;

  if (
    requestedBranchId &&
    req.user.branchId &&
    requestedBranchId.toString() !== req.user.branchId._id.toString()
  ) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access data for this branch.',
    });
  }

  next();
};

module.exports = {
  authorize,
  roleMiddleware: authorize,
  authorizePermission,
  restrictToBranch,
};
