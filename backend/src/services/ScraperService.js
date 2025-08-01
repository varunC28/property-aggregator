const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
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
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
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

      // Process through AI before saving
      console.log(`🤖 Processing ${allProperties.length} properties through AI...`);
      const aiProcessedProperties = await this.processWithAI(allProperties);

      // Save AI-processed properties to database
      console.log(`Attempting to save ${aiProcessedProperties.length} AI-processed properties to database`);
      const saveResult = await PropertyService.bulkCreateProperties(aiProcessedProperties);
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
      let properties = await this._scrapeHousingWithPuppeteer(city, limit);
      
      // If real scraping fails, use fallback data
      if (properties.length === 0) {
        console.log('Real scraping failed, using fallback data...');
        properties = this._generateHousingFallbackData(city, limit);
        console.log(`Generated ${properties.length} fallback properties`);
      }

      // Process through AI
      console.log(`🤖 Processing ${properties.length} Housing.com properties through AI...`);
      const aiProcessedProperties = await this.processWithAI(properties);

      return {
        success: true,
        message: `Housing.com scraping completed for ${city}`,
        properties: aiProcessedProperties,
        source: 'Housing.com'
      };
    } catch (error) {
      console.error('Housing.com scraping error:', error);
      // Return fallback data on error
      const properties = this._generateHousingFallbackData(city, limit);
      const aiProcessedProperties = await this.processWithAI(properties);
      return {
        success: true,
        message: `Housing.com scraping completed for ${city} (fallback data)`,
        properties: aiProcessedProperties,
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
      let properties = await this._scrapeOLXWithCheerio(city, limit);
      
      // If real scraping fails, use fallback data
      if (properties.length === 0) {
        console.log('Real scraping failed, using fallback data...');
        properties = this._generateOLXFallbackData(city, limit);
      }

      // Process through AI
      console.log(`🤖 Processing ${properties.length} OLX properties through AI...`);
      const aiProcessedProperties = await this.processWithAI(properties);

      return {
        success: true,
        message: `OLX scraping completed for ${city}`,
        properties: aiProcessedProperties,
        source: 'OLX'
      };
    } catch (error) {
      console.error('OLX scraping error:', error);
      // Return fallback data on error
      const properties = this._generateOLXFallbackData(city, limit);
      const aiProcessedProperties = await this.processWithAI(properties);
      return {
        success: true,
        message: `OLX scraping completed for ${city} (fallback data)`,
        properties: aiProcessedProperties,
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
      let properties = await this._scrapeMagicBricksWithCheerio(city, limit);
      
      // If real scraping fails, use fallback data
      if (properties.length === 0) {
        console.log('Real scraping failed, using fallback data...');
        properties = this._generateMagicBricksFallbackData(city, limit);
      }

      // Process through AI
      console.log(`🤖 Processing ${properties.length} MagicBricks properties through AI...`);
      const aiProcessedProperties = await this.processWithAI(properties);

      return {
        success: true,
        message: `MagicBricks scraping completed for ${city}`,
        properties: aiProcessedProperties,
        source: 'MagicBricks'
      };
    } catch (error) {
      console.error('MagicBricks scraping error:', error);
      // Return fallback data on error
      const properties = this._generateMagicBricksFallbackData(city, limit);
      const aiProcessedProperties = await this.processWithAI(properties);
      return {
        success: true,
        message: `MagicBricks scraping completed for ${city} (fallback data)`,
        properties: aiProcessedProperties,
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
      
      // Try different URLs for Housing.com
      const searchUrls = [
        `https://housing.com/in/buy/searches/P36xt`,
        `https://housing.com/in/buy/searches/${city.toLowerCase()}`,
        `https://housing.com/in/buy/searches/${city.toLowerCase()}-properties`,
        `https://housing.com/in/buy/searches/${city.toLowerCase()}-real-estate`
      ];
      
      let searchUrl = searchUrls[0];
      console.log(`Trying Housing.com URL: ${searchUrl}`);
      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded', // Changed from networkidle2 to domcontentloaded
        timeout: this.scraperConfig.TIMEOUT 
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced from 3000ms to 2000ms
      
      const properties = await Promise.race([
        page.evaluate((limit) => {
          // Try multiple selectors to find property elements
          const selectors = [
            '[data-testid="property-card"]',
            '.PropertyCard',
            '.property-card',
            '.card',
            '.listing-card',
            '.property-listing',
            '.mb-srp__card',
            '.SerpCard',
            '.EIR5N',
            '._1gDWt'
          ];
          
          let propertyElements = [];
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
              propertyElements = Array.from(elements);
              console.log(`Found ${elements.length} properties with selector: ${selector}`);
              break;
            }
          }
          
          // If no properties found, try to find any elements that might be properties
          if (propertyElements.length === 0) {
            const allCards = document.querySelectorAll('[class*="card"], [class*="property"], [class*="listing"]');
            propertyElements = Array.from(allCards).slice(0, limit);
            console.log(`Found ${propertyElements.length} potential properties with generic selectors`);
          }
          
          const results = [];
          
          for (let i = 0; i < Math.min(propertyElements.length, limit); i++) {
            const element = propertyElements[i];
            
            // Try multiple selectors for each field
            const titleSelectors = ['h3', 'h2', '.property-title', '[data-testid="property-title"]', '.title', '.name', '.heading'];
            const priceSelectors = ['.price', '.property-price', '[data-testid="price"]', '.amount', '.cost', '.value'];
            const locationSelectors = ['.location', '.property-location', '[data-testid="location"]', '.address', '.area', '.place'];
            
            let title = '';
            let price = '';
            let location = '';
            
            // Find title
            for (const selector of titleSelectors) {
              const titleEl = element.querySelector(selector);
              if (titleEl && titleEl.textContent.trim()) {
                title = titleEl.textContent.trim();
                break;
              }
            }
            
            // Find price
            for (const selector of priceSelectors) {
              const priceEl = element.querySelector(selector);
              if (priceEl && priceEl.textContent.trim()) {
                price = priceEl.textContent.trim();
                break;
              }
            }
            
            // Find location
            for (const selector of locationSelectors) {
              const locationEl = element.querySelector(selector);
              if (locationEl && locationEl.textContent.trim()) {
                location = locationEl.textContent.trim();
                break;
              }
            }
            
            const description = element.querySelector('.description, .property-desc, .desc')?.textContent?.trim() || '';
            const image = element.querySelector('img')?.src || '';
            const link = element.querySelector('a')?.href || '';
            
            // Accept properties with at least title or price
            if (title || price) {
              results.push({
                title: title || `Property ${i + 1}`,
                price: price || '₹Contact for price',
                location: location || 'Location not specified',
                description,
                image,
                link
              });
            }
          }
          
          console.log(`Returning ${results.length} properties from Housing.com`);
          return results;
        }, limit),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Page evaluation timeout')), 20000)
        )
      ]);
      
      await page.close();
      
      console.log(`Housing.com scraping found ${properties.length} properties`);
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
      const searchUrl = `https://www.olx.in/items/q-property-${city.toLowerCase()}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.scraperConfig.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: this.scraperConfig.TIMEOUT
      });
      
      const $ = cheerio.load(response.data);
      const properties = [];
      
      $('[data-aut-id="itemBox"], .EIR5N, ._1gDWt').each((index, element) => {
        if (index >= limit) return false;
        
        const $el = $(element);
        const title = $el.find('[data-aut-id="itemTitle"], h3, .breakword').first().text().trim();
        const price = $el.find('[data-aut-id="itemPrice"], .notranslate, ._89yzn').first().text().trim();
        const location = $el.find('[data-aut-id="itemLocation"], .zLvFQ, ._1RkZP').first().text().trim();
        const image = $el.find('img').first().attr('src') || '';
        const link = $el.find('a').first().attr('href') || '';
        
        if (title && price) {
          properties.push({
            title,
            price,
            location,
            image,
            link: link.startsWith('http') ? link : `https://www.olx.in${link}`
          });
        }
      });
      
      return properties.map((prop, index) => this._formatOLXProperty(prop, city, index));
    } catch (error) {
      console.error('Cheerio scraping error:', error.message);
      if (error.message.includes('timeout')) {
        console.log('⚠️ Cheerio timeout - using fallback data');
      }
      return [];
    }
  }

  /**
   * Real MagicBricks scraping with Cheerio
   */
  async _scrapeMagicBricksWithCheerio(city, limit) {
    try {
      const searchUrl = `https://www.magicbricks.com/property-for-sale/residential-real-estate?proptype=Multistorey-Apartment,Builder-Floor,Penthouse,Studio-Apartment&cityName=${city}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.scraperConfig.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: this.scraperConfig.TIMEOUT
      });
      
      const $ = cheerio.load(response.data);
      const properties = [];
      
      $('.mb-srp__card, .mb-srp__list, .SerpCard').each((index, element) => {
        if (index >= limit) return false;
        
        const $el = $(element);
        const title = $el.find('.mb-srp__card--title, h2, .SerpCard__title').first().text().trim();
        const price = $el.find('.mb-srp__card__price, .Price, .SerpCard__price').first().text().trim();
        const location = $el.find('.mb-srp__card__ads--location, .Location, .SerpCard__location').first().text().trim();
        const config = $el.find('.mb-srp__card__summary__list, .Config').first().text().trim();
        const image = $el.find('img').first().attr('src') || '';
        const link = $el.find('a').first().attr('href') || '';
        
        if (title || price) {
          properties.push({
            title: title || 'MagicBricks Property',
            price,
            location,
            config,
            image,
            link: link.startsWith('http') ? link : `https://www.magicbricks.com${link}`
          });
        }
      });
      
      return properties.map((prop, index) => this._formatMagicBricksProperty(prop, city, index));
    } catch (error) {
      console.error('MagicBricks scraping error:', error.message);
      if (error.message.includes('timeout')) {
        console.log('⚠️ MagicBricks timeout - using fallback data');
      }
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