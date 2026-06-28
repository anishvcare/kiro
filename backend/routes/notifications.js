/**
 * Notification Routes
 * REST API endpoints for notification management
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All notification routes require authentication
router.use(authenticate);

// Get notifications for the current user
router.get('/', notificationController.getNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', notificationController.markRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllRead);

// Send notification (admin only)
router.post('/send', notificationController.sendNotification);

// Register FCM token
router.post('/fcm-token', notificationController.registerFCMToken);

module.exports = router;
