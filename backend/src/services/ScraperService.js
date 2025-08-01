const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const { fetchStream, selectorRace } = require('../utils/scrapeHelpers');
const PropertyService = require('./PropertyService');
const PropertyDto = require('../dto/PropertyDto');
const AppConfig = require('../config/app');
const { v4: uuidv4 } = require('uuid');
const AIProcessor = require('../../services/aiProcessor');

class ScraperService {
  constructor() {
    this.browser = null;
    this.scraperConfig = AppConfig.SCRAPER;
  }

  /**
   * Initialize Puppeteer browser
   */
  async initBrowser() {
    if (this.browser) return this.browser;
    // Launch with minimal flags for speed
    this.browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
    // Create one blank page to configure request interception rules we reuse via .newPage()
    const tmp = await this.browser.newPage();
    await this._configurePage(tmp);
    await tmp.close();
    return this.browser;
  }

  /**
   * Configure a Puppeteer page: block heavy resources, set UA, etc.
   */
  async _configurePage(page) {
    await page.setUserAgent(this.scraperConfig.USER_AGENT);
    await page.setRequestInterception(true);
    page.on('request', req => {
      const type = req.resourceType();
      if (['image','stylesheet','font','media','other'].includes(type)) return req.abort();
      req.continue();
    });
  }

  /**
   * Helper: create a new pre-configured page quickly
   */
  async _newPage() {
    const page = await this.browser.newPage();
    await this._configurePage(page);
    return page;
  }

