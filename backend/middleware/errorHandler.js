const { AppError } = require('../utils/errors');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    // In production, only log operational errors
    if (!err.isOperational) {
      console.error('UNEXPECTED ERROR:', err);
    }
  }

  // Handle specific error types
  if (err.name === 'ValidationError' && err.errors) {
    // Mongoose validation error
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  if (err.name === 'CastError') {
    // Mongoose invalid ID error
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT error
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    // JWT expired error
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }

  // Handle custom AppError instances
  if (err instanceof AppError) {
    const response = {
      success: false,
      message: err.message,
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    if (err.service) {
      response.service = err.service;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle unknown errors
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Async handler wrapper to catch errors in async route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler,
};
