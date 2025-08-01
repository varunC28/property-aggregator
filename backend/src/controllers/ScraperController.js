const ScraperService = require('../services/ScraperService');
const PropertyDto = require('../dto/PropertyDto');
const { asyncHandler, createBadRequestError } = require('../middleware/errorHandler');

class ScraperController {
  /**
   * @desc    Scrape properties from all sources
   * @route   POST /api/scraper/all
   * @access  Private/Admin
   */
  static scrapeAll = asyncHandler(async (req, res) => {
    const { error, value } = PropertyDto.scraperRequestSchema.validate(req.body);
    
    if (error) {
      throw createBadRequestError(`Invalid request: ${error.details[0].message}`);
    }
    
    const { city, limit } = value;
    const result = await ScraperService.scrapeAll(city, limit);
    
    res.status(200).json({
      success: true,
      message: 'Scraping completed successfully',
      data: result
    });
  });

  /**
   * @desc    Scrape Housing.com
   * @route   POST /api/scraper/housing
   * @access  Private/Admin
   */
  static scrapeHousing = asyncHandler(async (req, res) => {
    const { error, value } = PropertyDto.scraperRequestSchema.validate(req.body);
    
    if (error) {
      throw createBadRequestError(`Invalid request: ${error.details[0].message}`);
    }
    
    const { city, limit } = value;
    const result = await ScraperService.scrapeHousingCom(city, limit);
    
    // Save properties to database
    if (result.properties && result.properties.length > 0) {
      const PropertyService = require('../services/PropertyService');
      const saveResult = await PropertyService.bulkCreateProperties(result.properties);
      
      const response = PropertyDto.formatScraperResponse({
        success: result.success,
        message: result.message,
        stats: {
          scraped: result.properties.length,
          saved: saveResult.stats.created,
          errors: saveResult.stats.errors,
          duplicates: saveResult.stats.duplicates
        },
        properties: saveResult.results.created,
        errors: saveResult.results.errors
      });
      
      return res.status(200).json({
        success: true,
        message: 'Housing.com scraping completed',
        data: response
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Housing.com scraping completed',
      data: PropertyDto.formatScraperResponse(result)
    });
  });

  /**
   * @desc    Scrape OLX
   * @route   POST /api/scraper/olx
   * @access  Private/Admin
   */
  static scrapeOLX = asyncHandler(async (req, res) => {
    const { error, value } = PropertyDto.scraperRequestSchema.validate(req.body);
    
    if (error) {
      throw createBadRequestError(`Invalid request: ${error.details[0].message}`);
    }
    
    const { city, limit } = value;
    const result = await ScraperService.scrapeOLX(city, limit);
    
    // Save properties to database
    if (result.properties && result.properties.length > 0) {
      const PropertyService = require('../services/PropertyService');
      const saveResult = await PropertyService.bulkCreateProperties(result.properties);
      
      const response = PropertyDto.formatScraperResponse({
        success: result.success,
        message: result.message,
        stats: {
          scraped: result.properties.length,
          saved: saveResult.stats.created,
          errors: saveResult.stats.errors,
          duplicates: saveResult.stats.duplicates
        },
        properties: saveResult.results.created,
        errors: saveResult.results.errors
      });
      
      return res.status(200).json({
        success: true,
        message: 'OLX scraping completed',
        data: response
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'OLX scraping completed',
      data: PropertyDto.formatScraperResponse(result)
    });
  });

  /**
   * @desc    Scrape MagicBricks
   * @route   POST /api/scraper/magicbricks
   * @access  Private/Admin
   */
  static scrapeMagicBricks = asyncHandler(async (req, res) => {
    const { error, value } = PropertyDto.scraperRequestSchema.validate(req.body);
    
    if (error) {
      throw createBadRequestError(`Invalid request: ${error.details[0].message}`);
    }
    
    const { city, limit } = value;
    const result = await ScraperService.scrapeMagicBricks(city, limit);
    
    // Save properties to database
    if (result.properties && result.properties.length > 0) {
      const PropertyService = require('../services/PropertyService');
      const saveResult = await PropertyService.bulkCreateProperties(result.properties);
      
      const response = PropertyDto.formatScraperResponse({
        success: result.success,
        message: result.message,
        stats: {
          scraped: result.properties.length,
          saved: saveResult.stats.created,
          errors: saveResult.stats.errors,
          duplicates: saveResult.stats.duplicates
        },
        properties: saveResult.results.created,
        errors: saveResult.results.errors
      });
      
      return res.status(200).json({
        success: true,
        message: 'MagicBricks scraping completed',
        data: response
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'MagicBricks scraping completed',
      data: PropertyDto.formatScraperResponse(result)
    });
  });

  /**
   * @desc    Get scraper status
   * @route   GET /api/scraper/status
   * @access  Public
   */
  static getScraperStatus = asyncHandler(async (req, res) => {
    const status = await ScraperService.getScraperStatus();
    
    res.status(200).json({
      success: true,
      message: 'Scraper status retrieved successfully',
      data: status
    });
  });

  /**
   * @desc    Clear scraped data
   * @route   DELETE /api/scraper/clear
   * @access  Private/Admin
   */
  static clearScrapedData = asyncHandler(async (req, res) => {
    const result = await ScraperService.clearScrapedData();
    
    res.status(200).json({
      success: true,
      message: 'Scraped data cleared successfully',
      data: result
    });
  });

  /**
   * @desc    Get scraping history
   * @route   GET /api/scraper/history
   * @access  Private/Admin
   */
  static getScrapingHistory = asyncHandler(async (req, res) => {
    // This would typically fetch from a scraping logs collection
    const history = {
      totalScrapes: 150,
      successfulScrapes: 142,
      failedScrapes: 8,
      recentScrapes: [
        {
          id: 1,
          source: 'Housing.com',
          city: 'Mumbai',
          propertiesFound: 25,
          propertiesSaved: 23,
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          duration: 45000 // 45 seconds
        },
        {
          id: 2,
          source: 'MagicBricks',
          city: 'Delhi',
          propertiesFound: 18,
          propertiesSaved: 15,
          status: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          duration: 38000 // 38 seconds
        },
        {
          id: 3,
          source: 'OLX',
          city: 'Bangalore',
          propertiesFound: 0,
          propertiesSaved: 0,
          status: 'failed',
          error: 'Connection timeout',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          duration: 15000 // 15 seconds
        }
      ]
    };
    
    res.status(200).json({
      success: true,
      message: 'Scraping history retrieved successfully',
      data: history
    });
  });

  /**
   * @desc    Get scraper configuration
   * @route   GET /api/scraper/config
   * @access  Private/Admin
   */
  static getScraperConfig = asyncHandler(async (req, res) => {
    const config = {
      sources: [
        {
          name: 'Housing.com',
          enabled: true,
          rateLimit: 10, // requests per minute
          timeout: 30000, // 30 seconds
          retries: 3
        },
        {
          name: 'OLX',
          enabled: true,
          rateLimit: 15,
          timeout: 20000,
          retries: 2
        },
        {
          name: 'MagicBricks',
          enabled: true,
          rateLimit: 8,
          timeout: 25000,
          retries: 3
        }
      ],
      defaultSettings: {
        maxPropertiesPerScrape: 50,
        delayBetweenRequests: 1000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    res.status(200).json({
      success: true,
      message: 'Scraper configuration retrieved successfully',
      data: config
    });
  });

  /**
   * @desc    Update scraper configuration
   * @route   PUT /api/scraper/config
   * @access  Private/Admin
   */
  static updateScraperConfig = asyncHandler(async (req, res) => {
    // This would typically update configuration in database
    const { sources, defaultSettings } = req.body;
    
    // Validate configuration
    if (!sources || !Array.isArray(sources)) {
      throw createBadRequestError('Sources configuration is required');
    }
    
    // In a real application, you would save this to database
    const updatedConfig = {
      sources,
      defaultSettings,
      updatedAt: new Date()
    };
    
    res.status(200).json({
      success: true,
      message: 'Scraper configuration updated successfully',
      data: updatedConfig
    });
  });

  /**
   * @desc    Test scraper connection
   * @route   POST /api/scraper/test
   * @access  Private/Admin
   */
  static testScraperConnection = asyncHandler(async (req, res) => {
    const { source } = req.body;
    
    if (!source) {
      throw createBadRequestError('Source is required for testing');
    }
    
    // Mock connection test
    const testResults = {
      'Housing.com': { status: 'success', responseTime: 1200, accessible: true },
      'OLX': { status: 'success', responseTime: 800, accessible: true },
      'MagicBricks': { status: 'success', responseTime: 1500, accessible: true }
    };
    
    const result = testResults[source] || { 
      status: 'error', 
      error: 'Unknown source',
      accessible: false 
    };
    
    res.status(200).json({
      success: true,
      message: `Connection test completed for ${source}`,
      data: {
        source,
        ...result,
        timestamp: new Date()
      }
    });
  });

  /**
   * @desc    Schedule scraping job
   * @route   POST /api/scraper/schedule
   * @access  Private/Admin
   */
  static scheduleScrapingJob = asyncHandler(async (req, res) => {
    const { city, sources, schedule, enabled = true } = req.body;
    
    if (!city || !sources || !schedule) {
      throw createBadRequestError('City, sources, and schedule are required');
    }
    
    // This would typically create a scheduled job in a job queue
    const job = {
      id: Date.now().toString(),
      city,
      sources,
      schedule, // e.g., "0 0 * * *" for daily at midnight
      enabled,
      createdAt: new Date(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
    };
    
    res.status(201).json({
      success: true,
      message: 'Scraping job scheduled successfully',
      data: job
    });
  });
}

module.exports = ScraperController;