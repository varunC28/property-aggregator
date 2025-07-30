import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Database, 
  BarChart3, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Loader,
  Home,
  Building,
  TrendingUp
} from 'lucide-react';
import { 
  startScraping, 
  scrapeHousing, 
  scrapeOLX, 
  scrapeMagicBricks, 
  getScrapingStatus, 
  clearScrapedData,
  getPropertyStats 
} from '../services/api';

const ScraperDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [scrapingResults, setScrapingResults] = useState(null);
  const [city, setCity] = useState('Mumbai');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchStatus();
    fetchStats();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await getScrapingStatus();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getPropertyStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleScraping = async (scraperFunction, sourceName) => {
    setLoading(true);
    setScrapingResults(null);
    
    try {
      const result = await scraperFunction({ city, limit });
      setScrapingResults({
        source: sourceName,
        ...result
      });
      
      // Refresh status and stats after scraping
      await Promise.all([fetchStatus(), fetchStats()]);
    } catch (error) {
      setScrapingResults({
        source: sourceName,
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAllScraping = async () => {
    setLoading(true);
    setScrapingResults(null);
    
    try {
      const result = await startScraping({ city, limit });
      setScrapingResults({
        source: 'All Sources',
        ...result
      });
      
      // Refresh status and stats after scraping
      await Promise.all([fetchStatus(), fetchStats()]);
    } catch (error) {
      setScrapingResults({
        source: 'All Sources',
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all scraped data? This action cannot be undone.')) {
      setLoading(true);
      try {
        await clearScrapedData();
        await Promise.all([fetchStatus(), fetchStats()]);
        alert('All data cleared successfully!');
      } catch (error) {
        alert('Error clearing data: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scraper Dashboard</h1>
        <p className="text-gray-600">Manage and monitor property data scraping from multiple sources</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSources}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.averagePrice?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-bold text-gray-900">
                  {status?.lastUpdated ? formatDate(status.lastUpdated) : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scraping Controls */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Scraping Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Limit per source</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              min="1"
              max="50"
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleStartAllScraping}
            disabled={loading}
            className="btn-primary flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Start All
          </button>

          <button
            onClick={() => handleScraping(scrapeHousing, 'Housing.com')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Home className="w-4 h-4 mr-2" />
            )}
            Housing.com
          </button>

          <button
            onClick={() => handleScraping(scrapeOLX, 'OLX')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Building className="w-4 h-4 mr-2" />
            )}
            OLX
          </button>

          <button
            onClick={() => handleScraping(scrapeMagicBricks, 'MagicBricks')}
            disabled={loading}
            className="btn-secondary flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4 mr-2" />
            )}
            MagicBricks
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => Promise.all([fetchStatus(), fetchStats()])}
            className="text-primary-600 hover:text-primary-700 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh Status
          </button>

          <button
            onClick={handleClearData}
            disabled={loading}
            className="text-red-600 hover:text-red-700 flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Scraping Results */}
      {scrapingResults && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scraping Results</h2>
          
          {scrapingResults.success ? (
            <div className="space-y-4">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Successfully scraped {scrapingResults.source}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Scraped</p>
                  <p className="text-2xl font-bold text-gray-900">{scrapingResults.stats?.totalScraped || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Saved</p>
                  <p className="text-2xl font-bold text-gray-900">{scrapingResults.stats?.saved || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Errors</p>
                  <p className="text-2xl font-bold text-gray-900">{scrapingResults.stats?.errors || 0}</p>
                </div>
              </div>

              {scrapingResults.stats?.sources && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">By Source:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {Object.entries(scrapingResults.stats.sources).map(([source, count]) => (
                      <div key={source} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-600">{source}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scrapingResults.savedProperties && scrapingResults.savedProperties.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Recently Added:</h3>
                  <div className="space-y-2">
                    {scrapingResults.savedProperties.slice(0, 5).map((property) => (
                      <div key={property.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700 truncate">{property.title}</span>
                        <span className="text-xs text-gray-500">{property.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Error: {scrapingResults.error}</span>
            </div>
          )}
        </div>
      )}

      {/* Status Details */}
      {status && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Status</h2>
          
          <div className="space-y-4">
            {status.propertiesBySource && status.propertiesBySource.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {status.propertiesBySource.map((source) => (
                  <div key={source._id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{source._id}</h3>
                      <span className="text-2xl font-bold text-gray-900">{source.count}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Avg Price: ₹{source.avgPrice?.toLocaleString() || 'N/A'}</p>
                      <p>Last: {source.latestScrape ? formatDate(source.latestScrape) : 'Never'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No data available</p>
            )}

            {status.recentProperties && status.recentProperties.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Recent Properties:</h3>
                <div className="space-y-2">
                  {status.recentProperties.map((property) => (
                    <div key={property._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate">{property.title}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{property.source.name}</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(property.source.scrapedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScraperDashboard; 