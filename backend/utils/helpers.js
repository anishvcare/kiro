const { v4: uuidv4 } = require('uuid');

/**
 * Generate a UUID v4
 */
const generateId = () => uuidv4();

/**
 * Format validation errors from express-validator
 */
const formatValidationErrors = (errors) => {
  return errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));
};

/**
 * Create a standardized API response
 */
const apiResponse = (res, statusCode, message, data = null) => {
  const response = { success: statusCode < 400, message };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  generateId,
  formatValidationErrors,
  apiResponse,
  asyncHandler,
};
