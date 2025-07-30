const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const aiProcessor = require('./aiProcessor');

class PropertyScraper {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeHousingData(city = 'Mumbai', limit = 10) {
    try {
      console.log(`Scraping Housing.com for ${city}...`);
      
      // For demo purposes, we'll use sample data instead of actual scraping
      // In production, you would implement actual scraping logic here
      const sampleData = this.getHousingSampleData(city, limit);
      
      const processedProperties = [];
      
      for (const rawData of sampleData) {
        try {
          // Process with AI
          const processed = await aiProcessor.processPropertyData(rawData);
          
          // Add source information
          processed.source = {
            name: 'Housing.com',
            url: rawData.url,
            scrapedAt: new Date()
          };
          
          processedProperties.push(processed);
        } catch (error) {
          console.error('Error processing property:', error);
        }
      }
      
      return processedProperties;
    } catch (error) {
      console.error('Error scraping Housing data:', error);
      return [];
    }
  }

  async scrapeOLXData(city = 'Mumbai', limit = 10) {
    try {
      console.log(`Scraping OLX for ${city}...`);
      
      // For demo purposes, we'll use sample data instead of actual scraping
      const sampleData = this.getOLXSampleData(city, limit);
      
      const processedProperties = [];
      
      for (const rawData of sampleData) {
        try {
          // Process with AI
          const processed = await aiProcessor.processPropertyData(rawData);
          
          // Add source information
          processed.source = {
            name: 'OLX',
            url: rawData.url,
            scrapedAt: new Date()
          };
          
          processedProperties.push(processed);
        } catch (error) {
          console.error('Error processing property:', error);
        }
      }
      
      return processedProperties;
    } catch (error) {
      console.error('Error scraping OLX data:', error);
      return [];
    }
  }

  async scrapeMagicBricksData(city = 'Mumbai', limit = 10) {
    try {
      console.log(`Scraping MagicBricks for ${city}...`);
      
      // For demo purposes, we'll use sample data instead of actual scraping
      const sampleData = this.getMagicBricksSampleData(city, limit);
      
      const processedProperties = [];
      
      for (const rawData of sampleData) {
        try {
          // Process with AI
          const processed = await aiProcessor.processPropertyData(rawData);
          
          // Add source information
          processed.source = {
            name: 'MagicBricks',
            url: rawData.url,
            scrapedAt: new Date()
          };
          
          processedProperties.push(processed);
        } catch (error) {
          console.error('Error processing property:', error);
        }
      }
      
      return processedProperties;
    } catch (error) {
      console.error('Error scraping MagicBricks data:', error);
      return [];
    }
  }

