const { verifyAccessToken } = require('../services/tokenService');
const { apiResponse } = require('../utils/helpers');

/**
 * JWT Authentication Middleware
 * Verifies the access token and attaches the user to the request
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse(res, 401, 'Access token is required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return apiResponse(res, 401, 'Invalid or expired access token');
    }

    req.user = decoded;
    next();
  } catch (error) {
    return apiResponse(res, 401, 'Authentication failed');
  }
};

/**
 * Optional authentication - attaches user if token exists but does not fail
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, optionalAuth };