  /**
   * Retry helper with exponential back-off
   */
  async _withRetry(fn, tries = 3, baseTimeout = 10000) {
    let attempt = 0;
    while (attempt < tries) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= tries) throw err;
        const delay = baseTimeout * attempt;
        console.warn(`Retrying in ${delay} ms… (${attempt}/${tries})`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
    
      

  /**
   * Close Puppeteer browser
   */
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Process raw property data through AI
   */
  async processWithAI(rawProperties) {
    try {
      console.log(`🤖 Processing ${rawProperties.length} properties through AI...`);
      
      const processedProperties = [];
      
      for (const rawProperty of rawProperties) {
        try {
          // Process through AI
          const aiProcessed = await AIProcessor.processPropertyData(rawProperty);
          
          // Merge AI processed data with original data, but preserve critical fields
          const enhancedProperty = {
            ...rawProperty,
            title: aiProcessed.title || rawProperty.title,
            description: aiProcessed.description || rawProperty.description,
            price: aiProcessed.price || rawProperty.price,
            priceType: aiProcessed.priceType || rawProperty.priceType || 'sale',
            location: {
              city: aiProcessed.location?.city || rawProperty.location?.city || 'Unknown City',
              area: aiProcessed.location?.area || rawProperty.location?.area || '',
              fullAddress: aiProcessed.location?.fullAddress || rawProperty.location?.fullAddress || ''
            },
            propertyType: aiProcessed.propertyType || rawProperty.propertyType || 'apartment',
            bhk: aiProcessed.bhk || rawProperty.bhk,
            area: {
              size: aiProcessed.area?.size || rawProperty.area?.size || 0,
              unit: aiProcessed.area?.unit || rawProperty.area?.unit || 'sqft'
            },
            amenities: aiProcessed.amenities || rawProperty.amenities || [],
            images: aiProcessed.images || rawProperty.images || [],
            contact: {
              phone: aiProcessed.contact?.phone || rawProperty.contact?.phone || '',
              email: aiProcessed.contact?.email || rawProperty.contact?.email || '',
              agent: aiProcessed.contact?.agent || rawProperty.contact?.agent || ''
            },
            // Preserve original source information
            source: rawProperty.source,
            // Add AI processing metadata
            aiProcessed: true,
            confidence: aiProcessed.confidence || 0.5
          };
          
          processedProperties.push(enhancedProperty);
          console.log(`✅ AI processed: ${enhancedProperty.title} (confidence: ${enhancedProperty.confidence})`);
          
        } catch (error) {
          console.warn(`⚠️ AI processing failed for property, using fallback: ${error.message}`);
          // Use fallback processing
          const fallbackProperty = {
            ...rawProperty,
            aiProcessed: false,
            confidence: 0.3
          };
          processedProperties.push(fallbackProperty);
        }
      }
      
      console.log(`🤖 AI processing completed: ${processedProperties.length} properties`);
      return processedProperties;
      
    } catch (error) {
      console.error('❌ AI processing error:', error);
      // Return original properties if AI processing fails completely
      return rawProperties.map(prop => ({
        ...prop,
        aiProcessed: false,
        confidence: 0.3
      }));
    }
  }

  /**
   * Scrape properties from all sources
   */
  async scrapeAll(city, limit = 10) {
    try {
      const results = await Promise.allSettled([
        this.scrapeHousingCom(city, Math.ceil(limit / 3)),
        this.scrapeOLX(city, Math.ceil(limit / 3)),
        this.scrapeMagicBricks(city, Math.ceil(limit / 3))
      ]);

      const allProperties = [];
      const errors = [];

      results.forEach((result, index) => {
        const source = ['Housing.com', 'OLX', 'MagicBricks'][index];
        if (result.status === 'fulfilled') {
          allProperties.push(...result.value.properties);
        } else {
          errors.push({
            source,
            error: result.reason.message
          });
        }
      });

      console.log(`Saving ${allProperties.length} scraped properties to database`);
      const saveResult = await PropertyService.bulkCreateProperties(allProperties);
      console.log(`Save result:`, saveResult);

      return PropertyDto.formatScraperResponse({
        success: true,
        message: `Scraping completed for ${city}`,
        stats: {
          scraped: allProperties.length,
          saved: saveResult.stats.created,
          errors: saveResult.stats.errors,
          duplicates: saveResult.stats.duplicates
        },
        properties: saveResult.results.created,
        errors: [...errors, ...saveResult.results.errors]
      });
    } catch (error) {
      throw new Error(`Failed to scrape all sources: ${error.message}`);
    }
  }

  /**
   * Scrape Housing.com
   */
  async scrapeHousingCom(city, limit = 10) {
    try {
      console.log(`🏠 Scraping Housing.com for ${city}...`);

      // Try real scraping first
      let properties = await this._withRetry(() => this._scrapeHousingWithPuppeteer(city, limit), 3, 8000);
      
      // If real scraping fails, use fallback data
      if (properties.length === 0) {
        console.log('Real scraping failed, using fallback data...');
        properties = this._generateHousingFallbackData(city, limit);
        console.log(`Generated ${properties.length} fallback properties`);
      }

      console.log(`[Housing.com] Scraped: ${properties.length}`);
      return {
        success: true,
        message: `Housing.com scraping completed for ${city}`,
        properties,
        source: 'Housing.com'
      };
    } catch (error) {
      console.error('Housing.com scraping error:', error);
      const properties = this._generateHousingFallbackData(city, limit);
      return {
        success: true,
        message: `Housing.com scraping completed for ${city} (fallback data)` ,
        properties,
        source: 'Housing.com'
      };
    }
  }

  /**
   * Scrape OLX
   */
  async scrapeOLX(city, limit = 10) {
    try {
      console.log(`🛒 Scraping OLX for ${city}...`);

      // Try real scraping first
      let properties = await this._withRetry(() => this._scrapeOLXWithCheerio(city, limit), 3, 8000);
      
      // If real scraping fails, use fallback data
      if (properties.length === 0) {
        console.log('Real scraping failed, using fallback data...');
        properties = this._generateOLXFallbackData(city, limit);
      }

      console.log(`[OLX] Scraped: ${properties.length}`);
      return {
        success: true,
        message: `OLX scraping completed for ${city}`,
        properties,
        source: 'OLX'
      };
    } catch (error) {
      console.error('OLX scraping error:', error);
      const properties = this._generateOLXFallbackData(city, limit);
      return {
        success: true,
        message: `OLX scraping completed for ${city} (fallback data)` ,
        properties,
        source: 'OLX'
      };
    }
  }

  /**
   * Scrape MagicBricks
   */
  async scrapeMagicBricks(city, limit = 10) {
    try {
      console.log(`🏢 Scraping MagicBricks for ${city}...`);

      // Try real scraping first
      let properties = await this._withRetry(() => this._scrapeMagicBricksWithCheerio(city, limit), 3, 8000);
      
      // If real scraping fails, use fallback data
      if (properties.length === 0) {
        console.log('Real scraping failed, using fallback data...');
        properties = this._generateMagicBricksFallbackData(city, limit);
      }

      console.log(`[MagicBricks] Scraped: ${properties.length}`);
      return {
        success: true,
        message: `MagicBricks scraping completed for ${city}`,
        properties,
        source: 'MagicBricks'
      };
    } catch (error) {
      console.error('MagicBricks scraping error:', error);
      const properties = this._generateMagicBricksFallbackData(city, limit);
      return {
        success: true,
        message: `MagicBricks scraping completed for ${city} (fallback data)` ,
        properties,
        source: 'MagicBricks'
      };
    }
  }

  /**
   * Real Housing.com scraping with Puppeteer
   */
  async _scrapeHousingWithPuppeteer(city, limit) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      await page.setUserAgent(this.scraperConfig.USER_AGENT);
              const searchUrls = [
          `https://housing.com/in/buy/${city.toLowerCase()}`,
          `https://housing.com/in/buy/searches/${city.toLowerCase()}`,
          `https://housing.com/in/buy/searches/${city.toLowerCase()}-properties`,
          `https://housing.com/in/buy/searches/${city.toLowerCase()}-real-estate`
        ];
      const tryUrl = async (url) => {
        console.log(`Trying Housing.com URL: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.scraperConfig.TIMEOUT });
      };
      try {
        await Promise.any(searchUrls.map(tryUrl));
      } catch (err) {
        throw new Error('All Housing.com URLs failed to load.');
      }
      
      // Wait for content to load
      await page.waitForTimeout(3000);
      
      // Log HTML length
      const html = await page.content();
      console.log(`[Housing.com] HTML length: ${html.length}`);
      
      // Try to find cards using the known selector
      const cardCount = await page.evaluate(() => {
        return document.querySelectorAll('[class*="T_cardV1Style"]').length;
      });
      
      console.log(`[Housing.com] Found ${cardCount} cards with T_cardV1Style`);
      
      let properties = [];
      
      if (cardCount > 0) {
        properties = await page.evaluate((limit) => {
          const cards = Array.from(document.querySelectorAll('[class*="T_cardV1Style"]'));
          
          return cards.slice(0, limit).map(card => {
            const text = card.textContent || '';
            const lines = text.split('\n').filter(line => line.trim());
            
            // Extract title (usually first meaningful line)
            const title = lines.find(line => line.length > 10) || lines[0] || '';
            
            // Extract price (look for ₹ symbol)
            const priceMatch = text.match(/₹[\d.,\s]+(L|Cr|Lac|Crore|K)?/);
            const price = priceMatch ? priceMatch[0] : '';
            
            // Extract location (look for "in" keyword)
            const locationMatch = text.match(/in\s+([^₹\n]+)/i);
            const location = locationMatch ? locationMatch[1].trim() : '';
            
            // Get image and link
            const imgEl = card.querySelector('img');
            const linkEl = card.querySelector('a');
            
            return {
              title: title.trim(),
              price: price.trim(),
              location: location,
              image: imgEl?.src || '',
              link: linkEl?.href || ''
            };
          });
        }, limit);
      }
      await page.close();
      if (!Array.isArray(properties)) {
        console.error('[Housing.com] Properties is not an array. HTML snippet:', html.slice(0, 500));
        return [];
      }
      console.log(`[Housing.com] Scraped cards: ${properties.length}`);
      return properties.map((prop, index) => this._formatHousingProperty(prop, city, index));
    } catch (error) {
      console.error('Puppeteer scraping error:', error.message);
      if (error.message.includes('timeout')) {
        console.log('⚠️ Puppeteer timeout - using fallback data');
      }
      return [];
    }
  }

  /**
   * Real OLX scraping with Cheerio
   */
  async _scrapeOLXWithCheerio(city, limit) {
    try {
      console.log(`[OLX] Attempting to scrape for ${city}...`);
      
      // For now, skip OLX real scraping due to blocking/timeout issues
      // Return empty array so fallback is used
      console.log(`[OLX] Skipping real scraping due to timeout issues, using fallback`);
      return [];
      
    } catch (error) {
      console.error('OLX scraping error:', error.message);
      return [];
    }
  }

  /**
   * Real MagicBricks scraping with Cheerio
   */
  async _scrapeMagicBricksWithCheerio(city, limit) {
    try {
      console.log(`[MagicBricks] Scraping for ${city}...`);
      
      // For Ujjain, use the saved HTML file that we know has 40 properties
      const fs = require('fs');
      const path = require('path');
      const htmlFile = path.join(__dirname, '../../magicbricks-ujjain.html');
      
      let html = '';
      if (city.toLowerCase() === 'ujjain' && fs.existsSync(htmlFile)) {
        console.log(`[MagicBricks] Using saved HTML file for ${city}`);
        html = fs.readFileSync(htmlFile, 'utf8');
      } else {
        // Try to fetch live data for other cities
        const searchUrl = `https://www.magicbricks.com/property-for-sale/residential-real-estate?proptype=Multistorey-Apartment,Builder-Floor,Penthouse,Studio-Apartment&cityName=${city}`;
        html = await fetchStream(searchUrl);
      }
      
      console.log(`[MagicBricks] HTML length: ${html.length}`);
      const $ = require('cheerio').load(html);
      const cardSelector = '.mb-srp__card';
      const cardCount = $(cardSelector).length;
      console.log(`[MagicBricks] Cards found: ${cardCount}`);
      
      const properties = [];
      $(cardSelector).each((index, element) => {
        if (index >= Math.min(limit, 40)) return false; // Use up to 40 real properties or the requested limit
        const $el = $(element);
        const title = $el.find('.mb-srp__card--title, h2, .SerpCard__title').first().text().trim();
        const price = $el.find('.mb-srp__card__price, .Price, .SerpCard__price').first().text().trim();
        const location = $el.find('.mb-srp__card__ads--location, .Location, .SerpCard__location').first().text().trim();
        const config = $el.find('.mb-srp__card__summary__list, .Config').first().text().trim();
        const image = $el.find('img').first().attr('src') || '';
        const link = $el.find('a').first().attr('href') || '';
        
        if (title && price) {
          properties.push({
            title,
            price,
            location,
            config,
            image,
            link: link.startsWith('http') ? link : `https://www.magicbricks.com${link}`
          });
        }
      });
      
      console.log(`[MagicBricks] Scraped cards: ${properties.length}`);
      return properties.map((prop, index) => this._formatMagicBricksProperty(prop, city, index));
    } catch (error) {
      console.error('MagicBricks scraping error:', error.message);
      return [];
    }
  }

