const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const scraper = require('../services/scraper');

// POST /api/scraper/start - Start scraping from all sources
router.post('/start', async (req, res) => {
  try {
    const { city = 'Mumbai', limit = 10 } = req.body;
    
    console.log(`Starting scraping for ${city} with limit ${limit}`);
    
    // Scrape from multiple sources
    const [housingData, olxData, magicBricksData] = await Promise.all([
      scraper.scrapeHousingData(city, limit),
      scraper.scrapeOLXData(city, limit),
      scraper.scrapeMagicBricksData(city, limit)
    ]);
    
    // Combine all data
    const allProperties = [...housingData, ...olxData, ...magicBricksData];
    
    // Save to database
    const savedProperties = [];
    const errors = [];
    
    for (const property of allProperties) {
      try {
        // Check if property already exists (based on title and source)
        const existing = await Property.findOne({
          title: property.title,
          'source.name': property.source.name
        });
        
        if (!existing) {
          const newProperty = new Property(property);
          const saved = await newProperty.save();
          savedProperties.push(saved);
        }
      } catch (error) {
        console.error('Error saving property:', error);
        errors.push({ property: property.title, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Scraping completed for ${city}`,
      stats: {
        totalScraped: allProperties.length,
        saved: savedProperties.length,
        errors: errors.length,
        sources: {
          housing: housingData.length,
          olx: olxData.length,
          magicBricks: magicBricksData.length
        }
      },
      savedProperties: savedProperties.map(p => ({
        id: p._id,
        title: p.title,
        source: p.source.name
      })),
      errors
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to start scraping',
      details: error.message 
    });
  }
});

// POST /api/scraper/housing - Scrape from Housing.com
router.post('/housing', async (req, res) => {
  try {
    const { city = 'Mumbai', limit = 10 } = req.body;
    
    console.log(`Scraping Housing.com for ${city}`);
    
    const properties = await scraper.scrapeHousingData(city, limit);
    
    // Save to database
    const savedProperties = [];
    const errors = [];
    
    for (const property of properties) {
      try {
        const existing = await Property.findOne({
          title: property.title,
          'source.name': property.source.name
        });
        
        if (!existing) {
          const newProperty = new Property(property);
          const saved = await newProperty.save();
          savedProperties.push(saved);
        }
      } catch (error) {
        console.error('Error saving property:', error);
        errors.push({ property: property.title, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Housing.com scraping completed for ${city}`,
      stats: {
        scraped: properties.length,
        saved: savedProperties.length,
        errors: errors.length
      },
      properties: savedProperties.map(p => ({
        id: p._id,
        title: p.title,
        price: p.price,
        location: p.location.city
      })),
      errors
    });
    
  } catch (error) {
    console.error('Housing scraping error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to scrape Housing.com',
      details: error.message 
    });
  }
});

// POST /api/scraper/olx - Scrape from OLX
router.post('/olx', async (req, res) => {
  try {
    const { city = 'Mumbai', limit = 10 } = req.body;
    
    console.log(`Scraping OLX for ${city}`);
    
    const properties = await scraper.scrapeOLXData(city, limit);
    
    // Save to database
    const savedProperties = [];
    const errors = [];
    
    for (const property of properties) {
      try {
        const existing = await Property.findOne({
          title: property.title,
          'source.name': property.source.name
        });
        
        if (!existing) {
          const newProperty = new Property(property);
          const saved = await newProperty.save();
          savedProperties.push(saved);
        }
      } catch (error) {
        console.error('Error saving property:', error);
        errors.push({ property: property.title, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `OLX scraping completed for ${city}`,
      stats: {
        scraped: properties.length,
        saved: savedProperties.length,
        errors: errors.length
      },
      properties: savedProperties.map(p => ({
        id: p._id,
        title: p.title,
        price: p.price,
        location: p.location.city
      })),
      errors
    });
    
  } catch (error) {
    console.error('OLX scraping error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to scrape OLX',
      details: error.message 
    });
  }
});

// POST /api/scraper/magicbricks - Scrape from MagicBricks
router.post('/magicbricks', async (req, res) => {
  try {
    const { city = 'Mumbai', limit = 10 } = req.body;
    
    console.log(`Scraping MagicBricks for ${city}`);
    
    const properties = await scraper.scrapeMagicBricksData(city, limit);
    
    // Save to database
    const savedProperties = [];
    const errors = [];
    
    for (const property of properties) {
      try {
        const existing = await Property.findOne({
          title: property.title,
          'source.name': property.source.name
        });
        
        if (!existing) {
          const newProperty = new Property(property);
          const saved = await newProperty.save();
          savedProperties.push(saved);
        }
      } catch (error) {
        console.error('Error saving property:', error);
        errors.push({ property: property.title, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `MagicBricks scraping completed for ${city}`,
      stats: {
        scraped: properties.length,
        saved: savedProperties.length,
        errors: errors.length
      },
      properties: savedProperties.map(p => ({
        id: p._id,
        title: p.title,
        price: p.price,
        location: p.location.city
      })),
      errors
    });
    
  } catch (error) {
    console.error('MagicBricks scraping error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to scrape MagicBricks',
      details: error.message 
    });
  }
});

// GET /api/scraper/status - Get scraping status and statistics
router.get('/status', async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const propertiesBySource = await Property.aggregate([
      {
        $group: {
          _id: '$source.name',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          latestScrape: { $max: '$source.scrapedAt' }
        }
      }
    ]);
    
    const recentProperties = await Property.find()
      .sort({ 'source.scrapedAt': -1 })
      .limit(5)
      .select('title source.name source.scrapedAt');
    
    res.json({
      totalProperties,
      propertiesBySource,
      recentProperties,
      lastUpdated: new Date()
    });
    
  } catch (error) {
    console.error('Error getting scraping status:', error);
    res.status(500).json({ error: 'Failed to get scraping status' });
  }
});

// DELETE /api/scraper/clear - Clear all scraped data
router.delete('/clear', async (req, res) => {
  try {
    const result = await Property.deleteMany({});
    
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} properties from database`
    });
    
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

module.exports = router; 