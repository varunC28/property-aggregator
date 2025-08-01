/**
 * AI Data Parser Demo
 * 
 * This file demonstrates how to use the AI-powered data processing functionality
 * for cleaning, validating, and enhancing property data.
 */

const AIProcessor = require('./src/services/aiProcessor');

/**
 * Demo 1: Basic Property Data Enhancement
 */
async function demoBasicEnhancement() {
  console.log('\n🤖 Demo 1: Basic Property Data Enhancement');
  console.log('==========================================');
  
  const rawProperty = {
    title: "2bhk flat for sale in mumbai",
    price: "50 lakhs",
    location: "andheri west",
    description: "nice flat with good amenities",
    bhk: "2",
    area: "1000 sqft"
  };
  
  console.log('📥 Raw Property Data:');
  console.log(JSON.stringify(rawProperty, null, 2));
  
  try {
    const enhanced = await AIProcessor.enhancePropertyData(rawProperty);
    
    console.log('\n📤 Enhanced Property Data:');
    console.log(JSON.stringify(enhanced, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Demo 2: Price Normalization
 */
async function demoPriceNormalization() {
  console.log('\n💰 Demo 2: Price Normalization');
  console.log('==============================');
  
  const priceExamples = [
    "50 lakhs",
    "1.2 crore",
    "25L",
    "5000000",
    "2.5 cr",
    "75 lakh rupees"
  ];
  
  for (const price of priceExamples) {
    try {
      const normalized = await AIProcessor.normalizePrice(price);
      console.log(`   "${price}" → ₹${normalized.toLocaleString()}`);
    } catch (error) {
      console.log(`   "${price}" → Error: ${error.message}`);
    }
  }
}

/**
 * Demo 3: Location Standardization
 */
async function demoLocationStandardization() {
  console.log('\n📍 Demo 3: Location Standardization');
  console.log('====================================');
  
  const locationExamples = [
    "andheri west, mumbai",
    "koramangala, bangalore",
    "connaught place, new delhi",
    "baner, pune",
    "t nagar, chennai"
  ];
  
  for (const location of locationExamples) {
    try {
      const standardized = await AIProcessor.standardizeLocation(location);
      console.log(`   "${location}" → ${standardized.city}, ${standardized.area}`);
    } catch (error) {
      console.log(`   "${location}" → Error: ${error.message}`);
    }
  }
}

/**
 * Demo 4: Property Type Classification
 */
async function demoPropertyClassification() {
  console.log('\n🏠 Demo 4: Property Type Classification');
  console.log('=======================================');
  
  const propertyTitles = [
    "2 BHK apartment for sale",
    "Independent house with garden",
    "Luxury villa with pool",
    "Studio apartment",
    "Commercial office space",
    "Penthouse with terrace"
  ];
  
  for (const title of propertyTitles) {
    try {
      const classification = await AIProcessor.classifyPropertyType(title);
      console.log(`   "${title}" → ${classification.type} (confidence: ${classification.confidence})`);
    } catch (error) {
      console.log(`   "${title}" → Error: ${error.message}`);
    }
  }
}

/**
 * Demo 5: Data Validation and Cleaning
 */
async function demoDataValidation() {
  console.log('\n✅ Demo 5: Data Validation and Cleaning');
  console.log('=======================================');
  
  const dirtyData = {
    title: "  2 BHK FLAT FOR SALE!!!   ",
    price: "50 lakhs",
    location: "andheri west, mumbai, maharashtra, india",
    description: "nice flat with good amenities. contact for more details. hurry up!",
    bhk: "2",
    area: "1000 sqft",
    amenities: ["parking", "lift", "security", "parking", "lift"] // duplicates
  };
  
  console.log('📥 Dirty Data:');
  console.log(JSON.stringify(dirtyData, null, 2));
  
  try {
    const cleaned = await AIProcessor.cleanAndValidateData(dirtyData);
    
    console.log('\n📤 Cleaned Data:');
    console.log(JSON.stringify(cleaned, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Demo 6: Bulk Data Processing
 */
async function demoBulkProcessing() {
  console.log('\n📦 Demo 6: Bulk Data Processing');
  console.log('===============================');
  
  const rawProperties = [
    {
      title: "2bhk flat for sale in mumbai",
      price: "50 lakhs",
      location: "andheri west"
    },
    {
      title: "3 BHK apartment in bangalore",
      price: "1.2 crore",
      location: "koramangala"
    },
    {
      title: "1 BHK studio in delhi",
      price: "25 lakhs",
      location: "connaught place"
    }
  ];
  
  console.log('📥 Raw Properties:', rawProperties.length);
  
  try {
    const processed = await AIProcessor.processBulkProperties(rawProperties);
    
    console.log('\n📤 Processed Properties:', processed.length);
    processed.forEach((prop, index) => {
      console.log(`   ${index + 1}. ${prop.title} - ₹${prop.price?.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Demo 7: Sentiment Analysis for Property Descriptions
 */
async function demoSentimentAnalysis() {
  console.log('\n😊 Demo 7: Sentiment Analysis');
  console.log('=============================');
  
  const descriptions = [
    "Beautiful apartment with modern amenities and great location",
    "Old building but spacious rooms and good connectivity",
    "Luxury property with premium finishes and excellent views",
    "Basic flat, needs renovation but affordable price"
  ];
  
  for (const description of descriptions) {
    try {
      const sentiment = await AIProcessor.analyzeSentiment(description);
      console.log(`   "${description.substring(0, 50)}..." → ${sentiment.sentiment} (${sentiment.score})`);
    } catch (error) {
      console.log(`   "${description.substring(0, 50)}..." → Error: ${error.message}`);
    }
  }
}

/**
 * Demo 8: Generate Property Tags
 */
async function demoTagGeneration() {
  console.log('\n🏷️ Demo 8: Tag Generation');
  console.log('==========================');
  
  const propertyData = {
    title: "2 BHK apartment for sale in Andheri West",
    price: 5000000,
    location: "Andheri West, Mumbai",
    description: "Modern apartment with parking, lift, security, and good connectivity to metro station",
    bhk: 2,
    amenities: ["parking", "lift", "security", "metro-nearby"]
  };
  
  try {
    const tags = await AIProcessor.generateTags(propertyData);
    console.log('📋 Generated Tags:', tags.join(', '));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Main Demo Runner
 */
async function runAllAIDemos() {
  console.log('🤖 Property Aggregator - AI Data Parser Demo');
  console.log('============================================');
  console.log('This demo shows the AI-powered data processing capabilities.');
  console.log('Make sure you have Google Gemini API key configured.');
  
  // Run all demos
  await demoBasicEnhancement();
  await demoPriceNormalization();
  await demoLocationStandardization();
  await demoPropertyClassification();
  await demoDataValidation();
  await demoBulkProcessing();
  await demoSentimentAnalysis();
  await demoTagGeneration();
  
  console.log('\n✅ All AI demos completed!');
  console.log('\n📚 AI Features Available:');
  console.log('1. Property data enhancement and cleaning');
  console.log('2. Price normalization and validation');
  console.log('3. Location standardization');
  console.log('4. Property type classification');
  console.log('5. Sentiment analysis for descriptions');
  console.log('6. Automatic tag generation');
  console.log('7. Bulk data processing');
  console.log('8. Data validation and error correction');
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runAllAIDemos().catch(console.error);
}

module.exports = {
  demoBasicEnhancement,
  demoPriceNormalization,
  demoLocationStandardization,
  demoPropertyClassification,
  demoDataValidation,
  demoBulkProcessing,
  demoSentimentAnalysis,
  demoTagGeneration,
  runAllAIDemos
}; 