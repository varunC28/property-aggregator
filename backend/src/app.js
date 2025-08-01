const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import configurations
const AppConfig = require('./config/app');
const DatabaseConfig = require('./config/database');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validation');

// Import routes
const propertyRoutes = require('./routes/propertyRoutes');
const scraperRoutes = require('./routes/scraperRoutes');
const healthRoutes = require('./routes/healthRoutes');

class App {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: AppConfig.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 2000, // limit each IP to 2000 requests per windowMs (increased for development)
      message: {
        success: false,
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Compression
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: '10mb' 
    }));

    // Sanitize input
    this.app.use(sanitizeInput());

    // Request logging in development
    if (AppConfig.NODE_ENV === 'development') {
      this.app.use((req, res, next) => {
        console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
        next();
      });
    }

    // Set security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      next();
    });
  }

  /**
   * Setup routes
   */
  setupRoutes() {
    // API routes
    this.app.use(`${AppConfig.API_PREFIX}/health`, healthRoutes);
    this.app.use(`${AppConfig.API_PREFIX}/properties`, propertyRoutes);
    this.app.use(`${AppConfig.API_PREFIX}/scraper`, scraperRoutes);

    // API documentation route
    this.app.get(`${AppConfig.API_PREFIX}/docs`, (req, res) => {
      res.json({
        success: true,
        message: 'Property Aggregator API Documentation',
        version: '1.0.0',
        endpoints: {
          health: `${AppConfig.API_PREFIX}/health`,
          properties: `${AppConfig.API_PREFIX}/properties`,
          scraper: `${AppConfig.API_PREFIX}/scraper`
        },
        documentation: 'https://github.com/varunC28/property-aggregator/blob/main/README.md'
      });
    });

    // Root route
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Property Aggregator API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        environment: AppConfig.NODE_ENV,
        documentation: `${req.protocol}://${req.get('host')}${AppConfig.API_PREFIX}/docs`
      });
    });
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    // Handle 404 errors
    this.app.use(notFound);

    // Global error handler
    this.app.use(errorHandler);
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Validate configuration
      AppConfig.validate();

      // Connect to database
      await DatabaseConfig.connect();

      // Start server
      const server = this.app.listen(AppConfig.PORT, () => {
        console.log(`
🚀 Property Aggregator API Server Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://localhost:${AppConfig.PORT}
📚 API Docs: http://localhost:${AppConfig.PORT}${AppConfig.API_PREFIX}/docs
🏥 Health Check: http://localhost:${AppConfig.PORT}${AppConfig.API_PREFIX}/health
🏠 Properties: http://localhost:${AppConfig.PORT}${AppConfig.API_PREFIX}/properties
🔧 Scraper: http://localhost:${AppConfig.PORT}${AppConfig.API_PREFIX}/scraper
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: ${AppConfig.NODE_ENV}
Database: ${AppConfig.MONGODB_URI}
CORS Origin: ${AppConfig.CORS_ORIGIN}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
      });

      // Handle server shutdown gracefully
      const gracefulShutdown = async (signal) => {
        console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
        
        server.close(async () => {
          console.log('🔌 HTTP server closed');
          
          try {
            await DatabaseConfig.disconnect();
            console.log('✅ Graceful shutdown completed');
            process.exit(0);
          } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
          }
        });
      };

      // Listen for shutdown signals
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));

      return server;
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Get Express app instance
   */
  getApp() {
    return this.app;
  }
}

module.exports = App;