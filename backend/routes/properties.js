const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// GET /api/properties - Get all properties with filters and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      minPrice,
      maxPrice,
      bhk,
      propertyType,
      source,
      priceType,
      search
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (bhk) {
      filter.bhk = Number(bhk);
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (source) {
      filter['source.name'] = { $regex: source, $options: 'i' };
    }

    if (priceType) {
      filter.priceType = priceType;
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query
    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/properties/:id - Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// GET /api/properties/filters/options - Get filter options
router.get('/filters/options', async (req, res) => {
  try {
    const cities = await Property.distinct('location.city');
    const sources = await Property.distinct('source.name');
    const propertyTypes = await Property.distinct('propertyType');
    const bhkOptions = await Property.distinct('bhk').sort((a, b) => a - b);
    
    // Get price range
    const priceStats = await Property.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.json({
      cities: cities.filter(city => city).sort(),
      sources: sources.filter(source => source).sort(),
      propertyTypes: propertyTypes.filter(type => type).sort(),
      bhkOptions: bhkOptions.filter(bhk => bhk).sort((a, b) => a - b),
      priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0 }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

// GET /api/properties/stats/overview - Get overview statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments({ status: 'active' });
    const totalSources = await Property.distinct('source.name');
    const avgPrice = await Property.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    res.json({
      totalProperties,
      totalSources: totalSources.length,
      averagePrice: Math.round(avgPrice[0]?.avgPrice || 0)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router; 