const Joi = require('joi');

class PropertyDto {
  // Request DTOs
  static createPropertySchema = Joi.object({
    title: Joi.string().trim().max(200).required(),
    description: Joi.string().trim().max(2000).optional(),
    price: Joi.number().min(0).required(),
    priceType: Joi.string().valid('rent', 'sale').default('sale'),
    location: Joi.object({
      city: Joi.string().trim().max(100).required(),
      area: Joi.string().trim().max(100).optional(),
      fullAddress: Joi.string().trim().max(500).optional(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional()
      }).optional()
    }).required(),
    propertyType: Joi.string().valid(
      'apartment', 'house', 'villa', 'plot', 'commercial', 'penthouse', 'studio', 'other'
    ).default('apartment'),
    bhk: Joi.number().min(0).max(20).optional(),
    area: Joi.object({
      size: Joi.number().min(1).required(),
      unit: Joi.string().valid('sqft', 'sqm', 'acres', 'sqyd').default('sqft')
    }).required(),
    amenities: Joi.array().items(Joi.string().trim().max(50)).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    source: Joi.object({
      name: Joi.string().valid('Housing.com', 'OLX', 'MagicBricks', 'Manual', 'Other').required(),
      url: Joi.string().uri().required(),
      scrapedAt: Joi.date().optional()
    }).required(),
    contact: Joi.object({
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
      email: Joi.string().email().optional(),
      agent: Joi.string().trim().max(100).optional()
    }).optional(),
    status: Joi.string().valid('active', 'sold', 'rented', 'inactive', 'pending').default('active'),
    confidence: Joi.number().min(0).max(1).default(0.8),
    tags: Joi.array().items(Joi.string().trim().max(30)).optional(),
    featured: Joi.boolean().default(false)
  });

  static updatePropertySchema = Joi.object({
    title: Joi.string().trim().max(200).optional(),
    description: Joi.string().trim().max(2000).optional(),
    price: Joi.number().min(0).optional(),
    priceType: Joi.string().valid('rent', 'sale').optional(),
    location: Joi.object({
      city: Joi.string().trim().max(100).optional(),
      area: Joi.string().trim().max(100).optional(),
      fullAddress: Joi.string().trim().max(500).optional(),
      coordinates: Joi.object({
        latitude: Joi.number().min(-90).max(90).optional(),
        longitude: Joi.number().min(-180).max(180).optional()
      }).optional()
    }).optional(),
    propertyType: Joi.string().valid(
      'apartment', 'house', 'villa', 'plot', 'commercial', 'penthouse', 'studio', 'other'
    ).optional(),
    bhk: Joi.number().min(0).max(20).optional(),
    area: Joi.object({
      size: Joi.number().min(1).optional(),
      unit: Joi.string().valid('sqft', 'sqm', 'acres', 'sqyd').optional()
    }).optional(),
    amenities: Joi.array().items(Joi.string().trim().max(50)).optional(),
    images: Joi.array().items(Joi.string().uri()).optional(),
    contact: Joi.object({
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
      email: Joi.string().email().optional(),
      agent: Joi.string().trim().max(100).optional()
    }).optional(),
    status: Joi.string().valid('active', 'sold', 'rented', 'inactive', 'pending').optional(),
    confidence: Joi.number().min(0).max(1).optional(),
    tags: Joi.array().items(Joi.string().trim().max(30)).optional(),
    featured: Joi.boolean().optional()
  });

  static queryPropertiesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(8),
    city: Joi.string().trim().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    bhk: Joi.number().integer().min(0).max(20).optional(),
    propertyType: Joi.string().valid(
      'apartment', 'house', 'villa', 'plot', 'commercial', 'penthouse', 'studio', 'other'
    ).optional(),
    source: Joi.string().valid('Housing.com', 'OLX', 'MagicBricks', 'Manual', 'Other').optional(),
    priceType: Joi.string().valid('rent', 'sale').optional(),
    status: Joi.string().valid('active', 'sold', 'rented', 'inactive', 'pending').optional(),
    search: Joi.string().trim().optional(),
    sortBy: Joi.string().valid('createdAt', 'price', 'views', 'title').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    featured: Joi.boolean().optional()
  });

  static scraperRequestSchema = Joi.object({
    city: Joi.string().trim().required(),
    limit: Joi.number().integer().min(1).max(50).default(10),
    source: Joi.string().valid('housing', 'olx', 'magicbricks').optional()
  });

  // Response DTOs
  static formatPropertyResponse(property) {
    return {
      id: property._id,
      title: property.title,
      description: property.description,
      price: property.price,
      priceType: property.priceType,
      pricePerSqft: property.pricePerSqft,
      location: property.location,
      propertyType: property.propertyType,
      bhk: property.bhk,
      area: property.area,
      amenities: property.amenities,
      images: property.images,
      source: property.source,
      contact: property.contact,
      status: property.status,
      confidence: property.confidence,
      tags: property.tags,
      featured: property.featured,
      views: property.views,
      ageInDays: property.ageInDays,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt
    };
  }

  static formatPropertiesListResponse(properties, pagination) {
    return {
      properties: properties.map(this.formatPropertyResponse),
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.itemsPerPage,
        hasNextPage: pagination.currentPage < pagination.totalPages,
        hasPrevPage: pagination.currentPage > 1
      }
    };
  }

  static formatFilterOptionsResponse(options) {
    return {
      cities: options.cities || [],
      sources: options.sources || [],
      propertyTypes: options.propertyTypes || [],
      bhkOptions: options.bhkOptions || [],
      priceRange: {
        minPrice: options.priceRange?.minPrice || 0,
        maxPrice: options.priceRange?.maxPrice || 0
      },
      statusOptions: ['active', 'sold', 'rented', 'inactive', 'pending'],
      priceTypes: ['rent', 'sale'],
      areaUnits: ['sqft', 'sqm', 'acres', 'sqyd']
    };
  }

  static formatStatsResponse(stats) {
    return {
      totalProperties: stats.totalProperties || 0,
      totalSources: stats.totalSources || 0,
      averagePrice: stats.averagePrice || 0,
      propertiesByCity: stats.propertiesByCity || [],
      propertiesByType: stats.propertiesByType || [],
      propertiesBySource: stats.propertiesBySource || [],
      recentProperties: stats.recentProperties?.map(this.formatPropertyResponse) || []
    };
  }

  static formatScraperResponse(result) {
    return {
      success: result.success,
      message: result.message,
      stats: {
        scraped: result.stats?.scraped || 0,
        saved: result.stats?.saved || 0,
        errors: result.stats?.errors || 0,
        duplicates: result.stats?.duplicates || 0
      },
      properties: result.properties?.map(p => ({
        id: p.id || p._id,
        title: p.title,
        price: p.price,
        location: p.location
      })) || [],
      errors: result.errors || []
    };
  }
}

module.exports = PropertyDto;