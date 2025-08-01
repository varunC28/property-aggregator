# Backend Architecture Documentation

## 🏗️ **Enterprise-Level Backend Structure**

This document outlines the complete restructured backend architecture following industry best practices and enterprise-level patterns.

## 📁 **Directory Structure**

```
backend/
├── src/                          # Source code directory
│   ├── config/                   # Configuration files
│   │   ├── app.js               # Application configuration
│   │   └── database.js          # Database configuration
│   ├── controllers/              # Request handlers (Controllers)
│   │   ├── PropertyController.js # Property-related endpoints
│   │   └── ScraperController.js  # Scraper-related endpoints
│   ├── dto/                      # Data Transfer Objects
│   │   └── PropertyDto.js        # Property validation schemas & formatters
│   ├── middleware/               # Custom middleware
│   │   ├── errorHandler.js       # Global error handling
│   │   └── validation.js         # Input validation middleware
│   ├── models/                   # Database models (Mongoose schemas)
│   │   └── Property.js           # Property model with enhanced validation
│   ├── repositories/             # Data access layer
│   │   └── PropertyRepository.js # Property database operations
│   ├── routes/                   # Route definitions
│   │   ├── propertyRoutes.js     # Property API routes
│   │   ├── scraperRoutes.js      # Scraper API routes
│   │   └── healthRoutes.js       # Health check routes
│   ├── services/                 # Business logic layer
│   │   ├── PropertyService.js    # Property business logic
│   │   └── ScraperService.js     # Scraping business logic
│   ├── utils/                    # Utility functions
│   │   └── helpers.js            # Common helper functions
│   └── app.js                    # Express app configuration
├── server-structured.js          # Main server entry point
├── package.json                  # Dependencies and scripts
└── BACKEND_ARCHITECTURE.md       # This documentation
```

## 🎯 **Architecture Patterns**

### **1. MVC (Model-View-Controller) Pattern**
- **Models**: Database schemas and data validation
- **Views**: JSON API responses (DTOs)
- **Controllers**: Request handling and response formatting

### **2. Repository Pattern**
- Abstracts data access logic
- Provides a consistent interface for database operations
- Easy to test and mock

### **3. Service Layer Pattern**
- Contains business logic
- Orchestrates between repositories and controllers
- Handles complex operations and validations

### **4. DTO (Data Transfer Object) Pattern**
- Validates input/output data
- Formats responses consistently
- Provides type safety and documentation

## 🔧 **Layer Responsibilities**

### **Controllers Layer**
```javascript
// Example: PropertyController.js
class PropertyController {
  static getProperties = asyncHandler(async (req, res) => {
    const result = await PropertyService.getProperties(req.query);
    res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: result
    });
  });
}
```

**Responsibilities:**
- Handle HTTP requests and responses
- Input validation (using middleware)
- Call appropriate service methods
- Format responses consistently

### **Services Layer**
```javascript
// Example: PropertyService.js
class PropertyService {
  async getProperties(queryParams) {
    // Validate input
    const { error, value } = PropertyDto.queryPropertiesSchema.validate(queryParams);
    if (error) throw new Error(`Invalid query: ${error.details[0].message}`);

    // Business logic
    const result = await PropertyRepository.findWithFilters(filters, options);
    
    // Format response
    return PropertyDto.formatPropertiesListResponse(result.properties, result.pagination);
  }
}
```

**Responsibilities:**
- Business logic implementation
- Data validation using DTOs
- Orchestrate repository calls
- Handle complex operations

### **Repository Layer**
```javascript
// Example: PropertyRepository.js
class PropertyRepository {
  async findWithFilters(filters, options = {}) {
    const query = this._buildQuery(filters);
    const properties = await Property.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    return { properties, pagination };
  }
}
```

**Responsibilities:**
- Direct database interactions
- Query building and optimization
- Data persistence operations
- No business logic

### **Models Layer**
```javascript
// Example: Property.js
const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  }
  // ... more fields with validation
});
```

**Responsibilities:**
- Database schema definition
- Data validation rules
- Indexes and performance optimization
- Virtual fields and methods

### **DTOs Layer**
```javascript
// Example: PropertyDto.js
class PropertyDto {
  static createPropertySchema = Joi.object({
    title: Joi.string().trim().max(200).required(),
    price: Joi.number().min(0).required(),
    // ... validation rules
  });

  static formatPropertyResponse(property) {
    return {
      id: property._id,
      title: property.title,
      // ... formatted response
    };
  }
}
```

**Responsibilities:**
- Input validation schemas
- Response formatting
- Data transformation
- Type definitions

## 🚀 **Key Features**

### **1. Comprehensive Error Handling**
- Global error handler middleware
- Custom error classes
- Proper HTTP status codes
- Development vs Production error responses

