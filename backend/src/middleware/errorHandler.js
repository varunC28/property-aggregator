const AppConfig = require('../config/app');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(`Error: ${err.message}`, err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for field: ${field}`;
    error = {
      message,
      statusCode: 400
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401
    };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = {
      message,
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Too many files uploaded';
    error = {
      message,
      statusCode: 400
    };
  }

  // Network/Timeout errors
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    const message = 'Request timeout - please try again';
    error = {
      message,
      statusCode: 408
    };
  }

  // Database connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Database connection error - please try again';
    error = {
      message,
      statusCode: 503
    };
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse = {
    success: false,
    error: getErrorType(statusCode),
    message,
    ...(AppConfig.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  };

  // Add request info in development
  if (AppConfig.NODE_ENV === 'development') {
    errorResponse.request = {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const message = `Route ${req.originalUrl} not found`;
  const error = new Error(message);
  error.statusCode = 404;
  next(error);
};

/**
 * Async error handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Get error type based on status code
 */
const getErrorType = (statusCode) => {
  switch (statusCode) {
    case 400:
      return 'Bad Request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not Found';
    case 408:
      return 'Request Timeout';
    case 409:
      return 'Conflict';
    case 422:
      return 'Unprocessable Entity';
    case 429:
      return 'Too Many Requests';
    case 500:
      return 'Internal Server Error';
    case 502:
      return 'Bad Gateway';
    case 503:
      return 'Service Unavailable';
    case 504:
      return 'Gateway Timeout';
    default:
      return 'Error';
  }
};

/**
 * Create custom error
 */
class CustomError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create bad request error
 */
const createBadRequestError = (message = 'Bad Request') => {
  return new CustomError(message, 400);
};

/**
 * Create unauthorized error
 */
const createUnauthorizedError = (message = 'Unauthorized') => {
  return new CustomError(message, 401);
};

/**
 * Create forbidden error
 */
const createForbiddenError = (message = 'Forbidden') => {
  return new CustomError(message, 403);
};

/**
 * Create not found error
 */
const createNotFoundError = (message = 'Not Found') => {
  return new CustomError(message, 404);
};

/**
 * Create conflict error
 */
const createConflictError = (message = 'Conflict') => {
  return new CustomError(message, 409);
};

/**
 * Create validation error
 */
const createValidationError = (message = 'Validation Error') => {
  return new CustomError(message, 422);
};

/**
 * Create internal server error
 */
const createInternalServerError = (message = 'Internal Server Error') => {
  return new CustomError(message, 500);
};

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  console.error('Stack:', err.stack);
  
  // Close server & exit process
  if (AppConfig.NODE_ENV === 'production') {
    process.exit(1);
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  
  // Close server & exit process
  process.exit(1);
});

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  CustomError,
  createBadRequestError,
  createUnauthorizedError,
  createForbiddenError,
  createNotFoundError,
  createConflictError,
  createValidationError,
  createInternalServerError
};