const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const settlementController = require('../controllers/settlementController');

// All routes require authentication
router.use(authenticate);

// Delivery boy routes
router.post('/cash-collection', requireRole('delivery_boy', 'delivery_agent'), settlementController.recordCashCollection);

// Delivery agent / admin routes
router.put('/cash-collection/:id/verify', requireRole('delivery_agent', 'admin'), settlementController.verifyCollection);
router.get('/unsettled-collections', requireRole('delivery_agent', 'admin'), settlementController.getUnsettledCollections);

// Admin routes
router.post('/settle-to-shop', requireRole('admin'), settlementController.settleToShop);
router.get('/report', requireRole('admin'), settlementController.getSettlementReport);

// Shared routes
router.get('/history', settlementController.getSettlementHistory);

module.exports = router;
