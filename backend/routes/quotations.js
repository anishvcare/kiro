const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { createQuotationValidation } = require('../middleware/validators');
const { uploadBillImage } = require('../middleware/upload');
const quotationController = require('../controllers/quotationController');

// All routes require authentication
router.use(authenticate);

// Shop owner routes
router.post('/', requireRole('shop_owner'), createQuotationValidation, quotationController.createQuotation);
router.post('/upload-bill', requireRole('shop_owner'), uploadBillImage, quotationController.uploadBill);
router.get('/delivery-estimate', requireRole('shop_owner'), quotationController.getDeliveryEstimate);
router.put('/:id', requireRole('shop_owner'), quotationController.updateQuotation);

// Customer routes
router.put('/:id/accept', requireRole('customer'), quotationController.acceptQuotation);
router.put('/:id/reject', requireRole('customer'), quotationController.rejectQuotation);

// Shared routes
router.get('/:id', quotationController.getQuotation);
router.get('/request/:requestId', quotationController.getQuotationsByRequest);

module.exports = router;
