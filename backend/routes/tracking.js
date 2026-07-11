/**
 * Tracking Routes
 * REST live-location endpoints (delivery boy posts, customer/agent polls).
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const trackingController = require('../controllers/trackingController');

router.use(authenticate);

// Delivery boy posts their current GPS position.
router.post('/:assignmentId/location', trackingController.postLocation);

// Customer/agent reads the latest position.
router.get('/:assignmentId/location', trackingController.getLatestLocation);

module.exports = router;
