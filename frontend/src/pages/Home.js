import React, { useState } from 'react';
import { useProperty } from '../context/PropertyContext';
import PropertyCard from '../components/PropertyCard';
import FilterSidebar from '../components/FilterSidebar';
import { Filter, Grid, List, ChevronLeft, ChevronRight, Loader } from 'lucide-react';

const Home = () => {
  const {
    properties,
    loading,
    error,
    filters,
    pagination,
    filterOptions,
    updateFilters,
    clearFilters,
    setPage
  } = useProperty();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Property Listings
            </h1>
            <p className="text-gray-600">
              {pagination.totalItems} properties found
              {filters.city && ` in ${filters.city}`}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-secondary mt-4 sm:mt-0"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Active Filters */}
        {(filters.city || filters.minPrice || filters.maxPrice || filters.bhk || filters.propertyType || filters.source || filters.priceType) && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-900">Active Filters:</h3>
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.city && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  City: {filters.city}
                </span>
              )}
              {filters.minPrice && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Min: {formatPrice(filters.minPrice)}
                </span>
              )}
              {filters.maxPrice && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Max: {formatPrice(filters.maxPrice)}
                </span>
              )}
              {filters.bhk && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {filters.bhk} BHK
                </span>
              )}
              {filters.propertyType && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {filters.propertyType}
                </span>
              )}
              {filters.source && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {filters.source}
                </span>
              )}
              {filters.priceType && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {filters.priceType === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              )}
            </div>
          </div>
        )}

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-primary-600 animate-spin mr-2" />
            <span className="text-gray-600">Loading properties...</span>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && properties.length > 0 && (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {properties.map((property) => (
                <PropertyCard key={property.id || property._id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === pagination.currentPage
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search criteria
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 