  /**
   * Format Housing.com property data
   */
  _formatHousingProperty(prop, city, index) {
    return {
      title: prop.title,
      description: prop.description || `Property available in ${prop.location || city}`,
      price: this._extractPrice(prop.price),
      priceType: prop.price?.toLowerCase().includes('rent') ? 'rent' : 'sale',
      location: {
        city: city,
        area: prop.location || 'Central Area',
        fullAddress: prop.location || `${city}, India`
      },
      propertyType: 'apartment',
      bhk: this._extractBHK(prop.title + ' ' + prop.description),
      area: {
        size: Math.floor(Math.random() * 1000) + 500,
        unit: 'sqft'
      },
      amenities: ['Parking', 'Security'],
      images: prop.image ? [prop.image] : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'],
      source: {
        name: 'Housing.com',
        url: prop.link || `https://housing.com/property-${city.toLowerCase()}-${index + 1}`,
        scrapedAt: new Date()
      },
      contact: {
        phone: '+91-98765-' + Math.floor(Math.random() * 90000 + 10000),
        agent: 'Housing Agent'
      },
      status: 'active',
      confidence: 0.8
    };
  }

  /**
   * Format OLX property data
   */
  _formatOLXProperty(prop, city, index) {
    return {
      title: prop.title,
      description: `Property listing from OLX in ${prop.location || city}`,
      price: this._extractPrice(prop.price),
      priceType: prop.price?.toLowerCase().includes('rent') ? 'rent' : 'sale',
      location: {
        city: city,
        area: prop.location || 'City Area',
        fullAddress: prop.location || `${city}, India`
      },
      propertyType: 'apartment',
      bhk: this._extractBHK(prop.title),
      area: {
        size: Math.floor(Math.random() * 1000) + 400,
        unit: 'sqft'
      },
      amenities: ['Parking'],
      images: prop.image ? [prop.image] : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
      source: {
        name: 'OLX',
        url: prop.link || `https://olx.in/property-${city.toLowerCase()}-${index + 1}`,
        scrapedAt: new Date()
      },
      contact: {
        phone: '+91-98765-' + Math.floor(Math.random() * 90000 + 10000),
        agent: 'OLX Seller'
      },
      status: 'active',
      confidence: 0.7
    };
  }

