import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Square, 
  Phone, 
  Mail, 
  ExternalLink, 
  Calendar,
  Building,
  Loader
} from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const { selectedProperty, loading, error, fetchPropertyById } = useProperty();

  useEffect(() => {
    if (id) {
      fetchPropertyById(id);
    }
    
    // Cleanup function to clear selected property when component unmounts
    return () => {
      // Optional: Clear selected property to prevent stale data
    };
  }, [id, fetchPropertyById]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-primary-600 animate-spin mr-2" />
        <span className="text-gray-600">Loading property details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="btn-primary">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  if (!selectedProperty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property not found</h2>
          <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Properties
      </Link>

      {/* Property Images */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {selectedProperty.images && selectedProperty.images.length > 0 ? (
            <>
              <div className="lg:col-span-2">
                <img
                  src={selectedProperty.images[0]}
                  alt={selectedProperty.title}
                  className="w-full h-96 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
                  }}
                />
              </div>
              {selectedProperty.images.slice(1, 3).map((image, index) => (
                <div key={index}>
                  <img
                    src={image}
                    alt={`${selectedProperty.title} ${index + 2}`}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400';
                    }}
                  />
                </div>
              ))}
            </>
          ) : (
            <div className="lg:col-span-2 h-96 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg flex items-center justify-center">
              <Square className="w-24 h-24 text-gray-500" />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPropertyTypeColor(selectedProperty.propertyType)}`}>
                {selectedProperty.propertyType.charAt(0).toUpperCase() + selectedProperty.propertyType.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSourceColor(selectedProperty.source.name)}`}>
                {selectedProperty.source.name}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedProperty.priceType === 'rent' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {selectedProperty.priceType === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {selectedProperty.title}
            </h1>

            <div className="text-3xl font-bold text-gray-900 mb-4">
              {formatPrice(selectedProperty.price)}
              {selectedProperty.priceType === 'rent' && <span className="text-lg font-normal text-gray-500">/month</span>}
            </div>

            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>
                {selectedProperty.location.area && `${selectedProperty.location.area}, `}
                {selectedProperty.location.city}
                {selectedProperty.location.fullAddress && ` - ${selectedProperty.location.fullAddress}`}
              </span>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {selectedProperty.bhk && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Bed className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">{selectedProperty.bhk}</div>
                <div className="text-sm text-gray-600">BHK</div>
              </div>
            )}
            {selectedProperty.area && selectedProperty.area.size && (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Square className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-semibold text-gray-900">
                  {formatArea(selectedProperty.area.size, selectedProperty.area.unit)}
                </div>
                <div className="text-sm text-gray-600">Area</div>
              </div>
            )}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Building className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-lg font-semibold text-gray-900">
                {selectedProperty.propertyType.charAt(0).toUpperCase() + selectedProperty.propertyType.slice(1)}
              </div>
              <div className="text-sm text-gray-600">Type</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">
                {formatDate(selectedProperty.source.scrapedAt)}
              </div>
              <div className="text-sm text-gray-600">Listed</div>
            </div>
          </div>

          {/* Description */}
          {selectedProperty.description && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {selectedProperty.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedProperty.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Contact Information */}
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            
            {selectedProperty.contact.agent && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Agent</div>
                <div className="font-medium text-gray-900">{selectedProperty.contact.agent}</div>
              </div>
            )}

            {selectedProperty.contact.phone && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Phone</div>
                <a
                  href={`tel:${selectedProperty.contact.phone}`}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {selectedProperty.contact.phone}
                </a>
              </div>
            )}

            {selectedProperty.contact.email && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <a
                  href={`mailto:${selectedProperty.contact.email}`}
                  className="flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {selectedProperty.contact.email}
                </a>
              </div>
            )}

            {selectedProperty.source.url && (
              selectedProperty.source.url.includes('housing.com/in/') || 
              selectedProperty.source.url.includes('olx.in/') || 
              selectedProperty.source.url.includes('magicbricks.com/') ||
              selectedProperty.source.url.includes('www.magicbricks.com/')
            ) ? (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={selectedProperty.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Original Listing
                </a>
              </div>
            ) : null}
          </div>

          {/* Property Details */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-gray-900 capitalize">{selectedProperty.status}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Source</span>
                <span className="font-medium text-gray-900">{selectedProperty.source.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Scraped</span>
                <span className="font-medium text-gray-900">
                  {formatDate(selectedProperty.source.scrapedAt)}
                </span>
              </div>
              
              {selectedProperty.confidence && (
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Confidence</span>
                  <span className="font-medium text-gray-900">
                    {(selectedProperty.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail; 