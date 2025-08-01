const puppeteer = require('puppeteer');

async function testHousing() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // Test the exact URL that worked
  const url = 'https://housing.com/in/buy/ujjain';
  console.log(`Testing: ${url}`);
  
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  
  const cards = await page.evaluate(() => {
    const elements = document.querySelectorAll('[class*="T_cardV1Style"]');
    console.log(`Found ${elements.length} cards`);
    
    return Array.from(elements).slice(0, 3).map(card => ({
      text: card.textContent.slice(0, 200),
      className: card.className
    }));
  });
  
  console.log('Cards found:', cards.length);
  cards.forEach((card, i) => {
    console.log(`Card ${i + 1}:`, card.text.replace(/\n/g, ' ').trim());
  });
  
  await browser.close();
}

testHousing().catch(console.error);