### **2. Input Validation**
- Joi schema validation
- Sanitization middleware
- Type coercion
- Custom validation rules

### **3. Security Features**
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input sanitization
- XSS protection

### **4. Performance Optimizations**
- Response compression
- Database query optimization
- Proper indexing
- Pagination support

### **5. Monitoring & Health Checks**
- Multiple health check endpoints
- System metrics
- Database connection monitoring
- Graceful shutdown handling

## 📡 **API Endpoints**

### **Health Endpoints**
```
GET /api/health              # Basic health check
GET /api/health/detailed     # Detailed system information
GET /api/health/readiness    # Kubernetes readiness probe
GET /api/health/liveness     # Kubernetes liveness probe
GET /api/health/metrics      # System metrics
```

### **Property Endpoints**
```
GET    /api/properties                    # Get all properties with filters
GET    /api/properties/:id                # Get single property
GET    /api/properties/filters/options    # Get filter options
GET    /api/properties/stats/overview     # Get statistics
GET    /api/properties/search             # Search properties
GET    /api/properties/featured           # Get featured properties
GET    /api/properties/city/:city         # Get properties by city
POST   /api/properties                    # Create property
POST   /api/properties/bulk               # Bulk create properties
PUT    /api/properties/:id                # Update property
PATCH  /api/properties/:id/featured       # Mark as featured
PATCH  /api/properties/:id/sold           # Mark as sold
DELETE /api/properties/:id                # Delete property
```

### **Scraper Endpoints**
```
GET    /api/scraper/status        # Get scraper status
GET    /api/scraper/history       # Get scraping history
GET    /api/scraper/config        # Get scraper configuration
POST   /api/scraper/all           # Scrape all sources
POST   /api/scraper/housing       # Scrape Housing.com
POST   /api/scraper/olx           # Scrape OLX
POST   /api/scraper/magicbricks   # Scrape MagicBricks
POST   /api/scraper/test          # Test scraper connection
POST   /api/scraper/schedule      # Schedule scraping job
PUT    /api/scraper/config        # Update configuration
DELETE /api/scraper/clear         # Clear scraped data
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Server Configuration
PORT=5001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/property-aggregator

# CORS
CORS_ORIGIN=http://localhost:3000

# AI Processing
GEMINI_API_KEY=your_gemini_api_key

# API Security
API_KEY=your_api_key_for_admin_endpoints
```

### **Application Configuration**
Located in `src/config/app.js`:
- Server settings
- Database configuration
- CORS settings
- Scraper configuration
- Pagination settings

## 🚀 **Running the Application**

### **Development Mode**
```bash
# Using the structured backend
npm run dev:structured

# Using the original backend
npm run dev
```

### **Production Mode**
```bash
# Using the structured backend
npm run start:structured

# Using the original backend
npm start
```

## 🧪 **Testing Endpoints**

### **Health Check**
```bash
curl http://localhost:5001/api/health
```

### **Get Properties**
```bash
curl "http://localhost:5001/api/properties?city=Mumbai&limit=5"
```

### **Scrape Properties**
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"city":"Mumbai","limit":3}' \
  http://localhost:5001/api/scraper/magicbricks
```

## 📊 **Benefits of This Architecture**

### **1. Maintainability**
- Clear separation of concerns
- Easy to locate and modify code
- Consistent patterns throughout

### **2. Scalability**
- Modular design allows easy scaling
- Repository pattern enables database switching
- Service layer can be extracted to microservices

### **3. Testability**
- Each layer can be tested independently
- Easy to mock dependencies
- Clear interfaces between layers

### **4. Security**
- Input validation at multiple levels
- Proper error handling
- Security middleware implementation

### **5. Developer Experience**
- Clear documentation
- Consistent code structure
- Easy onboarding for new developers

## 🔄 **Migration from Old Structure**

The old structure has been preserved and both can run simultaneously:

**Old Structure:**
- `server.js` - Original server
- `real-scraper-server.js` - Real scraping server
- `simple-server.js` - Simple mock server

**New Structure:**
- `server-structured.js` - New enterprise-level server
- `src/` directory - All structured code

## 📈 **Future Enhancements**

1. **Authentication & Authorization**
   - JWT token implementation
   - Role-based access control
   - API key management

2. **Database Optimizations**
   - Connection pooling
   - Read replicas
   - Caching layer (Redis)

3. **Monitoring & Logging**
   - Structured logging
   - Performance monitoring
   - Error tracking

4. **API Documentation**
   - Swagger/OpenAPI integration
   - Interactive API explorer
   - Auto-generated documentation

5. **Testing Suite**
   - Unit tests for all layers
   - Integration tests
   - Load testing

This architecture provides a solid foundation for building scalable, maintainable, and robust APIs following industry best practices.