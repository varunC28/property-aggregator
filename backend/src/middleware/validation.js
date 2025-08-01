const Joi = require('joi');

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false,
      convert: true // Enable type conversion (string to number, etc.)
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errorDetails
      });
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  const objectIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();
  
  return (req, res, next) => {
    const { error } = objectIdSchema.validate(req.params[paramName]);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: `Invalid ${paramName} format. Must be a valid MongoDB ObjectId.`
      });
    }
    
    next();
  };
};

/**
 * Validate pagination parameters
 */
const validatePagination = () => {
  const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(12),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'price', 'views', 'title').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  });

  return validate(paginationSchema, 'query');
};

/**
 * Validate search parameters
 */
const validateSearch = () => {
  const searchSchema = Joi.object({
    q: Joi.string().trim().min(1).max(100).required(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(12)
  });

  return validate(searchSchema, 'query');
};

/**
 * Validate file upload
 */
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    required = false
  } = options;

  return (req, res, next) => {
    if (!req.file && required) {
      return res.status(400).json({
        success: false,
        error: 'File Required',
        message: 'File upload is required'
      });
    }

    if (!req.file && !required) {
      return next();
    }

    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'File Too Large',
        message: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      });
    }

    // Check file type
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid File Type',
        message: `File type must be one of: ${allowedTypes.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Sanitize input data
 */
const sanitizeInput = () => {
  return (req, res, next) => {
    // Sanitize strings in body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    next();
  };
};

/**
 * Recursively sanitize object
 */
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? obj.trim() : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
};

/**
 * Rate limiting validation
 */
const validateRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
    message = 'Too many requests, please try again later'
  } = options;

  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(time => time > windowStart);
      requests.set(key, userRequests);
    }

    const userRequests = requests.get(key) || [];
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Rate Limit Exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    userRequests.push(now);
    requests.set(key, userRequests);
    
    next();
  };
};

/**
 * Validate API key (if required)
 */
const validateApiKey = () => {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API Key Required',
        message: 'API key is required in headers or query parameters'
      });
    }

    // In production, validate against database or environment variable
    const validApiKey = process.env.API_KEY;
    if (validApiKey && apiKey !== validApiKey) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API Key',
        message: 'The provided API key is invalid'
      });
    }

    next();
  };
};

/**
 * Validate request origin
 */
const validateOrigin = (allowedOrigins = []) => {
  return (req, res, next) => {
    const origin = req.headers.origin;
    
    if (allowedOrigins.length === 0) {
      return next(); // Allow all origins if none specified
    }

    if (!origin || !allowedOrigins.includes(origin)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden Origin',
        message: 'Request from this origin is not allowed'
      });
    }

    next();
  };
};

module.exports = {
  validate,
  validateObjectId,
  validatePagination,
  validateSearch,
  validateFileUpload,
  sanitizeInput,
  validateRateLimit,
  validateApiKey,
  validateOrigin
};