require('dotenv').config();

const AppConfig = {
  // Server Configuration
  PORT: process.env.PORT || 5001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/property-aggregator',
  
  // API Configuration
  API_PREFIX: '/api',
  API_VERSION: 'v1',
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Scraping Configuration
  SCRAPER: {
    TIMEOUT: 60000, // Increased to 60 seconds
    MAX_RETRIES: 3,
    DELAY_BETWEEN_REQUESTS: 1000,
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  
  // Pagination Configuration
  PAGINATION: {
    DEFAULT_LIMIT: 12,
    MAX_LIMIT: 100
  },
  
  // AI Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  
  // Validation
  validate() {
    const required = [];
    
    if (!this.GEMINI_API_KEY && this.NODE_ENV === 'production') {
      required.push('GEMINI_API_KEY');
    }
    
    if (required.length > 0) {
      throw new Error(`Missing required environment variables: ${required.join(', ')}`);
    }
  }
};

module.exports = AppConfig;