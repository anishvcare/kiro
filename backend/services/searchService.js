/**
 * Search Service - Search ranking, filtering, and query logic
 */
const { Op } = require('sequelize');
const { calculateDistance, getBoundingBox } = require('./geoService');

/**
 * Build search conditions for shops
 * @param {string} query - Search query text
 * @returns {object} Sequelize where conditions
 */
const buildSearchConditions = (query) => {
  if (!query || query.trim() === '') {
    return {};
  }

  const searchTerm = `%${query.trim()}%`;

  return {
    [Op.or]: [
      { name: { [Op.like]: searchTerm } },
      { description: { [Op.like]: searchTerm } },
      { address: { [Op.like]: searchTerm } },
      { city: { [Op.like]: searchTerm } },
    ],
  };
};

/**
 * Build filter conditions for shop queries
 * @param {object} filters - Filter parameters
 * @returns {object} Sequelize where conditions
 */
const buildFilterConditions = (filters) => {
  const conditions = {};

  if (filters.rating) {
    conditions.rating = { [Op.gte]: parseFloat(filters.rating) };
  }

  if (filters.verified === 'true' || filters.verified === true) {
    conditions.is_verified = true;
  }

  if (filters.isActive !== undefined) {
    conditions.is_active = filters.isActive === 'true' || filters.isActive === true;
  } else {
    conditions.is_active = true;
  }

  if (filters.categoryId) {
    conditions.category_id = parseInt(filters.categoryId);
  }

  return conditions;
};

/**
 * Check if a shop is currently open based on its hours
 * @param {object} shop - Shop object with opening_time, closing_time, working_days
 * @returns {boolean}
 */
const isShopOpen = (shop) => {
  if (!shop.opening_time || !shop.closing_time) {
    return true; // If no hours set, assume always open
  }

  // Evaluate the shop's hours in its local timezone (India Standard Time by
  // default). The server may run in UTC (e.g. Azure), so using the raw server
  // clock would incorrectly mark shops closed. SHOP_TIMEZONE can override this.
  const timeZone = process.env.SHOP_TIMEZONE || 'Asia/Kolkata';
  const now = new Date();
  const currentDay = now
    .toLocaleDateString('en-US', { weekday: 'long', timeZone })
    .toLowerCase();

  // Check working days
  if (shop.working_days && Array.isArray(shop.working_days)) {
    if (!shop.working_days.includes(currentDay)) {
      return false;
    }
  }

  // Check time (HH:MM in the shop's timezone)
  const currentTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  });
  const openTime = shop.opening_time.slice(0, 5);
  const closeTime = shop.closing_time.slice(0, 5);

  // Handle overnight hours (e.g. 18:00 -> 02:00)
  if (closeTime < openTime) {
    return currentTime >= openTime || currentTime <= closeTime;
  }

  return currentTime >= openTime && currentTime <= closeTime;
};

/**
 * Apply GPS-based distance filtering and sorting
 * @param {Array} shops - Array of shop objects
 * @param {number} lat - User latitude
 * @param {number} lon - User longitude
 * @param {number} radiusKm - Max distance in km (default 10)
 * @returns {Array} Shops with distance, filtered by radius, sorted by distance
 */
const applyDistanceFilter = (shops, lat, lon, radiusKm = 10) => {
  if (!lat || !lon) return shops;

  return shops
    .map((shop) => {
      const shopLat = parseFloat(shop.latitude);
      const shopLon = parseFloat(shop.longitude);

      if (!shopLat || !shopLon) return null;

      const distance = calculateDistance(lat, lon, shopLat, shopLon);
      return { ...shop, distance: Math.round(distance * 10) / 10 };
    })
    .filter((shop) => shop !== null && shop.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Rank search results based on relevance
 * @param {Array} shops - Array of shop objects with distance
 * @param {string} query - Original search query
 * @returns {Array} Sorted by relevance score
 */
const rankResults = (shops, query) => {
  if (!query) return shops;

  const queryLower = query.toLowerCase();

  return shops
    .map((shop) => {
      let score = 0;

      // Exact name match
      if (shop.name && shop.name.toLowerCase() === queryLower) {
        score += 100;
      }
      // Name contains query
      else if (shop.name && shop.name.toLowerCase().includes(queryLower)) {
        score += 50;
      }

      // Category name match
      if (shop.category && shop.category.name &&
          shop.category.name.toLowerCase().includes(queryLower)) {
        score += 30;
      }

      // Keyword (product) match - important since shops are found via keywords
      if (Array.isArray(shop.keywords)) {
        const hasKeywordMatch = shop.keywords.some(
          (k) => k.keyword && k.keyword.toLowerCase().includes(queryLower)
        );
        if (hasKeywordMatch) {
          score += 40;
        }
      }

      // Description match
      if (shop.description && shop.description.toLowerCase().includes(queryLower)) {
        score += 15;
      }

      // Rating bonus
      score += (parseFloat(shop.rating) || 0) * 5;

      // Verified bonus
      if (shop.is_verified) score += 10;

      // Distance penalty (closer is better)
      if (shop.distance) {
        score -= shop.distance * 2;
      }

      return { ...shop, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
};

module.exports = {
  buildSearchConditions,
  buildFilterConditions,
  isShopOpen,
  applyDistanceFilter,
  rankResults,
  getBoundingBox,
};
