const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');

async function saveHousingHTML() {
  console.log('🏠 Fetching Housing.com HTML for Ujjain...');
  
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  const searchUrls = [
    `https://housing.com/in/buy/searches/P36xt`,
    `https://housing.com/in/buy/searches/ujjain`,
    `https://housing.com/in/buy/searches/ujjain-properties`,
    `https://housing.com/in/buy/searches/ujjain-real-estate`
  ];
  
  let html = '';
  for (const url of searchUrls) {
    try {
      console.log(`Trying: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      html = await page.content();
      console.log(`✅ Got HTML from ${url} (${html.length} chars)`);
      break;
    } catch (err) {
      console.log(`❌ Failed: ${url} - ${err.message}`);
    }
  }
  
  await browser.close();
  
  if (html) {
    fs.writeFileSync('housing-ujjain.html', html);
    console.log('💾 Saved housing-ujjain.html');
    
    // Extract and show potential selectors
    const lines = html.split('\n');
    const cardLines = lines.filter(line => 
      line.includes('card') || 
      line.includes('property') || 
      line.includes('listing') ||
      line.includes('item')
    ).slice(0, 20);
    
    console.log('\n🔍 Potential card selectors in HTML:');
    cardLines.forEach(line => console.log(line.trim().substring(0, 100)));
  }
}

async function saveOLXHTML() {
  console.log('\n🛒 Fetching OLX HTML for Ujjain...');
  
  try {
    const response = await axios.get(`https://www.olx.in/items/q-property-ujjain`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`✅ Got OLX HTML (${html.length} chars)`);
    
    fs.writeFileSync('olx-ujjain.html', html);
    console.log('💾 Saved olx-ujjain.html');
    
    // Extract and show potential selectors
    const lines = html.split('\n');
    const cardLines = lines.filter(line => 
      line.includes('itemBox') || 
      line.includes('card') || 
      line.includes('item') ||
      line.includes('property')
    ).slice(0, 20);
    
    console.log('\n🔍 Potential card selectors in OLX HTML:');
    cardLines.forEach(line => console.log(line.trim().substring(0, 100)));
    
  } catch (err) {
    console.log(`❌ OLX failed: ${err.message}`);
  }
}

async function saveMagicBricksHTML() {
  console.log('\n🏢 Fetching MagicBricks HTML for Ujjain...');
  
  try {
    const response = await axios.get(`https://www.magicbricks.com/property-for-sale/residential-real-estate?proptype=Multistorey-Apartment,Builder-Floor,Penthouse,Studio-Apartment&cityName=Ujjain`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = response.data;
    console.log(`✅ Got MagicBricks HTML (${html.length} chars)`);
    
    fs.writeFileSync('magicbricks-ujjain.html', html);
    console.log('💾 Saved magicbricks-ujjain.html');
    
    // Extract and show potential selectors
    const lines = html.split('\n');
    const cardLines = lines.filter(line => 
      line.includes('mb-srp') || 
      line.includes('card') || 
      line.includes('property') ||
      line.includes('listing')
    ).slice(0, 20);
    
    console.log('\n🔍 Potential card selectors in MagicBricks HTML:');
    cardLines.forEach(line => console.log(line.trim().substring(0, 100)));
    
  } catch (err) {
    console.log(`❌ MagicBricks failed: ${err.message}`);
  }
}

async function main() {
  console.log('🔍 Debug HTML Fetcher - Fetching raw HTML for selector analysis\n');
  
  await saveHousingHTML();
  await saveOLXHTML();
  await saveMagicBricksHTML();
  
  console.log('\n✅ HTML files saved. Now analyzing...\n');
}

main().catch(console.error);