const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { assignDeliveryValidation } = require('../middleware/validators');
const { uploadDeliveryProofImage } = require('../middleware/upload');
const deliveryAgentController = require('../controllers/deliveryAgentController');
const deliveryBoyController = require('../controllers/deliveryBoyController');

// All routes require authentication
router.use(authenticate);

// Shared tracking info (OTP + pickup/dropoff) - any authenticated role (customer/agent/boy)
router.get('/track-info/:assignmentId', deliveryBoyController.getTrackInfo);

// ===== DELIVERY AGENT ROUTES =====
router.get('/agent/confirmed-requests', requireRole('delivery_agent'), deliveryAgentController.getConfirmedRequests);
router.post('/agent/assign', requireRole('delivery_agent'), assignDeliveryValidation, deliveryAgentController.assignDeliveryBoy);
router.put('/agent/reassign', requireRole('delivery_agent'), deliveryAgentController.reassignDeliveryBoy);
router.get('/agent/active-deliveries', requireRole('delivery_agent'), deliveryAgentController.getActiveDeliveries);
router.get('/agent/delivery-boys', requireRole('delivery_agent'), deliveryAgentController.getDeliveryBoyList);
router.get('/agent/performance/:deliveryBoyId', requireRole('delivery_agent'), deliveryAgentController.getDeliveryBoyPerformance);
router.put('/agent/verify-cash/:collectionId', requireRole('delivery_agent'), deliveryAgentController.verifyCashCollection);
router.get('/agent/cash-report', requireRole('delivery_agent'), deliveryAgentController.getCashReport);
router.get('/agent/settlement-report', requireRole('delivery_agent'), deliveryAgentController.getSettlementReport);

// ===== DELIVERY BOY ROUTES =====
router.put('/boy/status', requireRole('delivery_boy'), deliveryBoyController.setOnlineStatus);
router.get('/boy/assigned', requireRole('delivery_boy'), deliveryBoyController.getAssignedDeliveries);
router.put('/boy/accept/:assignmentId', requireRole('delivery_boy'), deliveryBoyController.acceptDelivery);
router.put('/boy/reject/:assignmentId', requireRole('delivery_boy'), deliveryBoyController.rejectDelivery);
router.put('/boy/reached-shop/:assignmentId', requireRole('delivery_boy'), deliveryBoyController.markReachedShop);
router.put('/boy/picked-up/:assignmentId', requireRole('delivery_boy'), deliveryBoyController.markPickedUp);
router.put('/boy/out-for-delivery/:assignmentId', requireRole('delivery_boy'), deliveryBoyController.markOutForDelivery);
router.put('/boy/reached-customer/:assignmentId', requireRole('delivery_boy'), deliveryBoyController.markReachedCustomer);
router.put('/boy/delivered/:assignmentId', requireRole('delivery_boy'), deliveryBoyController.markDelivered);
router.post('/boy/cash-collection', requireRole('delivery_boy'), deliveryBoyController.submitCashCollection);
router.post('/boy/proof/:assignmentId', requireRole('delivery_boy'), uploadDeliveryProofImage, deliveryBoyController.uploadDeliveryProof);
router.post('/boy/verify-otp/:assignmentId', requireRole('delivery_boy'), deliveryBoyController.verifyOTP);
router.get('/boy/daily-deliveries', requireRole('delivery_boy'), deliveryBoyController.getDailyDeliveries);
router.get('/boy/earnings', requireRole('delivery_boy'), deliveryBoyController.getEarnings);
router.get('/boy/history', requireRole('delivery_boy'), deliveryBoyController.getDeliveryHistory);

module.exports = router;
