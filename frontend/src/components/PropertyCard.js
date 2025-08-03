import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Square, ExternalLink, Tag } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  const formatArea = (size, unit) => {
    return `${size.toLocaleString()} ${unit}`;
  };

  const getPropertyTypeColor = (type) => {
    const colors = {
      apartment: 'bg-blue-100 text-blue-700',
      house: 'bg-green-100 text-green-700',
      villa: 'bg-purple-100 text-purple-700',
      plot: 'bg-orange-100 text-orange-700',
      commercial: 'bg-red-100 text-red-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[type] || colors.other;
  };

  const getSourceColor = (source) => {
    const colors = {
      'Housing.com': 'bg-blue-100 text-blue-700',
      'OLX': 'bg-orange-100 text-orange-700',
      'MagicBricks': 'bg-purple-100 text-purple-700'
    };
    return colors[source] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="property-card group">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <Square className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        {/* Price Type Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            property.priceType === 'rent' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {property.priceType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
        </div>

        {/* Source Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(property.source.name)}`}>
            {property.source.name}
          </span>
        </div>

        {/* Property Type Badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPropertyTypeColor(property.propertyType)}`}>
            {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link to={`/property/${property.id || property._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-3">
          {formatPrice(property.price)}
          {property.priceType === 'rent' && <span className="text-sm font-normal text-gray-500">/month</span>}
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {property.location.area && `${property.location.area}, `}
            {property.location.city}
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {property.bhk && (
              <div className="flex items-center text-gray-600">
                <Bed className="w-4 h-4 mr-1" />
                <span className="text-sm">{property.bhk} BHK</span>
              </div>
            )}
            {property.area && property.area.size && (
              <div className="flex items-center text-gray-600">
                <Square className="w-4 h-4 mr-1" />
                <span className="text-sm">{formatArea(property.area.size, property.area.unit)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Link
            to={`/property/${property.id || property._id}`}
            className="btn-primary text-sm"
          >
            View Details
          </Link>
          
          {(() => {
            const getSourceUrl = () => {
              if (property.source?.url) return property.source.url;
              
              // Fallback URLs based on source name
              const city = property.location?.city || 'mumbai';
              switch (property.source?.name) {
                case 'Housing.com':
                  return `https://housing.com/in/buy/${city.toLowerCase()}`;
                case 'OLX':
                  return `https://olx.in/properties-for-sale/${city.toLowerCase()}`;
                case 'MagicBricks':
                  return `https://www.magicbricks.com/property-for-sale/residential-real-estate?cityName=${city}`;
                default:
                  return null;
              }
            };
            
            const sourceUrl = getSourceUrl();
            return sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm flex items-center space-x-1"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Original</span>
              </a>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard; 