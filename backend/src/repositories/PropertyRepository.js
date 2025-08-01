const Property = require('../models/Property');
const AppConfig = require('../config/app');

class PropertyRepository {
  /**
   * Create a new property
   */
  async create(propertyData) {
    try {
      const property = new Property(propertyData);
      return await property.save();
    } catch (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
  }

  /**
   * Find property by ID
   */
  async findById(id) {
    try {
      return await Property.findById(id);
    } catch (error) {
      throw new Error(`Failed to find property: ${error.message}`);
    }
  }

  /**
   * Find properties with filters and pagination
   */
  async findWithFilters(filters, options = {}) {
    try {
      const {
        page = 1,
        limit = AppConfig.PAGINATION.DEFAULT_LIMIT,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      // Build query
      const query = this._buildQuery(filters);
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [properties, totalCount] = await Promise.all([
        Property.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Property.countDocuments(query)
      ]);

      return {
        properties,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  }

  /**
   * Update property by ID
   */
  async updateById(id, updateData) {
    try {
      return await Property.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }

  /**
   * Delete property by ID
   */
  async deleteById(id) {
    try {
      return await Property.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  /**
   * Find properties by city
   */
  async findByCity(city) {
    try {
      return await Property.findByCity(city);
    } catch (error) {
      throw new Error(`Failed to find properties by city: ${error.message}`);
    }
  }

  /**
   * Find properties by price range
   */
  async findByPriceRange(minPrice, maxPrice) {
    try {
      return await Property.findByPriceRange(minPrice, maxPrice);
    } catch (error) {
      throw new Error(`Failed to find properties by price range: ${error.message}`);
    }
  }

  /**
   * Find featured properties
   */
  async findFeatured() {
    try {
      return await Property.findFeatured();
    } catch (error) {
      throw new Error(`Failed to find featured properties: ${error.message}`);
    }
  }

  /**
   * Get filter options
   */
  async getFilterOptions() {
    try {
      const [
        cities,
        sources,
        propertyTypes,
        bhkOptions,
        priceRange
      ] = await Promise.all([
        Property.distinct('location.city', { status: 'active' }),
        Property.distinct('source.name', { status: 'active' }),
        Property.distinct('propertyType', { status: 'active' }),
        Property.distinct('bhk', { status: 'active', bhk: { $exists: true } }),
        Property.aggregate([
          { $match: { status: 'active' } },
          {
            $group: {
              _id: null,
              minPrice: { $min: '$price' },
              maxPrice: { $max: '$price' }
            }
          }
        ])
      ]);

      return {
        cities: cities.sort(),
        sources: sources.sort(),
        propertyTypes: propertyTypes.sort(),
        bhkOptions: bhkOptions.filter(bhk => bhk != null).sort((a, b) => a - b),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      };
    } catch (error) {
      throw new Error(`Failed to get filter options: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const [
        totalProperties,
        propertiesBySource,
        propertiesByCity,
        propertiesByType,
        avgPrice,
        recentProperties
      ] = await Promise.all([
        Property.countDocuments({ status: 'active' }),
        Property.aggregate([
          { $match: { status: 'active' } },
          {
            $group: {
              _id: '$source.name',
              count: { $sum: 1 },
              avgPrice: { $avg: '$price' },
              latestScrape: { $max: '$source.scrapedAt' }
            }
          },
          { $sort: { count: -1 } }
        ]),
        Property.aggregate([
          { $match: { status: 'active' } },
          {
            $group: {
              _id: '$location.city',
              count: { $sum: 1 },
              avgPrice: { $avg: '$price' }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Property.aggregate([
          { $match: { status: 'active' } },
          {
            $group: {
              _id: '$propertyType',
              count: { $sum: 1 },
              avgPrice: { $avg: '$price' }
            }
          },
          { $sort: { count: -1 } }
        ]),
        Property.aggregate([
          { $match: { status: 'active' } },
          {
            $group: {
              _id: null,
              avgPrice: { $avg: '$price' }
            }
          }
        ]),
        Property.find({ status: 'active' })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title source.name source.scrapedAt')
      ]);

      return {
        totalProperties,
        totalSources: propertiesBySource.length,
        averagePrice: Math.round(avgPrice[0]?.avgPrice || 0),
        propertiesBySource,
        propertiesByCity,
        propertiesByType,
        recentProperties
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Search properties by text
   */
  async searchProperties(searchText, options = {}) {
    try {
      const {
        page = 1,
        limit = AppConfig.PAGINATION.DEFAULT_LIMIT
      } = options;

      const query = {
        $text: { $search: searchText },
        status: 'active'
      };

      const skip = (page - 1) * limit;
      const [properties, totalCount] = await Promise.all([
        Property.find(query, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } })
          .skip(skip)
          .limit(limit),
        Property.countDocuments(query)
      ]);

      return {
        properties,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to search properties: ${error.message}`);
    }
  }

  /**
   * Check if property exists by source URL
   */
  async existsBySourceUrl(sourceUrl) {
    try {
      const count = await Property.countDocuments({ 'source.url': sourceUrl });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check property existence: ${error.message}`);
    }
  }

  /**
   * Increment property views
   */
  async incrementViews(id) {
    try {
      return await Property.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
    } catch (error) {
      throw new Error(`Failed to increment views: ${error.message}`);
    }
  }

  /**
   * Build query object from filters
   */
  _buildQuery(filters) {
    const query = {};

    // Default to active properties
    query.status = filters.status || 'active';

    if (filters.city) {
      query['location.city'] = new RegExp(filters.city, 'i');
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }

    if (filters.bhk !== undefined) {
      query.bhk = filters.bhk;
    }

    if (filters.propertyType) {
      query.propertyType = filters.propertyType;
    }

    if (filters.source) {
      query['source.name'] = filters.source;
    }

    if (filters.priceType) {
      query.priceType = filters.priceType;
    }

    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    return query;
  }
}

module.exports = new PropertyRepository();