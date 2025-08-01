import React, { useState } from 'react';
import { Filter, X, Search, MapPin, DollarSign, Home, Building } from 'lucide-react';

const FilterSidebar = ({ filters, filterOptions, onFilterChange, onClearFilters, isOpen, onToggle }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      bhk: '',
      propertyType: '',
      source: '',
      priceType: '',
      search: ''
    });
    onClearFilters();
  };

  const formatPrice = (price) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Filter Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search properties..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                City
              </label>
              <select
                value={localFilters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="input-field"
              >
                <option value="">All Cities</option>
                {filterOptions?.cities?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                )) || []}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={localFilters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="input-field text-sm"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={localFilters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="input-field text-sm"
                />
              </div>
              {filterOptions?.priceRange && (
                <div className="text-xs text-gray-500 mt-1">
                  Range: {formatPrice(filterOptions.priceRange.minPrice)} - {formatPrice(filterOptions.priceRange.maxPrice)}
                </div>
              )}
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="w-4 h-4 inline mr-1" />
                Property Type
              </label>
              <select
                value={localFilters.propertyType}
                onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                {filterOptions?.propertyTypes?.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                )) || []}
              </select>
            </div>

            {/* BHK */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                BHK
              </label>
              <select
                value={localFilters.bhk}
                onChange={(e) => handleFilterChange('bhk', e.target.value)}
                className="input-field"
              >
                <option value="">Any BHK</option>
                {filterOptions?.bhkOptions?.map((bhk) => (
                  <option key={bhk} value={bhk}>
                    {bhk} BHK
                  </option>
                )) || []}
              </select>
            </div>

            {/* Price Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                value={localFilters.priceType}
                onChange={(e) => handleFilterChange('priceType', e.target.value)}
                className="input-field"
              >
                <option value="">All</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={localFilters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="input-field"
              >
                <option value="">All Sources</option>
                {filterOptions?.sources?.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                )) || []}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="w-full btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar; 