const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadRequestImages } = require('../middleware/upload');
const { createRequestValidation, uuidParamValidation } = require('../middleware/validators');
const requestController = require('../controllers/requestController');

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', requireRole('customer'), createRequestValidation, requestController.createRequest);
router.get('/my-requests', requireRole('customer'), requestController.getCustomerRequests);
router.put('/:id/cancel', requireRole('customer'), requestController.cancelRequest);
router.post('/:id/images', requireRole('customer'), uploadRequestImages, requestController.uploadRequestImage);

// Shop owner routes
router.get('/shop/:shopId', requireRole('shop_owner'), requestController.getShopRequests);

// Shared routes (customer or shop owner)
router.get('/:id', requestController.getRequestDetails);
router.put('/:id/status', requestController.updateRequestStatus);

module.exports = router;
