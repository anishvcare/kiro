const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public routes (customer placing order)
router.post('/', [
  body('customer_name').notEmpty().withMessage('Name is required'),
  body('customer_phone').notEmpty().withMessage('Phone number is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  validate
], orderController.create);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, orderController.getAll);
router.get('/:id', authMiddleware, adminMiddleware, orderController.getById);
router.patch('/:id/status', authMiddleware, adminMiddleware, [
  body('status').notEmpty().withMessage('Status is required'),
  validate
], orderController.updateStatus);

module.exports = router;
