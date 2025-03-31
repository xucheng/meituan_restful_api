/**
 * Global error handling middleware
 */
const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found middleware - handles 404 errors
 */
function notFound(req, res, next) {
  const error = new ApiError(404, `Resource not found - ${req.originalUrl}`);
  next(error);
}

/**
 * Error handling middleware
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error details
  logger.error(`${statusCode} - ${message}`, {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    error: err.stack
  });

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' // Don't expose error details in production
      : message,
    details: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? null
      : err.details || null
  });
}

module.exports = {
  ApiError,
  notFound,
  errorHandler
};