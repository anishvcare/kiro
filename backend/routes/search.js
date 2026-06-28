const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const searchController = require('../controllers/searchController');

// All search routes use optional auth (logged in users get personalized results)
router.use(optionalAuth);

// Main search endpoint
router.get('/', searchController.searchShops);

// Smart suggestions (autocomplete)
router.get('/suggestions', searchController.getSmartSuggestions);

// Recent searches (requires auth context for personalization)
router.get('/recent', searchController.getRecentSearches);

// Popular searches
router.get('/popular', searchController.getPopularSearches);

// Nearby shops based on GPS
router.get('/nearby', searchController.getNearbyShops);

// Browse categories
router.get('/categories', searchController.getCategories);

module.exports = router;
