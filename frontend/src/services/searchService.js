import api from './api';

/**
 * Search shops with query and filters
 */
export const searchShops = async (params) => {
  const response = await api.get('/search', { params });
  return response.data.data;
};

/**
 * Get smart suggestions for autocomplete
 */
export const getSmartSuggestions = async (query) => {
  const response = await api.get('/search/suggestions', { params: { q: query } });
  return response.data.data.suggestions;
};

/**
 * Get recent searches for the current user
 */
export const getRecentSearches = async () => {
  const response = await api.get('/search/recent');
  return response.data.data.recentSearches;
};

/**
 * Get popular searches
 */
export const getPopularSearches = async () => {
  const response = await api.get('/search/popular');
  return response.data.data.popularSearches;
};

/**
 * Get nearby shops based on GPS coordinates
 */
export const getNearbyShops = async (latitude, longitude, radius = 5) => {
  const response = await api.get('/search/nearby', {
    params: { latitude, longitude, radius },
  });
  return response.data.data.shops;
};

/**
 * Get all categories for browsing
 */
export const getCategories = async () => {
  const response = await api.get('/search/categories');
  return response.data.data.categories;
};

export default {
  searchShops,
  getSmartSuggestions,
  getRecentSearches,
  getPopularSearches,
  getNearbyShops,
  getCategories,
};