  // Sample data generators for demonstration
  getHousingSampleData(city, limit) {
    const sampleData = [
      {
        title: "Beautiful 2 BHK Apartment in Bandra West",
        description: "Spacious 2 BHK apartment with modern amenities, located in the heart of Bandra West. Close to metro station and shopping centers.",
        price: "₹1.25 Cr",
        priceType: "sale",
        city: city,
        area: "Bandra West",
        address: "Bandra West, Mumbai, Maharashtra",
        bhk: "2 BHK",
        areaSize: "1200 sq ft",
        amenities: ["Parking", "Gym", "Swimming Pool", "24x7 Security"],
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
        phone: "+91-98765-43210",
        agent: "Rahul Sharma"
      },
      {
        title: "Luxury 3 BHK Villa in Powai",
        description: "Premium 3 BHK villa with garden and terrace. Perfect for families looking for luxury living.",
        price: "₹3.5 Cr",
        priceType: "sale",
        city: city,
        area: "Powai",
        address: "Powai, Mumbai, Maharashtra",
        bhk: "3 BHK",
        areaSize: "2500 sq ft",
        amenities: ["Garden", "Terrace", "Servant Quarter", "Parking"],
        images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"],
        phone: "+91-98765-43211",
        agent: "Priya Patel"
      },
      {
        title: "1 BHK Apartment for Rent in Andheri",
        description: "Furnished 1 BHK apartment available for rent. Close to metro and shopping malls.",
        price: "₹25,000/month",
        priceType: "rent",
        city: city,
        area: "Andheri",
        address: "Andheri West, Mumbai, Maharashtra",
        bhk: "1 BHK",
        areaSize: "650 sq ft",
        amenities: ["Furnished", "Parking", "Security"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
        phone: "+91-98765-43212",
        agent: "Amit Kumar"
      }
    ];

    return sampleData.slice(0, limit);
  }

  getOLXSampleData(city, limit) {
    const sampleData = [
      {
        title: "2 BHK Flat in Thane - Ready to Move",
        description: "Well-maintained 2 BHK flat in Thane, ready for immediate possession. Good connectivity.",
        price: "₹85 Lakhs",
        priceType: "sale",
        city: city,
        area: "Thane",
        address: "Thane West, Mumbai, Maharashtra",
        bhk: "2 BHK",
        areaSize: "1100 sq ft",
        amenities: ["Parking", "Lift", "Security"],
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
        phone: "+91-98765-43213",
        agent: "Sneha Gupta"
      },
      {
        title: "Studio Apartment for Rent in Dadar",
        description: "Compact studio apartment perfect for singles or couples. Fully furnished.",
        price: "₹18,000/month",
        priceType: "rent",
        city: city,
        area: "Dadar",
        address: "Dadar West, Mumbai, Maharashtra",
        bhk: "1 RK",
        areaSize: "400 sq ft",
        amenities: ["Furnished", "Kitchen", "Bathroom"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
        phone: "+91-98765-43214",
        agent: "Vikram Singh"
      },
      {
        title: "Commercial Space in BKC",
        description: "Prime commercial space in Bandra Kurla Complex. Ideal for offices or retail.",
        price: "₹2.5 Cr",
        priceType: "sale",
        city: city,
        area: "BKC",
        address: "Bandra Kurla Complex, Mumbai, Maharashtra",
        bhk: "Commercial",
        areaSize: "1800 sq ft",
        amenities: ["Parking", "Security", "Lift"],
        images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=400"],
        phone: "+91-98765-43215",
        agent: "Rajesh Mehta"
      }
    ];

    return sampleData.slice(0, limit);
  }

  getMagicBricksSampleData(city, limit) {
    const sampleData = [
      {
        title: "Premium 4 BHK Apartment in Worli",
        description: "Luxury 4 BHK apartment with sea view. World-class amenities and facilities.",
        price: "₹5.2 Cr",
        priceType: "sale",
        city: city,
        area: "Worli",
        address: "Worli, Mumbai, Maharashtra",
        bhk: "4 BHK",
        areaSize: "3200 sq ft",
        amenities: ["Sea View", "Gym", "Pool", "Concierge", "Parking"],
        images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"],
        phone: "+91-98765-43216",
        agent: "Arun Desai"
      },
      {
        title: "2 BHK Apartment for Rent in Juhu",
        description: "Spacious 2 BHK apartment near Juhu Beach. Perfect location for families.",
        price: "₹45,000/month",
        priceType: "rent",
        city: city,
        area: "Juhu",
        address: "Juhu, Mumbai, Maharashtra",
        bhk: "2 BHK",
        areaSize: "1400 sq ft",
        amenities: ["Beach View", "Parking", "Security", "Garden"],
        images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
        phone: "+91-98765-43217",
        agent: "Meera Iyer"
      },
      {
        title: "Independent House in Chembur",
        description: "Beautiful independent house with garden. Perfect for large families.",
        price: "₹4.8 Cr",
        priceType: "sale",
        city: city,
        area: "Chembur",
        address: "Chembur, Mumbai, Maharashtra",
        bhk: "5 BHK",
        areaSize: "4500 sq ft",
        amenities: ["Garden", "Servant Quarter", "Parking", "Security"],
        images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"],
        phone: "+91-98765-43218",
        agent: "Sunil Verma"
      }
    ];

    return sampleData.slice(0, limit);
  }

  // Actual scraping methods (commented out for demo)
  async scrapeWithPuppeteer(url, selectors) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for content to load
      await page.waitForTimeout(2000);
      
      const data = await page.evaluate((sel) => {
        const properties = [];
        const propertyElements = document.querySelectorAll(sel.propertySelector);
        
        propertyElements.forEach((element, index) => {
          if (index >= 10) return; // Limit to 10 properties
          
          const property = {
            title: element.querySelector(sel.titleSelector)?.textContent?.trim() || '',
            price: element.querySelector(sel.priceSelector)?.textContent?.trim() || '',
            location: element.querySelector(sel.locationSelector)?.textContent?.trim() || '',
            description: element.querySelector(sel.descriptionSelector)?.textContent?.trim() || '',
            url: element.querySelector('a')?.href || '',
            images: Array.from(element.querySelectorAll('img')).map(img => img.src)
          };
          
          properties.push(property);
        });
        
        return properties;
      }, selectors);
      
      await page.close();
      return data;
    } catch (error) {
      console.error('Puppeteer scraping error:', error);
      return [];
    }
  }

  async scrapeWithCheerio(url, selectors) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      const $ = cheerio.load(response.data);
      const properties = [];
      
      $(selectors.propertySelector).each((index, element) => {
        if (index >= 10) return; // Limit to 10 properties
        
        const property = {
          title: $(element).find(selectors.titleSelector).text().trim(),
          price: $(element).find(selectors.priceSelector).text().trim(),
          location: $(element).find(selectors.locationSelector).text().trim(),
          description: $(element).find(selectors.descriptionSelector).text().trim(),
          url: $(element).find('a').attr('href'),
          images: $(element).find('img').map((i, img) => $(img).attr('src')).get()
        };
        
        properties.push(property);
      });
      
      return properties;
    } catch (error) {
      console.error('Cheerio scraping error:', error);
      return [];
    }
  }
}

module.exports = new PropertyScraper(); 