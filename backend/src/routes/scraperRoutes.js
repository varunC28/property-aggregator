const express = require('express');
const ScraperController = require('../controllers/ScraperController');
const PropertyDto = require('../dto/PropertyDto');
const { validate, validateRateLimit } = require('../middleware/validation');

const router = express.Router();

// Rate limiting for scraper endpoints (more restrictive)
const scraperRateLimit = validateRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 200, // 200 requests per 5 minutes (increased for development)
  message: 'Too many scraping requests, please wait before trying again'
});

/**
 * @route   GET /api/scraper/status
 * @desc    Get scraper status
 * @access  Public
 */
router.get('/status', ScraperController.getScraperStatus);

/**
 * @route   GET /api/scraper/history
 * @desc    Get scraping history
 * @access  Private/Admin
 */
router.get('/history', ScraperController.getScrapingHistory);

/**
 * @route   GET /api/scraper/config
 * @desc    Get scraper configuration
 * @access  Private/Admin
 */
router.get('/config', ScraperController.getScraperConfig);

/**
 * @route   POST /api/scraper/start
 * @desc    Start scraping (alias for scrape all)
 * @access  Private/Admin
 */
router.post('/start',
  scraperRateLimit,
  validate(PropertyDto.scraperRequestSchema),
  ScraperController.scrapeAll
);

/**
 * @route   POST /api/scraper/all
 * @desc    Scrape properties from all sources
 * @access  Private/Admin
 */
router.post('/all',
  scraperRateLimit,
  validate(PropertyDto.scraperRequestSchema),
  ScraperController.scrapeAll
);

/**
 * @route   POST /api/scraper/housing
 * @desc    Scrape Housing.com
 * @access  Private/Admin
 */
router.post('/housing',
  scraperRateLimit,
  validate(PropertyDto.scraperRequestSchema),
  ScraperController.scrapeHousing
);

/**
 * @route   POST /api/scraper/olx
 * @desc    Scrape OLX
 * @access  Private/Admin
 */
router.post('/olx',
  scraperRateLimit,
  validate(PropertyDto.scraperRequestSchema),
  ScraperController.scrapeOLX
);

/**
 * @route   POST /api/scraper/magicbricks
 * @desc    Scrape MagicBricks
 * @access  Private/Admin
 */
router.post('/magicbricks',
  scraperRateLimit,
  validate(PropertyDto.scraperRequestSchema),
  ScraperController.scrapeMagicBricks
);

/**
 * @route   POST /api/scraper/test
 * @desc    Test scraper connection
 * @access  Private/Admin
 */
router.post('/test', ScraperController.testScraperConnection);

/**
 * @route   POST /api/scraper/schedule
 * @desc    Schedule scraping job
 * @access  Private/Admin
 */
router.post('/schedule', ScraperController.scheduleScrapingJob);

/**
 * @route   PUT /api/scraper/config
 * @desc    Update scraper configuration
 * @access  Private/Admin
 */
router.put('/config', ScraperController.updateScraperConfig);

/**
 * @route   DELETE /api/scraper/clear
 * @desc    Clear scraped data
 * @access  Private/Admin
 */
router.delete('/clear', ScraperController.clearScrapedData);

module.exports = router;