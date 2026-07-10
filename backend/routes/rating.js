/**
 * Rating Routes
 * Customer shop ratings + reviews.
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const ratingController = require('../controllers/ratingController');

// Public: a shop's ratings + reviews (shown on shop profile).
router.get('/shop/:shopId', ratingController.getShopRatings);

// Authenticated customer actions.
router.use(authenticate);
router.post('/', ratingController.createRating);
router.get('/my', ratingController.getMyRating);

module.exports = router;
