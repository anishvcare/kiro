const { apiResponse } = require('../utils/helpers');

/**
 * Role-Based Access Control Middleware
 * Checks if the authenticated user has the required role(s)
 *
 * @param  {...string} allowedRoles - Role names that are allowed access
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse(res, 401, 'Authentication required');
    }

    const userRoles = req.user.roles || [];

    // Super admin always has access
    if (userRoles.includes('super_admin')) {
      return next();
    }

    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return apiResponse(res, 403, 'Insufficient permissions. Required roles: ' + allowedRoles.join(', '));
    }

    next();
  };
};

/**
 * Permission-based access control
 * Checks if the user has a specific permission
 *
 * @param  {...string} requiredPermissions - Permission names required
 */
const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse(res, 401, 'Authentication required');
    }

    const userPermissions = req.user.permissions || [];
    const userRoles = req.user.roles || [];

    // Super admin always has access
    if (userRoles.includes('super_admin')) {
      return next();
    }

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      return apiResponse(res, 403, 'Insufficient permissions');
    }

    next();
  };
};

module.exports = { requireRole, requirePermission };
