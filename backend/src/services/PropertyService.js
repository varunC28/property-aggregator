const PropertyRepository = require('../repositories/PropertyRepository');
const PropertyDto = require('../dto/PropertyDto');
const AppConfig = require('../config/app');

class PropertyService {
  /**
   * Get all properties with filters and pagination
   */
  async getProperties(queryParams) {
    try {
      // Validate query parameters
      const { error, value } = PropertyDto.queryPropertiesSchema.validate(queryParams);
      if (error) {
        throw new Error(`Invalid query parameters: ${error.details[0].message}`);
      }

      const { page, limit, sortBy, sortOrder, ...filters } = value;
      
      const result = await PropertyRepository.findWithFilters(filters, {
        page,
        limit,
        sortBy,
        sortOrder
      });

      return PropertyDto.formatPropertiesListResponse(result.properties, result.pagination);
    } catch (error) {
      throw new Error(`Failed to get properties: ${error.message}`);
    }
  }

  /**
   * Get property by ID
   */
  async getPropertyById(id) {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }

      const property = await PropertyRepository.findById(id);
      if (!property) {
        throw new Error('Property not found');
      }

      // Increment views
      await PropertyRepository.incrementViews(id);

      return PropertyDto.formatPropertyResponse(property);
    } catch (error) {
      throw new Error(`Failed to get property: ${error.message}`);
    }
  }

  /**
   * Create new property
   */
  async createProperty(propertyData) {
    try {
      // Validate property data
      const { error, value } = PropertyDto.createPropertySchema.validate(propertyData);
      if (error) {
        throw new Error(`Invalid property data: ${error.details[0].message}`);
      }

      // Check if property already exists by source URL
      const exists = await PropertyRepository.existsBySourceUrl(value.source.url);
      if (exists) {
        throw new Error('Property with this source URL already exists');
      }

      const property = await PropertyRepository.create(value);
      return PropertyDto.formatPropertyResponse(property);
    } catch (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
  }

  /**
   * Update property
   */
  async updateProperty(id, updateData) {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }

      // Validate update data
      const { error, value } = PropertyDto.updatePropertySchema.validate(updateData);
      if (error) {
        throw new Error(`Invalid update data: ${error.details[0].message}`);
      }

      const property = await PropertyRepository.updateById(id, value);
      if (!property) {
        throw new Error('Property not found');
      }

      return PropertyDto.formatPropertyResponse(property);
    } catch (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }

  /**
   * Delete property
   */
  async deleteProperty(id) {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }

      const property = await PropertyRepository.deleteById(id);
      if (!property) {
        throw new Error('Property not found');
      }

      return { message: 'Property deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  /**
   * Get filter options
   */
  async getFilterOptions() {
    try {
      const options = await PropertyRepository.getFilterOptions();
      return PropertyDto.formatFilterOptionsResponse(options);
    } catch (error) {
      throw new Error(`Failed to get filter options: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  async getStats() {
    try {
      const stats = await PropertyRepository.getStats();
      return PropertyDto.formatStatsResponse(stats);
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  /**
   * Search properties
   */
  async searchProperties(searchQuery, queryParams = {}) {
    try {
      if (!searchQuery || searchQuery.trim().length === 0) {
        throw new Error('Search query is required');
      }

      const { page = 1, limit = AppConfig.PAGINATION.DEFAULT_LIMIT } = queryParams;
      
      const result = await PropertyRepository.searchProperties(searchQuery.trim(), {
        page,
        limit
      });

      return PropertyDto.formatPropertiesListResponse(result.properties, result.pagination);
    } catch (error) {
      throw new Error(`Failed to search properties: ${error.message}`);
    }
  }

  /**
   * Get properties by city
   */
  async getPropertiesByCity(city) {
    try {
      if (!city) {
        throw new Error('City is required');
      }

      const properties = await PropertyRepository.findByCity(city);
      return properties.map(PropertyDto.formatPropertyResponse);
    } catch (error) {
      throw new Error(`Failed to get properties by city: ${error.message}`);
    }
  }

  /**
   * Get properties by price range
   */
  async getPropertiesByPriceRange(minPrice, maxPrice) {
    try {
      if (minPrice === undefined || maxPrice === undefined) {
        throw new Error('Both minPrice and maxPrice are required');
      }

      if (minPrice < 0 || maxPrice < 0) {
        throw new Error('Price values cannot be negative');
      }

      if (minPrice > maxPrice) {
        throw new Error('minPrice cannot be greater than maxPrice');
      }

      const properties = await PropertyRepository.findByPriceRange(minPrice, maxPrice);
      return properties.map(PropertyDto.formatPropertyResponse);
    } catch (error) {
      throw new Error(`Failed to get properties by price range: ${error.message}`);
    }
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties() {
    try {
      const properties = await PropertyRepository.findFeatured();
      return properties.map(PropertyDto.formatPropertyResponse);
    } catch (error) {
      throw new Error(`Failed to get featured properties: ${error.message}`);
    }
  }

  /**
   * Mark property as featured
   */
  async markAsFeatured(id) {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }

      const property = await PropertyRepository.updateById(id, { featured: true });
      if (!property) {
        throw new Error('Property not found');
      }

      return PropertyDto.formatPropertyResponse(property);
    } catch (error) {
      throw new Error(`Failed to mark property as featured: ${error.message}`);
    }
  }

  /**
   * Mark property as sold
   */
  async markAsSold(id) {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }

      const property = await PropertyRepository.updateById(id, { status: 'sold' });
      if (!property) {
        throw new Error('Property not found');
      }

      return PropertyDto.formatPropertyResponse(property);
    } catch (error) {
      throw new Error(`Failed to mark property as sold: ${error.message}`);
    }
  }

  /**
   * Mark property as rented
   */
  async markAsRented(id) {
    try {
      if (!id) {
        throw new Error('Property ID is required');
      }

      const property = await PropertyRepository.updateById(id, { status: 'rented' });
      if (!property) {
        throw new Error('Property not found');
      }

      return PropertyDto.formatPropertyResponse(property);
    } catch (error) {
      throw new Error(`Failed to mark property as rented: ${error.message}`);
    }
  }

  /**
   * Bulk create properties
   */
  async bulkCreateProperties(propertiesData) {
    try {
      if (!Array.isArray(propertiesData) || propertiesData.length === 0) {
        throw new Error('Properties data must be a non-empty array');
      }

      const results = {
        created: [],
        errors: [],
        duplicates: []
      };

      for (const propertyData of propertiesData) {
        try {
          // Check for duplicates
          const exists = await PropertyRepository.existsBySourceUrl(propertyData.source?.url);
          console.log(`Checking URL: ${propertyData.source?.url}, exists: ${exists}`);
          if (exists) {
            results.duplicates.push({
              data: propertyData,
              reason: 'Property with this source URL already exists'
            });
            continue;
          }

          // Validate and create
          const { error, value } = PropertyDto.createPropertySchema.validate(propertyData);
          if (error) {
            results.errors.push({
              data: propertyData,
              error: error.details[0].message
            });
            continue;
          }

          const property = await PropertyRepository.create(value);
          results.created.push(PropertyDto.formatPropertyResponse(property));
        } catch (error) {
          results.errors.push({
            data: propertyData,
            error: error.message
          });
        }
      }

      return {
        success: true,
        stats: {
          total: propertiesData.length,
          created: results.created.length,
          errors: results.errors.length,
          duplicates: results.duplicates.length
        },
        results
      };
    } catch (error) {
      throw new Error(`Failed to bulk create properties: ${error.message}`);
    }
  }
}

module.exports = new PropertyService();