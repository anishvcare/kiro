const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes
router.get('/', categoryController.getAll);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', categoryController.getById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, [
  body('name').notEmpty().withMessage('Category name is required'),
  validate
], categoryController.create);

router.put('/:id', authMiddleware, adminMiddleware, [
  body('name').notEmpty().withMessage('Category name is required'),
  validate
], categoryController.update);

router.delete('/:id', authMiddleware, adminMiddleware, categoryController.delete);

module.exports = router;
