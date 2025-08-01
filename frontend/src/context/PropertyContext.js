import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { getProperties, getFilterOptions, getPropertyById } from '../services/api';

const PropertyContext = createContext();

const initialState = {
  properties: [],
  loading: false,
  error: null,
  filters: {
    city: '',
    minPrice: '',
    maxPrice: '',
    bhk: '',
    propertyType: '',
    source: '',
    priceType: '',
    search: ''
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  },
  filterOptions: {
    cities: [],
    sources: [],
    propertyTypes: [],
    bhkOptions: [],
    priceRange: { minPrice: 0, maxPrice: 0 }
  },
  selectedProperty: null
};

const propertyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_PROPERTIES':
      return { 
        ...state, 
        properties: action.payload.properties,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      };
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 }
      };
    
    case 'SET_FILTER_OPTIONS':
      return { ...state, filterOptions: action.payload };
    
    case 'SET_SELECTED_PROPERTY':
      return { ...state, selectedProperty: action.payload };
    
    case 'CLEAR_FILTERS':
      return { 
        ...state, 
        filters: initialState.filters,
        pagination: { ...state.pagination, currentPage: 1 }
      };
    
    case 'SET_PAGE':
      return { 
        ...state, 
        pagination: { ...state.pagination, currentPage: action.payload }
      };
    
    default:
      return state;
  }
};

export const PropertyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(propertyReducer, initialState);
  const requestTimeoutRef = useRef(null);

  const fetchProperties = useCallback(async (filters = state.filters, page = 1) => {
    try {
      // Prevent duplicate requests while loading
      if (state.loading) return;
      
      // Clear any pending timeout
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
      
      // Debounce requests to prevent rapid successive calls
      requestTimeoutRef.current = setTimeout(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await getProperties({ ...filters, page });
        dispatch({ type: 'SET_PROPERTIES', payload: response });
      }, 300); // 300ms debounce
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []); // No dependencies to prevent infinite re-renders

  const fetchFilterOptions = useCallback(async () => {
    try {
      // Only fetch if we don't already have filter options
      if (state.filterOptions.cities && state.filterOptions.cities.length > 0) return;
      
      const options = await getFilterOptions();
      dispatch({ type: 'SET_FILTER_OPTIONS', payload: options });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  }, []); // Remove dependencies to prevent infinite re-renders

  const fetchPropertyById = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const property = await getPropertyById(id);
      dispatch({ type: 'SET_SELECTED_PROPERTY', payload: property });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }, []);

  const updateFilters = useCallback((newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  // Load filter options on mount
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  // Fetch properties when filters or page changes
  useEffect(() => {
    fetchProperties(state.filters, state.pagination.currentPage);
  }, [fetchProperties, state.filters, state.pagination.currentPage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (requestTimeoutRef.current) {
        clearTimeout(requestTimeoutRef.current);
      }
    };
  }, []);

  const value = {
    ...state,
    fetchProperties,
    fetchPropertyById,
    updateFilters,
    clearFilters,
    setPage
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
}; 