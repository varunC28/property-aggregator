const PropertyService = require('../services/PropertyService');
const PropertyDto = require('../dto/PropertyDto');
const { asyncHandler, createNotFoundError, createBadRequestError } = require('../middleware/errorHandler');

class PropertyController {
  /**
   * @desc    Get all properties with filters
   * @route   GET /api/properties
   * @access  Public
   */
  static getProperties = asyncHandler(async (req, res) => {
    // Log request for debugging
    console.log(`📊 Properties request: page=${req.query.page || 1}, filters=`, req.query);
    
    const result = await PropertyService.getProperties(req.query);
    
    res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: result
    });
  });

  /**
   * @desc    Get single property by ID
   * @route   GET /api/properties/:id
   * @access  Public
   */
  static getPropertyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const property = await PropertyService.getPropertyById(id);
    
    res.status(200).json({
      success: true,
      message: 'Property retrieved successfully',
      data: property
    });
  });

  /**
   * @desc    Create new property
   * @route   POST /api/properties
   * @access  Private/Admin
   */
  static createProperty = asyncHandler(async (req, res) => {
    const property = await PropertyService.createProperty(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property
    });
  });

  /**
   * @desc    Update property
   * @route   PUT /api/properties/:id
   * @access  Private/Admin
   */
  static updateProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const property = await PropertyService.updateProperty(id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property
    });
  });

  /**
   * @desc    Delete property
   * @route   DELETE /api/properties/:id
   * @access  Private/Admin
   */
  static deleteProperty = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await PropertyService.deleteProperty(id);
    
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
      data: result
    });
  });

  /**
   * @desc    Get filter options
   * @route   GET /api/properties/filters/options
   * @access  Public
   */
  static getFilterOptions = asyncHandler(async (req, res) => {
    const options = await PropertyService.getFilterOptions();
    
    res.status(200).json({
      success: true,
      message: 'Filter options retrieved successfully',
      data: options
    });
  });

  /**
   * @desc    Get property statistics
   * @route   GET /api/properties/stats/overview
   * @access  Public
   */
  static getStats = asyncHandler(async (req, res) => {
    const stats = await PropertyService.getStats();
    
    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats
    });
  });

  /**
   * @desc    Search properties
   * @route   GET /api/properties/search
   * @access  Public
   */
  static searchProperties = asyncHandler(async (req, res) => {
    const { q, ...queryParams } = req.query;
    
    if (!q) {
      throw createBadRequestError('Search query is required');
    }
    
    const result = await PropertyService.searchProperties(q, queryParams);
    
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: result
    });
  });

  /**
   * @desc    Get properties by city
   * @route   GET /api/properties/city/:city
   * @access  Public
   */
  static getPropertiesByCity = asyncHandler(async (req, res) => {
    const { city } = req.params;
    const properties = await PropertyService.getPropertiesByCity(city);
    
    res.status(200).json({
      success: true,
      message: `Properties in ${city} retrieved successfully`,
      data: properties
    });
  });

  /**
   * @desc    Get properties by price range
   * @route   GET /api/properties/price-range
   * @access  Public
   */
  static getPropertiesByPriceRange = asyncHandler(async (req, res) => {
    const { minPrice, maxPrice } = req.query;
    
    if (!minPrice || !maxPrice) {
      throw createBadRequestError('Both minPrice and maxPrice are required');
    }
    
    const properties = await PropertyService.getPropertiesByPriceRange(
      parseInt(minPrice), 
      parseInt(maxPrice)
    );
    
    res.status(200).json({
      success: true,
      message: 'Properties by price range retrieved successfully',
      data: properties
    });
  });

  /**
   * @desc    Get featured properties
   * @route   GET /api/properties/featured
   * @access  Public
   */
  static getFeaturedProperties = asyncHandler(async (req, res) => {
    const properties = await PropertyService.getFeaturedProperties();
    
    res.status(200).json({
      success: true,
      message: 'Featured properties retrieved successfully',
      data: properties
    });
  });

  /**
   * @desc    Mark property as featured
   * @route   PATCH /api/properties/:id/featured
   * @access  Private/Admin
   */
  static markAsFeatured = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const property = await PropertyService.markAsFeatured(id);
    
    res.status(200).json({
      success: true,
      message: 'Property marked as featured successfully',
      data: property
    });
  });

  /**
   * @desc    Mark property as sold
   * @route   PATCH /api/properties/:id/sold
   * @access  Private/Admin
   */
  static markAsSold = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const property = await PropertyService.markAsSold(id);
    
    res.status(200).json({
      success: true,
      message: 'Property marked as sold successfully',
      data: property
    });
  });

  /**
   * @desc    Mark property as rented
   * @route   PATCH /api/properties/:id/rented
   * @access  Private/Admin
   */
  static markAsRented = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const property = await PropertyService.markAsRented(id);
    
    res.status(200).json({
      success: true,
      message: 'Property marked as rented successfully',
      data: property
    });
  });

  /**
   * @desc    Bulk create properties
   * @route   POST /api/properties/bulk
   * @access  Private/Admin
   */
  static bulkCreateProperties = asyncHandler(async (req, res) => {
    const { properties } = req.body;
    
    if (!Array.isArray(properties) || properties.length === 0) {
      throw createBadRequestError('Properties array is required and must not be empty');
    }
    
    const result = await PropertyService.bulkCreateProperties(properties);
    
    res.status(201).json({
      success: true,
      message: 'Bulk property creation completed',
      data: result
    });
  });

  /**
   * @desc    Get property analytics
   * @route   GET /api/properties/analytics
   * @access  Private/Admin
   */
  static getAnalytics = asyncHandler(async (req, res) => {
    // This would typically include more detailed analytics
    const stats = await PropertyService.getStats();
    
    // Add additional analytics data
    const analytics = {
      ...stats,
      trends: {
        priceGrowth: Math.random() * 10 - 5, // Mock data
        demandIndex: Math.random() * 100,
        supplyIndex: Math.random() * 100
      },
      topPerformingAreas: [
        { area: 'Bandra West', growth: 15.2 },
        { area: 'Powai', growth: 12.8 },
        { area: 'Andheri East', growth: 10.5 }
      ]
    };
    
    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics
    });
  });

  /**
   * @desc    Export properties to CSV
   * @route   GET /api/properties/export
   * @access  Private/Admin
   */
  static exportProperties = asyncHandler(async (req, res) => {
    // This would typically generate and return a CSV file
    const result = await PropertyService.getProperties({ ...req.query, limit: 1000 });
    
    // Set CSV headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="properties.csv"');
    
    // Generate CSV content (simplified)
    let csvContent = 'ID,Title,Price,City,BHK,Area,Status,Created\n';
    
    result.properties.forEach(property => {
      csvContent += `${property.id},"${property.title}",${property.price},"${property.location.city}",${property.bhk},"${property.area.size} ${property.area.unit}",${property.status},${property.createdAt}\n`;
    });
    
    res.status(200).send(csvContent);
  });
}

module.exports = PropertyController;