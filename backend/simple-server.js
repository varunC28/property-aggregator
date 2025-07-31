const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample data for demo
const sampleProperties = [
  {
    _id: '1',
    title: "Beautiful 2 BHK Apartment in Bandra West",
    description: "Spacious 2 BHK apartment with modern amenities, located in the heart of Bandra West. Close to metro station and shopping centers.",
    price: 12500000,
    priceType: "sale",
    location: {
      city: "Mumbai",
      area: "Bandra West",
      fullAddress: "Bandra West, Mumbai, Maharashtra"
    },
    propertyType: "apartment",
    bhk: 2,
    area: {
      size: 1200,
      unit: "sqft"
    },
    amenities: ["Parking", "Gym", "Swimming Pool", "24x7 Security"],
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
    source: {
      name: "Housing.com",
      url: "https://housing.com/sample",
      scrapedAt: new Date()
    },
    contact: {
      phone: "+91-98765-43210",
      agent: "Rahul Sharma"
    },
    status: "active",
    confidence: 0.9,
    createdAt: new Date()
  },
  {
    _id: '2',
    title: "Luxury 3 BHK Villa in Powai",
    description: "Premium 3 BHK villa with garden and terrace. Perfect for families looking for luxury living.",
    price: 35000000,
    priceType: "sale",
    location: {
      city: "Mumbai",
      area: "Powai",
      fullAddress: "Powai, Mumbai, Maharashtra"
    },
    propertyType: "villa",
    bhk: 3,
    area: {
      size: 2500,
      unit: "sqft"
    },
    amenities: ["Garden", "Terrace", "Servant Quarter", "Parking"],
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"],
    source: {
      name: "Housing.com",
      url: "https://housing.com/sample2",
      scrapedAt: new Date()
    },
    contact: {
      phone: "+91-98765-43211",
      agent: "Priya Patel"
    },
    status: "active",
    confidence: 0.9,
    createdAt: new Date()
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Property Aggregator API is running' });
});

// Properties endpoint
app.get('/api/properties', (req, res) => {
  res.json({
    properties: sampleProperties,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: sampleProperties.length,
      itemsPerPage: 12
    }
  });
});

// Properties stats endpoint
app.get('/api/properties/stats/overview', (req, res) => {
  const totalProperties = sampleProperties.length;
  const sources = [...new Set(sampleProperties.map(p => p.source.name))];
  const totalSources = sources.length;
  const averagePrice = sampleProperties.length > 0 
    ? Math.round(sampleProperties.reduce((sum, p) => sum + p.price, 0) / sampleProperties.length)
    : 0;
  
  res.json({
    totalProperties,
    totalSources,
    averagePrice
  });
});

// Scraper endpoints
app.post('/api/scraper/housing', (req, res) => {
  const { city = 'Mumbai', limit = 10 } = req.body;
  
  console.log(`Mock scraping Housing.com for ${city}`);
  
  const newProperties = [
    {
      _id: '3',
      title: `New 2 BHK in ${city}`,
      description: `Beautiful property in ${city} scraped from Housing.com`,
      price: 15000000,
      priceType: "sale",
      location: {
        city: city,
        area: "Central Area",
        fullAddress: `Central Area, ${city}`
      },
      propertyType: "apartment",
      bhk: 2,
      area: { size: 1000, unit: "sqft" },
      amenities: ["Parking", "Security"],
      images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"],
      source: {
        name: "Housing.com",
        url: "https://housing.com/new",
        scrapedAt: new Date()
      },
      contact: {
        phone: "+91-98765-43220",
        agent: "Demo Agent"
      },
      status: "active",
      confidence: 0.8,
      createdAt: new Date()
    }
  ];
  
  // Add to sample data
  sampleProperties.push(...newProperties);
  
  res.json({
    success: true,
    message: `Housing.com scraping completed for ${city}`,
    stats: {
      scraped: newProperties.length,
      saved: newProperties.length,
      errors: 0
    },
    properties: newProperties.map(p => ({
      id: p._id,
      title: p.title,
      price: p.price,
      location: p.location.city
    })),
    errors: []
  });
});

