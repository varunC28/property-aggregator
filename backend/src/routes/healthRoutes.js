const express = require('express');
const mongoose = require('mongoose');
const AppConfig = require('../config/app');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'OK',
    message: 'Property Aggregator API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: AppConfig.NODE_ENV,
    version: '1.0.0'
  };

  res.status(200).json({
    success: true,
    data: healthCheck
  });
}));

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check with system info
 * @access  Public
 */
router.get('/detailed', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Check database connection
  let dbStatus = 'disconnected';
  let dbResponseTime = null;
  
  try {
    const dbStart = Date.now();
    await mongoose.connection.db.admin().ping();
    dbResponseTime = Date.now() - dbStart;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'error';
  }

  // System information
  const systemInfo = {
    platform: process.platform,
    nodeVersion: process.version,
    architecture: process.arch,
    totalMemory: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    usedMemory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
    freeMemory: Math.round((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024) + ' MB',
    cpuUsage: process.cpuUsage(),
    uptime: Math.floor(process.uptime()) + ' seconds'
  };

  // Service checks
  const services = {
    api: {
      status: 'healthy',
      responseTime: Date.now() - startTime + ' ms'
    },
    database: {
      status: dbStatus,
      responseTime: dbResponseTime ? dbResponseTime + ' ms' : 'N/A',
      connection: mongoose.connection.readyState === 1 ? 'active' : 'inactive'
    },
    scraper: {
      status: 'healthy',
      lastRun: 'N/A' // This would come from actual scraper logs
    }
  };

  // Overall health status
  const overallStatus = Object.values(services).every(service => 
    service.status === 'healthy' || service.status === 'connected'
  ) ? 'healthy' : 'degraded';

  const healthCheck = {
    status: overallStatus.toUpperCase(),
    message: `Property Aggregator API is ${overallStatus}`,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: AppConfig.NODE_ENV,
    system: systemInfo,
    services,
    responseTime: Date.now() - startTime + ' ms'
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    success: overallStatus === 'healthy',
    data: healthCheck
  });
}));

/**
 * @route   GET /api/health/readiness
 * @desc    Readiness probe for Kubernetes/Docker
 * @access  Public
 */
router.get('/readiness', asyncHandler(async (req, res) => {
  try {
    // Check if database is ready
    await mongoose.connection.db.admin().ping();
    
    res.status(200).json({
      success: true,
      status: 'ready',
      message: 'Service is ready to accept requests',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'not ready',
      message: 'Service is not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

/**
 * @route   GET /api/health/liveness
 * @desc    Liveness probe for Kubernetes/Docker
 * @access  Public
 */
router.get('/liveness', asyncHandler(async (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    success: true,
    status: 'alive',
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}));

/**
 * @route   GET /api/health/metrics
 * @desc    Basic metrics for monitoring
 * @access  Public
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) // MB
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    database: {
      connectionState: mongoose.connection.readyState,
      connectionName: mongoose.connection.name || 'N/A'
    }
  };

  res.status(200).json({
    success: true,
    data: metrics
  });
}));

module.exports = router;