const express = require('express');
const PropertyController = require('../controllers/PropertyController');
const PropertyDto = require('../dto/PropertyDto');
const { validate, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/properties/filters/options
 * @desc    Get filter options
 * @access  Public
 */
router.get('/filters/options', PropertyController.getFilterOptions);

/**
 * @route   GET /api/properties/stats/overview
 * @desc    Get property statistics
 * @access  Public
 */
router.get('/stats/overview', PropertyController.getStats);

/**
 * @route   GET /api/properties/search
 * @desc    Search properties
 * @access  Public
 */
router.get('/search', PropertyController.searchProperties);

/**
 * @route   GET /api/properties/featured
 * @desc    Get featured properties
 * @access  Public
 */
router.get('/featured', PropertyController.getFeaturedProperties);

/**
 * @route   GET /api/properties/price-range
 * @desc    Get properties by price range
 * @access  Public
 */
router.get('/price-range', PropertyController.getPropertiesByPriceRange);

/**
 * @route   GET /api/properties/analytics
 * @desc    Get property analytics
 * @access  Private/Admin
 */
router.get('/analytics', PropertyController.getAnalytics);

/**
 * @route   GET /api/properties/export
 * @desc    Export properties to CSV
 * @access  Private/Admin
 */
router.get('/export', PropertyController.exportProperties);

/**
 * @route   GET /api/properties/city/:city
 * @desc    Get properties by city
 * @access  Public
 */
router.get('/city/:city', PropertyController.getPropertiesByCity);

/**
 * @route   GET /api/properties/:id
 * @desc    Get single property by ID
 * @access  Public
 */
router.get('/:id', validateObjectId(), PropertyController.getPropertyById);

/**
 * @route   GET /api/properties
 * @desc    Get all properties with filters
 * @access  Public
 */
router.get('/', validate(PropertyDto.queryPropertiesSchema, 'query'), PropertyController.getProperties);

/**
 * @route   POST /api/properties/bulk
 * @desc    Bulk create properties
 * @access  Private/Admin
 */
router.post('/bulk', PropertyController.bulkCreateProperties);

/**
 * @route   POST /api/properties
 * @desc    Create new property
 * @access  Private/Admin
 */
router.post('/', 
  validate(PropertyDto.createPropertySchema), 
  PropertyController.createProperty
);

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property
 * @access  Private/Admin
 */
router.put('/:id', 
  validateObjectId(),
  validate(PropertyDto.updatePropertySchema),
  PropertyController.updateProperty
);

/**
 * @route   PATCH /api/properties/:id/featured
 * @desc    Mark property as featured
 * @access  Private/Admin
 */
router.patch('/:id/featured', 
  validateObjectId(), 
  PropertyController.markAsFeatured
);

/**
 * @route   PATCH /api/properties/:id/sold
 * @desc    Mark property as sold
 * @access  Private/Admin
 */
router.patch('/:id/sold', 
  validateObjectId(), 
  PropertyController.markAsSold
);

/**
 * @route   PATCH /api/properties/:id/rented
 * @desc    Mark property as rented
 * @access  Private/Admin
 */
router.patch('/:id/rented', 
  validateObjectId(), 
  PropertyController.markAsRented
);

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property
 * @access  Private/Admin
 */
router.delete('/:id', 
  validateObjectId(), 
  PropertyController.deleteProperty
);

module.exports = router;