app.post('/api/scraper/olx', (req, res) => {
  const { city = 'Mumbai', limit = 10 } = req.body;
  
  console.log(`Mock scraping OLX for ${city}`);
  
  const newProperties = [
    {
      _id: '4',
      title: `Affordable 1 BHK in ${city}`,
      description: `Budget-friendly property in ${city} from OLX`,
      price: 8000000,
      priceType: "sale",
      location: {
        city: city,
        area: "Suburban Area",
        fullAddress: `Suburban Area, ${city}`
      },
      propertyType: "apartment",
      bhk: 1,
      area: { size: 600, unit: "sqft" },
      amenities: ["Parking"],
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"],
      source: {
        name: "OLX",
        url: "https://olx.com/new",
        scrapedAt: new Date()
      },
      contact: {
        phone: "+91-98765-43221",
        agent: "OLX Agent"
      },
      status: "active",
      confidence: 0.7,
      createdAt: new Date()
    }
  ];
  
  sampleProperties.push(...newProperties);
  
  res.json({
    success: true,
    message: `OLX scraping completed for ${city}`,
    stats: {
      scraped: newProperties.length,
      saved: newProperties.length,
      errors: 0
    },
    properties: newProperties.map(p => ({
      id: p._id,
      title: p.title,
      price: p.price,
      location: p.location.city
    })),
    errors: []
  });
});

app.post('/api/scraper/magicbricks', (req, res) => {
  const { city = 'Mumbai', limit = 10 } = req.body;
  
  console.log(`Mock scraping MagicBricks for ${city}`);
  
  const newProperties = [
    {
      _id: '5',
      title: `Premium 4 BHK in ${city}`,
      description: `Luxury property in ${city} from MagicBricks`,
      price: 50000000,
      priceType: "sale",
      location: {
        city: city,
        area: "Premium Area",
        fullAddress: `Premium Area, ${city}`
      },
      propertyType: "apartment",
      bhk: 4,
      area: { size: 3000, unit: "sqft" },
      amenities: ["Sea View", "Gym", "Pool", "Concierge", "Parking"],
      images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400"],
      source: {
        name: "MagicBricks",
        url: "https://magicbricks.com/new",
        scrapedAt: new Date()
      },
      contact: {
        phone: "+91-98765-43222",
        agent: "MagicBricks Agent"
      },
      status: "active",
      confidence: 0.9,
      createdAt: new Date()
    }
  ];
  
  sampleProperties.push(...newProperties);
  
  res.json({
    success: true,
    message: `MagicBricks scraping completed for ${city}`,
    stats: {
      scraped: newProperties.length,
      saved: newProperties.length,
      errors: 0
    },
    properties: newProperties.map(p => ({
      id: p._id,
      title: p.title,
      price: p.price,
      location: p.location.city
    })),
    errors: []
  });
});

app.get('/api/scraper/status', (req, res) => {
  const sourceStats = {};
  sampleProperties.forEach(prop => {
    const source = prop.source.name;
    if (!sourceStats[source]) {
      sourceStats[source] = { count: 0, avgPrice: 0, latestScrape: null };
    }
    sourceStats[source].count++;
    sourceStats[source].avgPrice += prop.price;
    sourceStats[source].latestScrape = prop.source.scrapedAt;
  });
  
  Object.keys(sourceStats).forEach(source => {
    sourceStats[source].avgPrice = Math.round(sourceStats[source].avgPrice / sourceStats[source].count);
  });
  
  const propertiesBySource = Object.keys(sourceStats).map(source => ({
    _id: source,
    count: sourceStats[source].count,
    avgPrice: sourceStats[source].avgPrice,
    latestScrape: sourceStats[source].latestScrape
  }));
  
  res.json({
    totalProperties: sampleProperties.length,
    propertiesBySource,
    recentProperties: sampleProperties.slice(-5).map(p => ({
      _id: p._id,
      title: p.title,
      source: {
        name: p.source.name,
        scrapedAt: p.source.scrapedAt
      }
    })),
    lastUpdated: new Date()
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Simple server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});