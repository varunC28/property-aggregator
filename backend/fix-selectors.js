const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

// Test the MagicBricks selector we found
async function testMagicBricksSelector() {
  console.log('🏢 Testing MagicBricks selector...');
  
  const html = fs.readFileSync('magicbricks-ujjain.html', 'utf8');
  const $ = cheerio.load(html);
  
  const cards = $('.mb-srp__card');
  console.log(`Found ${cards.length} .mb-srp__card elements`);
  
  if (cards.length > 0) {
    cards.each((index, element) => {
      if (index >= 3) return false; // Only show first 3
      
      const $el = $(element);
      const title = $el.find('.mb-srp__card--title, h2, .SerpCard__title').first().text().trim();
      const price = $el.find('.mb-srp__card__price, .Price, .SerpCard__price').first().text().trim();
      const location = $el.find('.mb-srp__card__ads--location, .Location, .SerpCard__location').first().text().trim();
      
      console.log(`Card ${index + 1}:`);
      console.log(`  Title: ${title}`);
      console.log(`  Price: ${price}`);
      console.log(`  Location: ${location}`);
      console.log('---');
    });
  }
}

// Try different Housing.com URLs that might have properties
async function testHousingUrls() {
  console.log('🏠 Testing different Housing.com URLs...');
  
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  const testUrls = [
    'https://housing.com/in/buy/ujjain',
    'https://housing.com/in/buy/mumbai', // Test with a major city
    'https://housing.com/in/buy/delhi',
    'https://housing.com/in/buy/searches/mumbai',
  ];
  
  for (const url of testUrls) {
    try {
      console.log(`\nTrying: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      const html = await page.content();
      console.log(`HTML length: ${html.length}`);
      
      // Try different selectors
      const selectors = [
        '[data-testid="property-card"]',
        '.PropertyCard',
        '.mb-srp__card',
        '.SerpCard',
        '.card',
        '[class*="card"]',
        '[class*="property"]',
        '[class*="listing"]'
      ];
      
      for (const selector of selectors) {
        const count = await page.evaluate((sel) => {
          return document.querySelectorAll(sel).length;
        }, selector);
        
        if (count > 0) {
          console.log(`  ✅ ${selector}: ${count} elements`);
          
          // Get sample data
          const sampleData = await page.evaluate((sel) => {
            const elements = document.querySelectorAll(sel);
            return Array.from(elements).slice(0, 2).map(el => ({
              text: el.textContent.slice(0, 100),
              className: el.className
            }));
          }, selector);
          
          console.log(`  Sample data:`, sampleData);
        } else {
          console.log(`  ❌ ${selector}: 0 elements`);
        }
      }
      
    } catch (err) {
      console.log(`  ❌ Failed: ${err.message}`);
    }
  }
  
  await browser.close();
}

async function main() {
  await testMagicBricksSelector();
  await testHousingUrls();
}

main().catch(console.error);