const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes
router.get('/', productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/new', productController.getNew);
router.get('/popular', productController.getPopular);
router.get('/low-stock', authMiddleware, adminMiddleware, productController.getLowStock);
router.get('/slug/:slug', productController.getBySlug);
router.get('/:id', productController.getById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category_id').isInt().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  validate
], productController.create);

router.put('/:id', authMiddleware, adminMiddleware, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  validate
], productController.update);

router.delete('/:id', authMiddleware, adminMiddleware, productController.delete);
router.post('/bulk-delete', authMiddleware, adminMiddleware, productController.bulkDelete);
router.patch('/:id/stock', authMiddleware, adminMiddleware, productController.updateStock);

module.exports = router;