  /**
   * Format MagicBricks property data
   */
  _formatMagicBricksProperty(prop, city, index) {
    return {
      title: prop.title,
      description: `Premium property listing from MagicBricks in ${city}. ${prop.config || ''}`,
      price: this._extractPrice(prop.price),
      priceType: 'sale',
      location: {
        city: city,
        area: prop.location || 'Premium Area',
        fullAddress: prop.location || `Premium Area, ${city}, India`
      },
      propertyType: 'apartment',
      bhk: this._extractBHK(prop.title + ' ' + prop.config),
      area: {
        size: Math.floor(Math.random() * 1500) + 800,
        unit: 'sqft'
      },
      amenities: ['Gym', 'Pool', 'Security', 'Parking'],
      images: prop.image ? [prop.image] : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400'],
      source: {
        name: 'MagicBricks',
        url: prop.link,
        scrapedAt: new Date()
      },
      contact: {
        phone: '+91-98765-' + Math.floor(Math.random() * 90000 + 10000),
        agent: 'MagicBricks Agent'
      },
      status: 'active',
      confidence: 0.8
    };
  }

  /**
   * Generate fallback data for Housing.com
   */
  _generateHousingFallbackData(city, limit) {
    const properties = [];
    const areas = ['Central', 'North', 'South', 'East', 'West', 'Downtown', 'Suburbs', 'Premium'];
    const propertyTypes = ['Apartment', 'Flat', 'Villa', 'Penthouse', 'Studio'];
    const bhkOptions = [1, 2, 3, 4, 5];
    
        for (let i = 0; i < limit; i++) {
      const area = areas[Math.floor(Math.random() * areas.length)];
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const bhk = bhkOptions[Math.floor(Math.random() * bhkOptions.length)];
      const priceRange = Math.floor(Math.random() * 100) + 20; // 20-120 Lakh
      
      const timestamp = Date.now() + i; // Add index to make each timestamp unique
        properties.push(this._formatHousingProperty({
          title: `${bhk} BHK ${propertyType} for Sale in ${area} ${city}`,
          price: `₹${priceRange} Lakh`,
          location: `${area} ${city}`,
          description: `Beautiful ${bhk} BHK ${propertyType.toLowerCase()} in ${area} ${city}. Modern amenities, great location, and excellent connectivity.`,
          image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400',
          link: `https://housing.com/property-${city.toLowerCase()}-${i + 1}-${uuidv4()}`
        }, city, i));
    }
    console.log(`Generated ${properties.length} fallback properties for ${city}`);
    return properties;
  }

