const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public routes
router.get('/public', settingsController.getPublic);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, settingsController.getAll);
router.put('/', authMiddleware, adminMiddleware, settingsController.update);
router.put('/:key', authMiddleware, adminMiddleware, settingsController.updateSingle);

module.exports = router;
