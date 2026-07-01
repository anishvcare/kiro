const { Op } = require('sequelize');
const {
  Shop,
  ShopCategory,
  ShopKeyword,
  SearchTag,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler } = require('../utils/helpers');
const {
  buildSearchConditions,
  buildFilterConditions,
  isShopOpen,
  applyDistanceFilter,
  rankResults,
} = require('../services/searchService');
const { getBoundingBox } = require('../services/geoService');

/**
 * Search shops by product name, shop name, category, or nearby GPS
 * GET /api/search
 */
const searchShops = asyncHandler(async (req, res) => {
  const {
    q,
    latitude,
    longitude,
    radius = 10,
    page = 1,
    limit = 20,
    categoryId,
    rating,
    verified,
    openNow,
    deliveryAvailable,
    codAvailable,
    upiAvailable,
    sortBy = 'relevance',
  } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  // Build base search conditions (matches shop name / description / address / city)
  const searchConditions = buildSearchConditions(q);
  const filterConditions = buildFilterConditions({ rating, verified, categoryId });

  // Extend text search to also match shops by their registered keywords
  // (product keywords) and by their category name. This is essential because
  // shops do not upload product catalogues - they rely on keywords to be found.
  if (q && q.trim() !== '' && searchConditions[Op.or]) {
    const searchTerm = `%${q.trim()}%`;

    // Shops that have a matching product keyword
    const keywordMatches = await ShopKeyword.findAll({
      where: { keyword: { [Op.like]: searchTerm } },
      attributes: ['shop_id'],
      raw: true,
    });
    const keywordShopIds = [...new Set(keywordMatches.map((k) => k.shop_id))];
    if (keywordShopIds.length > 0) {
      searchConditions[Op.or].push({ id: { [Op.in]: keywordShopIds } });
    }

    // Shops whose category name matches the query
    const categoryMatches = await ShopCategory.findAll({
      where: { name: { [Op.like]: searchTerm } },
      attributes: ['id'],
      raw: true,
    });
    const categoryIds = categoryMatches.map((c) => c.id);
    if (categoryIds.length > 0) {
      searchConditions[Op.or].push({ category_id: { [Op.in]: categoryIds } });
    }
  }

  // Merge conditions
  const whereClause = { ...searchConditions, ...filterConditions };

  // If GPS coordinates provided, apply bounding box pre-filter
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  const radiusKm = parseFloat(radius);

  if (lat && lon) {
    const bbox = getBoundingBox(lat, lon, radiusKm);
    whereClause.latitude = { [Op.between]: [bbox.minLat, bbox.maxLat] };
    whereClause.longitude = { [Op.between]: [bbox.minLon, bbox.maxLon] };
  }

  // Query shops with associations
  const { count, rows: shops } = await Shop.findAndCountAll({
    where: whereClause,
    include: [
      { model: ShopCategory, as: 'category', attributes: ['id', 'name', 'icon'] },
      { model: ShopKeyword, as: 'keywords', attributes: ['keyword'] },
    ],
    limit: parseInt(limit),
    offset,
    order: sortBy === 'rating' ? [['rating', 'DESC']] : [['name', 'ASC']],
  });

  // Convert to plain objects for manipulation
  let results = shops.map((shop) => shop.get({ plain: true }));

  // Apply distance calculation if GPS provided
  if (lat && lon) {
    results = applyDistanceFilter(results, lat, lon, radiusKm);
  }

  // Apply open now filter
  if (openNow === 'true') {
    results = results.filter((shop) => isShopOpen(shop));
  }

  // Rank by relevance
  if (q && sortBy === 'relevance') {
    results = rankResults(results, q);
  }

  // Add open status to each shop
  results = results.map((shop) => ({
    ...shop,
    isOpen: isShopOpen(shop),
  }));

  return apiResponse(res, 200, 'Search results retrieved', {
    shops: results,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
    query: q || null,
  });
});

/**
 * Get smart suggestions based on partial input
 * GET /api/search/suggestions
 */
const getSmartSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    return apiResponse(res, 200, 'Suggestions retrieved', { suggestions: [] });
  }

  const searchTerm = `%${q.trim()}%`;

  // Search in shop names
  const shopSuggestions = await Shop.findAll({
    where: {
      name: { [Op.like]: searchTerm },
      is_active: true,
    },
    attributes: ['name'],
    limit: 5,
  });

  // Search in categories
  const categorySuggestions = await ShopCategory.findAll({
    where: {
      name: { [Op.like]: searchTerm },
      is_active: true,
    },
    attributes: ['id', 'name', 'icon'],
    limit: 5,
  });

  // Search in keywords/tags
  const tagSuggestions = await SearchTag.findAll({
    where: {
      tag: { [Op.like]: searchTerm },
    },
    attributes: ['tag', 'usage_count'],
    order: [['usage_count', 'DESC']],
    limit: 5,
  });

  // Search in shop keywords
  const keywordSuggestions = await ShopKeyword.findAll({
    where: {
      keyword: { [Op.like]: searchTerm },
    },
    attributes: ['keyword'],
    limit: 5,
    group: ['keyword'],
  });

  const suggestions = [
    ...shopSuggestions.map((s) => ({ type: 'shop', text: s.name })),
    ...categorySuggestions.map((c) => ({ type: 'category', text: c.name, id: c.id, icon: c.icon })),
    ...tagSuggestions.map((t) => ({ type: 'tag', text: t.tag })),
    ...keywordSuggestions.map((k) => ({ type: 'keyword', text: k.keyword })),
  ];

  // Deduplicate
  const uniqueSuggestions = suggestions.filter(
    (item, index, self) => index === self.findIndex((s) => s.text === item.text)
  );

  return apiResponse(res, 200, 'Suggestions retrieved', {
    suggestions: uniqueSuggestions.slice(0, 10),
  });
});

/**
 * Get recent searches for the authenticated user
 * GET /api/search/recent
 */
const getRecentSearches = asyncHandler(async (req, res) => {
  // In a real app, this would come from a user_searches table
  // For now, return a placeholder structure
  return apiResponse(res, 200, 'Recent searches retrieved', {
    recentSearches: [],
  });
});

/**
 * Get popular searches
 * GET /api/search/popular
 */
const getPopularSearches = asyncHandler(async (req, res) => {
  const popularTags = await SearchTag.findAll({
    order: [['usage_count', 'DESC']],
    limit: 10,
    attributes: ['tag', 'usage_count'],
  });

  return apiResponse(res, 200, 'Popular searches retrieved', {
    popularSearches: popularTags.map((t) => t.tag),
  });
});

/**
 * Get nearby shops based on GPS coordinates
 * GET /api/search/nearby
 */
const getNearbyShops = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 5, limit = 20 } = req.query;

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (!lat || !lon) {
    return apiResponse(res, 400, 'Latitude and longitude are required');
  }

  const radiusKm = parseFloat(radius);
  const bbox = getBoundingBox(lat, lon, radiusKm);

  const shops = await Shop.findAll({
    where: {
      is_active: true,
      latitude: { [Op.between]: [bbox.minLat, bbox.maxLat] },
      longitude: { [Op.between]: [bbox.minLon, bbox.maxLon] },
    },
    include: [
      { model: ShopCategory, as: 'category', attributes: ['id', 'name', 'icon'] },
    ],
    limit: parseInt(limit),
  });

  let results = shops.map((shop) => shop.get({ plain: true }));
  results = applyDistanceFilter(results, lat, lon, radiusKm);

  // Add open status
  results = results.map((shop) => ({
    ...shop,
    isOpen: isShopOpen(shop),
  }));

  return apiResponse(res, 200, 'Nearby shops retrieved', {
    shops: results,
  });
});

/**
 * Get all categories for browsing
 * GET /api/search/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await ShopCategory.findAll({
    where: { is_active: true },
    order: [['name', 'ASC']],
    attributes: ['id', 'name', 'icon', 'description'],
  });

  return apiResponse(res, 200, 'Categories retrieved', { categories });
});

module.exports = {
  searchShops,
  getSmartSuggestions,
  getRecentSearches,
  getPopularSearches,
  getNearbyShops,
  getCategories,
};
