const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, adminMiddleware, customerController.getAll);
router.get('/:id', authMiddleware, adminMiddleware, customerController.getById);
router.delete('/:id', authMiddleware, adminMiddleware, customerController.delete);

module.exports = router;
