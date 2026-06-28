const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { exportValidation, reportDateValidation } = require('../middleware/validators');

// Controllers
const adminController = require('../controllers/adminController');
const userManagementController = require('../controllers/userManagementController');
const shopManagementController = require('../controllers/shopManagementController');
const categoryController = require('../controllers/categoryController');
const serviceAreaController = require('../controllers/serviceAreaController');
const deliverySettingsController = require('../controllers/deliverySettingsController');
const reportsController = require('../controllers/reportsController');
const supportTicketController = require('../controllers/supportTicketController');

// All admin routes require authentication and super_admin role
router.use(authenticate);
router.use(requireRole('super_admin'));

// Dashboard & Stats
router.get('/stats', adminController.getStats);
router.get('/dashboard', adminController.getDashboard);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

// Notifications
router.post('/notifications', adminController.sendNotification);

// User Management
router.get('/users', userManagementController.listUsers);
router.get('/users/:id', userManagementController.getUserDetails);
router.patch('/users/:id/status', userManagementController.updateUserStatus);
router.patch('/users/:id/role', userManagementController.updateUserRole);
router.delete('/users/:id', userManagementController.deleteUser);

// Shop Management
router.get('/shops', shopManagementController.listShops);
router.get('/shops/:id', shopManagementController.getShopDetails);
router.patch('/shops/:id/approve', shopManagementController.approveShop);
router.patch('/shops/:id/reject', shopManagementController.rejectShop);
router.patch('/shops/:id/status', shopManagementController.updateShopStatus);

// Category Management
router.get('/categories', categoryController.listCategories);
router.get('/categories/:id', categoryController.getCategory);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Service Areas
router.get('/service-areas', serviceAreaController.listServiceAreas);
router.get('/service-areas/:id', serviceAreaController.getServiceArea);
router.post('/service-areas', serviceAreaController.createServiceArea);
router.put('/service-areas/:id', serviceAreaController.updateServiceArea);
router.delete('/service-areas/:id', serviceAreaController.deleteServiceArea);

// Delivery Settings
router.get('/delivery-settings', deliverySettingsController.getDeliverySettings);
router.put('/delivery-settings', deliverySettingsController.updateDeliverySettings);

// Reports
router.get('/reports/daily-requests', reportsController.getDailyRequests);
router.get('/reports/completed-deliveries', reportsController.getCompletedDeliveries);
router.get('/reports/revenue', reportsController.getRevenueReport);
router.get('/reports/cash-collections', reportsController.getCashCollections);
router.get('/reports/upi-payments', reportsController.getUpiPayments);
router.get('/reports/shop-settlements', reportsController.getShopSettlements);
router.get('/reports/delivery-performance', reportsController.getDeliveryPerformance);
router.get('/reports/summary', reportsController.getSummaryReport);
router.get('/reports/export/excel', exportValidation, reportsController.exportToExcel);
router.get('/reports/export/pdf', exportValidation, reportsController.exportToPdf);

// Support Tickets
router.get('/support-tickets', supportTicketController.listTickets);
router.get('/support-tickets/:id', supportTicketController.getTicket);
router.patch('/support-tickets/:id', supportTicketController.updateTicket);

module.exports = router;
