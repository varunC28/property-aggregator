/**
 * Sample Scraping Demo
 * 
 * This file demonstrates how to use the Property Aggregator scraping functionality.
 * It shows examples of scraping from different sources and processing the results.
 */

const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5001/api';
const DEMO_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'];
const DEMO_LIMITS = [2, 5, 10];

/**
 * Demo 1: Basic Scraping from Housing.com
 */
async function demoHousingScraping() {
  console.log('\n🏠 Demo 1: Housing.com Scraping');
  console.log('================================');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/scraper/housing`, {
      city: 'Mumbai',
      limit: 3
    });
    
    console.log('✅ Success:', response.data.message);
    console.log('📊 Stats:', response.data.data.stats);
    console.log('🏠 Properties found:', response.data.data.properties.length);
    
    // Show sample property
    if (response.data.data.properties.length > 0) {
      const sample = response.data.data.properties[0];
      console.log('📋 Sample Property:');
      console.log(`   Title: ${sample.title}`);
      console.log(`   Price: ₹${sample.price?.toLocaleString()}`);
      console.log(`   Location: ${sample.location?.city}, ${sample.location?.area}`);
      console.log(`   Source: ${sample.source?.name}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Demo 2: OLX Scraping with Error Handling
 */
async function demoOLXScraping() {
  console.log('\n🛒 Demo 2: OLX Scraping');
  console.log('========================');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/scraper/olx`, {
      city: 'Delhi',
      limit: 2
    });
    
    console.log('✅ Success:', response.data.message);
    console.log('📊 Stats:', response.data.data.stats);
    console.log('🛒 Properties found:', response.data.data.properties.length);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Demo 3: MagicBricks Scraping
 */
async function demoMagicBricksScraping() {
  console.log('\n🏢 Demo 3: MagicBricks Scraping');
  console.log('================================');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/scraper/magicbricks`, {
      city: 'Bangalore',
      limit: 3
    });
    
    console.log('✅ Success:', response.data.message);
    console.log('📊 Stats:', response.data.data.stats);
    console.log('🏢 Properties found:', response.data.data.properties.length);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Demo 4: Bulk Scraping from All Sources
 */
async function demoBulkScraping() {
  console.log('\n🚀 Demo 4: Bulk Scraping (All Sources)');
  console.log('======================================');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/scraper/all`, {
      city: 'Pune',
      limit: 2
    });
    
    console.log('✅ Success:', response.data.message);
    console.log('📊 Stats:', response.data.data.stats);
    console.log('🏠 Total Properties:', response.data.data.properties.length);
    
    // Show breakdown by source
    if (response.data.data.stats.sources) {
      console.log('📈 By Source:');
      Object.entries(response.data.data.stats.sources).forEach(([source, count]) => {
        console.log(`   ${source}: ${count} properties`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Demo 5: Check Database Status
 */
async function demoDatabaseStatus() {
  console.log('\n📊 Demo 5: Database Status');
  console.log('==========================');
  
  try {
    // Get overall stats
    const statsResponse = await axios.get(`${API_BASE_URL}/properties/stats/overview`);
    const stats = statsResponse.data.data;
    
    console.log('📈 Overall Statistics:');
    console.log(`   Total Properties: ${stats.totalProperties}`);
    console.log(`   Total Sources: ${stats.totalSources}`);
    console.log(`   Average Price: ₹${stats.averagePrice?.toLocaleString()}`);
    
    // Get properties by source
    console.log('\n🏢 Properties by Source:');
    stats.propertiesBySource.forEach(source => {
      console.log(`   ${source._id}: ${source.count} properties (₹${Math.round(source.avgPrice).toLocaleString()} avg)`);
    });
    
    // Get recent properties
    console.log('\n🕒 Recent Properties:');
    stats.recentProperties.slice(0, 3).forEach(property => {
      console.log(`   ${property.title} - ${property.source.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Demo 6: Filter and Search Properties
 */
async function demoPropertyFiltering() {
  console.log('\n🔍 Demo 6: Property Filtering');
  console.log('=============================');
  
  try {
    // Filter by city
    const cityResponse = await axios.get(`${API_BASE_URL}/properties?city=Mumbai&limit=3`);
    console.log('🏙️ Properties in Mumbai:', cityResponse.data.data.properties.length);
    
    // Filter by price range
    const priceResponse = await axios.get(`${API_BASE_URL}/properties?minPrice=5000000&maxPrice=10000000&limit=3`);
    console.log('💰 Properties in ₹50L-1Cr range:', priceResponse.data.data.properties.length);
    
    // Filter by BHK
    const bhkResponse = await axios.get(`${API_BASE_URL}/properties?bhk=2&limit=3`);
    console.log('🏠 2 BHK Properties:', bhkResponse.data.data.properties.length);
    
    // Search by text
    const searchResponse = await axios.get(`${API_BASE_URL}/properties?search=apartment&limit=3`);
    console.log('🔍 Properties matching "apartment":', searchResponse.data.data.properties.length);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Main Demo Runner
 */
async function runAllDemos() {
  console.log('🚀 Property Aggregator - Scraping Demo');
  console.log('=====================================');
  console.log('This demo shows the scraping capabilities of the Property Aggregator.');
  console.log('Make sure the backend server is running on http://localhost:5001');
  
  // Run all demos
  await demoHousingScraping();
  await demoOLXScraping();
  await demoMagicBricksScraping();
  await demoBulkScraping();
  await demoDatabaseStatus();
  await demoPropertyFiltering();
  
  console.log('\n✅ All demos completed!');
  console.log('\n📚 Next Steps:');
  console.log('1. Check the frontend at http://localhost:3000');
  console.log('2. Try different cities and limits');
  console.log('3. Explore the API endpoints');
  console.log('4. Check the database for scraped properties');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runAllDemos().catch(console.error);
}

module.exports = {
  demoHousingScraping,
  demoOLXScraping,
  demoMagicBricksScraping,
  demoBulkScraping,
  demoDatabaseStatus,
  demoPropertyFiltering,
  runAllDemos
}; 