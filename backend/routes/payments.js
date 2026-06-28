const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadPaymentScreenshot } = require('../middleware/upload');
const { initiatePaymentValidation } = require('../middleware/validators');
const paymentController = require('../controllers/paymentController');

// Webhook endpoint (no auth required - called by payment gateways)
router.post('/webhook/:gateway', paymentController.handleWebhook);

// All other routes require authentication
router.use(authenticate);

// Customer routes
router.post('/initiate', initiatePaymentValidation, paymentController.initiatePayment);
router.post('/:id/screenshot', uploadPaymentScreenshot, paymentController.uploadPaymentScreenshot);
router.get('/history', paymentController.getTransactionHistory);
router.get('/quotation/:quotationId', paymentController.getPaymentByQuotation);
router.get('/:id/status', paymentController.getPaymentStatus);

// Shop owner / admin routes
router.put('/:id/verify', requireRole('shop_owner', 'admin'), paymentController.verifyPayment);

module.exports = router;
