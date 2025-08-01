const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Property title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Property price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceType: {
    type: String,
    enum: {
      values: ['rent', 'sale'],
      message: 'Price type must be either rent or sale'
    },
    default: 'sale'
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name cannot exceed 100 characters']
    },
    area: {
      type: String,
      trim: true,
      maxlength: [100, 'Area name cannot exceed 100 characters']
    },
    fullAddress: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    coordinates: {
      latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  propertyType: {
    type: String,
    enum: {
      values: ['apartment', 'house', 'villa', 'plot', 'commercial', 'penthouse', 'studio', 'other'],
      message: 'Invalid property type'
    },
    default: 'apartment'
  },
  bhk: {
    type: Number,
    min: [0, 'BHK cannot be negative'],
    max: [20, 'BHK cannot exceed 20']
  },
  area: {
    size: {
      type: Number,
      required: [true, 'Area size is required'],
      min: [1, 'Area size must be at least 1']
    },
    unit: {
      type: String,
      enum: {
        values: ['sqft', 'sqm', 'acres', 'sqyd'],
        message: 'Invalid area unit'
      },
      default: 'sqft'
    }
  },
  amenities: [{
    type: String,
    trim: true,
    maxlength: [50, 'Amenity name cannot exceed 50 characters']
  }],
  images: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Image must be a valid URL'
    }
  }],
  source: {
    name: {
      type: String,
      required: [true, 'Source name is required'],
      trim: true,
      enum: {
        values: ['Housing.com', 'OLX', 'MagicBricks', 'Manual', 'Other'],
        message: 'Invalid source name'
      }
    },
    url: {
      type: String,
      required: [true, 'Source URL is required'],
      trim: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Source URL must be a valid URL'
      }
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    }
  },
  contact: {
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: 'Invalid phone number format'
      }
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Invalid email format'
      }
    },
    agent: {
      type: String,
      trim: true,
      maxlength: [100, 'Agent name cannot exceed 100 characters']
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'sold', 'rented', 'inactive', 'pending'],
      message: 'Invalid status'
    },
    default: 'active'
  },
  aiProcessed: {
    type: Boolean,
    default: false
  },
  confidence: {
    type: Number,
    min: [0, 'Confidence must be between 0 and 1'],
    max: [1, 'Confidence must be between 0 and 1'],
    default: 0.8
  },
  aiProcessingMetadata: {
    processedAt: {
      type: Date,
      default: Date.now
    },
    processingTime: {
      type: Number,
      default: 0
    },
    aiModel: {
      type: String,
      default: 'gemini-pro'
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
propertySchema.virtual('pricePerSqft').get(function() {
  if (this.area && this.area.size && this.area.unit === 'sqft') {
    return Math.round(this.price / this.area.size);
  }
  return null;
});

propertySchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Indexes for better query performance
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bhk: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ 'source.name': 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ featured: 1 });
propertySchema.index({ createdAt: -1 });
propertySchema.index({ views: -1 });

// Compound indexes
propertySchema.index({ 'location.city': 1, price: 1 });
propertySchema.index({ 'location.city': 1, bhk: 1 });
propertySchema.index({ status: 1, featured: -1, createdAt: -1 });

// Text search index
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.area': 'text',
  'contact.agent': 'text'
});

// Geospatial index for location-based queries
propertySchema.index({ 'location.coordinates': '2dsphere' });

// Pre-save middleware
propertySchema.pre('save', function(next) {
  // Ensure price is rounded to 2 decimal places
  if (this.price) {
    this.price = Math.round(this.price * 100) / 100;
  }
  
  // Remove duplicate amenities
  if (this.amenities) {
    this.amenities = [...new Set(this.amenities.filter(Boolean))];
  }
  
  // Remove duplicate images
  if (this.images) {
    this.images = [...new Set(this.images.filter(Boolean))];
  }
  
  next();
});

// Static methods
propertySchema.statics.findByCity = function(city) {
  return this.find({ 'location.city': new RegExp(city, 'i'), status: 'active' });
};

propertySchema.statics.findByPriceRange = function(minPrice, maxPrice) {
  return this.find({ 
    price: { $gte: minPrice, $lte: maxPrice },
    status: 'active'
  });
};

propertySchema.statics.findFeatured = function() {
  return this.find({ featured: true, status: 'active' })
    .sort({ createdAt: -1 })
    .limit(10);
};

// Instance methods
propertySchema.methods.incrementViews = function() {
  this.views = (this.views || 0) + 1;
  return this.save();
};

propertySchema.methods.markAsSold = function() {
  this.status = 'sold';
  return this.save();
};

propertySchema.methods.markAsRented = function() {
  this.status = 'rented';
  return this.save();
};

module.exports = mongoose.model('Property', propertySchema);