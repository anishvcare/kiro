const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { registerShopValidation } = require('../middleware/validators');
const shopController = require('../controllers/shopController');

// Public route - view shop public profile
router.get('/:id/public', shopController.getShopPublicProfile);

// All routes below require authentication
router.use(authenticate);

// Shop owner routes
router.post('/register', requireRole('shop_owner'), registerShopValidation, shopController.registerShop);
router.get('/my-shops', requireRole('shop_owner'), shopController.getMyShops);
router.get('/:id', requireRole('shop_owner'), shopController.getShopProfile);
router.get('/:id/dashboard', requireRole('shop_owner'), shopController.getShopDashboard);
router.put('/:id/profile', requireRole('shop_owner'), shopController.updateShopProfile);
router.put('/:id/hours', requireRole('shop_owner'), shopController.updateBusinessHours);
router.put('/:id/payment', requireRole('shop_owner'), shopController.updatePaymentDetails);
router.put('/:id/logo', requireRole('shop_owner'), shopController.uploadLogo);
router.put('/:id/banner', requireRole('shop_owner'), shopController.uploadBanner);
router.patch('/:id/status', requireRole('shop_owner'), shopController.toggleShopStatus);

module.exports = router;