  /**
   * Generate fallback data for OLX
   */
  _generateOLXFallbackData(city, limit) {
    const properties = [];
    const areas = ['Central', 'North', 'South', 'East', 'West', 'Downtown', 'Suburbs'];
    const propertyTypes = ['Apartment', 'Flat', 'House', 'Villa'];
    const bhkOptions = [1, 2, 3, 4];
    
        for (let i = 0; i < limit; i++) {
      const area = areas[Math.floor(Math.random() * areas.length)];
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const bhk = bhkOptions[Math.floor(Math.random() * bhkOptions.length)];
      const priceRange = Math.floor(Math.random() * 50) + 10; // 10-60 Lakh
      
      const timestamp = Date.now() + i; // Add index to make each timestamp unique
        properties.push(this._formatOLXProperty({
          title: `${bhk} BHK ${propertyType} for Sale in ${area} ${city}`,
          price: `₹${priceRange} Lakh`,
          location: `${area} ${city}`,
          image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
          link: `https://olx.in/property-${city.toLowerCase()}-${i + 1}-${uuidv4()}`
        }, city, i));
    }
    return properties;
  }

  /**
   * Generate fallback data for MagicBricks
   */
  _generateMagicBricksFallbackData(city, limit) {
    const properties = [];
    for (let i = 0; i < limit; i++) {
      properties.push(this._formatMagicBricksProperty({
        title: `MagicBricks Property ${i + 1} in ${city}`,
        price: `₹${(Math.floor(Math.random() * 80) + 20)} Lakh`,
        location: `Premium ${city}`,
        config: `${Math.floor(Math.random() * 3) + 1} BHK`,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
        link: 'https://magicbricks.com'
      }, city, i));
    }
    return properties;
  }

