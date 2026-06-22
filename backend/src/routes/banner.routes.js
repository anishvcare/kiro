const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes
router.get('/', bannerController.getAll);

// Admin routes
router.get('/:id', authMiddleware, adminMiddleware, bannerController.getById);

router.post('/', authMiddleware, adminMiddleware, [
  body('image').notEmpty().withMessage('Banner image is required'),
  validate
], bannerController.create);

router.put('/:id', authMiddleware, adminMiddleware, bannerController.update);
router.delete('/:id', authMiddleware, adminMiddleware, bannerController.delete);

module.exports = router;
