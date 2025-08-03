const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  priceType: {
    type: String,
    enum: ['rent', 'sale'],
    default: 'sale'
  },
  location: {
    city: {
      type: String,
      required: true,
      trim: true
    },
    area: {
      type: String,
      trim: true
    },
    fullAddress: {
      type: String,
      trim: true
    }
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'plot', 'commercial', 'other'],
    default: 'apartment'
  },
  bhk: {
    type: Number,
    min: 1
  },
  area: {
    size: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['sqft', 'sqm', 'acres'],
      default: 'sqft'
    }
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  source: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    }
  },
  contact: {
    phone: String,
    email: String,
    agent: String
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'rented', 'inactive'],
    default: 'active'
  },
  aiProcessed: {
    type: Boolean,
    default: false
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  }
}, {
  timestamps: true
});

// Indexes for better query performance
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ bhk: 1 });
propertySchema.index({ 'source.name': 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ createdAt: -1 });

// Text search index
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.area': 'text'
});

module.exports = mongoose.model('Property', propertySchema); 