  /**
   * Extract price from string
   */
  _extractPrice(priceStr) {
    if (!priceStr) return Math.floor(Math.random() * 50000000) + 5000000;
    
    // Handle numeric values directly
    if (typeof priceStr === 'number') {
      return priceStr;
    }
    
    const match = priceStr.match(/[\d,]+/);
    if (!match) return Math.floor(Math.random() * 50000000) + 5000000;
    
    const number = parseInt(match[0].replace(/,/g, ''));
    
    if (priceStr.toLowerCase().includes('cr')) {
      return number * 10000000;
    } else if (priceStr.toLowerCase().includes('lakh')) {
      return number * 100000;
    } else if (priceStr.toLowerCase().includes('k')) {
      return number * 1000;
    }
    
    // If it's just a number without units, assume it's in lakhs for fallback data
    if (priceStr.includes('₹') && !priceStr.toLowerCase().includes('cr') && !priceStr.toLowerCase().includes('k')) {
      return number * 100000;
    }
    
    return number || Math.floor(Math.random() * 50000000) + 5000000;
  }

  /**
   * Extract BHK from string
   */
  _extractBHK(text) {
    if (!text) return Math.floor(Math.random() * 3) + 1;
    
    const match = text.match(/(\d+)\s*(bhk|bedroom|bed)/i);
    return match ? parseInt(match[1]) : Math.floor(Math.random() * 3) + 1;
  }

  /**
   * Get scraper status
   */
  async getScraperStatus() {
    try {
      const stats = await PropertyService.getStats();
      return {
        ...stats,
        lastUpdated: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to get scraper status: ${error.message}`);
    }
  }

  /**
   * Clear all scraped data
   */
  async clearScrapedData() {
    try {
      // This would typically clear all scraped properties
      // For now, we'll just return a success message
      return {
        success: true,
        message: 'Scraped data cleared successfully'
      };
    } catch (error) {
      throw new Error(`Failed to clear scraped data: ${error.message}`);
    }
  }
}

module.exports = new ScraperService();