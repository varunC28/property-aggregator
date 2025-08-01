import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // If the response has a data property (structured backend), return the nested data
    // Otherwise return the response data as is (for backward compatibility)
    return response.data?.data ? response.data.data : response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
);

// Property API calls
export const getProperties = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      queryParams.append(key, value);
    }
  });
  
  return api.get(`/properties?${queryParams.toString()}`);
};

export const getPropertyById = async (id) => {
  return api.get(`/properties/${id}`);
};

export const getFilterOptions = async () => {
  return api.get('/properties/filters/options');
};

export const getPropertyStats = async () => {
  return api.get('/properties/stats/overview');
};

// Scraper API calls
export const startScraping = async (params = {}) => {
  return api.post('/scraper/start', params);
};

export const scrapeHousing = async (params = {}) => {
  return api.post('/scraper/housing', params);
};

export const scrapeOLX = async (params = {}) => {
  return api.post('/scraper/olx', params);
};

export const scrapeMagicBricks = async (params = {}) => {
  return api.post('/scraper/magicbricks', params);
};

export const getScrapingStatus = async () => {
  return api.get('/scraper/status');
};

export const clearScrapedData = async () => {
  return api.delete('/scraper/clear');
};

// Health check
export const healthCheck = async () => {
  return api.get('/health');
};

export default api; 