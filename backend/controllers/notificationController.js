/**
 * Notification Controller
 * REST endpoints for notification management
 */

const { Notification, User } = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');
const { Op } = require('sequelize');
const firebaseService = require('../services/firebaseService');

/**
 * Get notifications for the current user
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, unread_only } = req.query;

  const where = { user_id: userId };
  if (unread_only === 'true') {
    where.is_read = false;
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const notifications = await Notification.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  const unreadCount = await Notification.count({
    where: { user_id: userId, is_read: false },
  });

  return apiResponse(res, 200, 'Notifications retrieved', {
    notifications: notifications.rows,
    total: notifications.count,
    unread_count: unreadCount,
    page: parseInt(page),
    totalPages: Math.ceil(notifications.count / parseInt(limit)),
  });
});

/**
 * Mark a single notification as read
 */
const markRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const notification = await Notification.findOne({
    where: { id: notificationId, user_id: userId },
  });

  if (!notification) {
    return apiResponse(res, 404, 'Notification not found');
  }

  await notification.update({ is_read: true, read_at: new Date() });

  return apiResponse(res, 200, 'Notification marked as read');
});

/**
 * Mark all notifications as read
 */
const markAllRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Notification.update(
    { is_read: true, read_at: new Date() },
    { where: { user_id: userId, is_read: false } }
  );

  return apiResponse(res, 200, 'All notifications marked as read');
});

/**
 * Send notification (admin)
 */
const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, body, type, data } = req.body;

  if (!userId || !title || !body) {
    return apiResponse(res, 400, 'userId, title, and body are required');
  }

  const notification = await Notification.create({
    id: generateId(),
    user_id: userId,
    title,
    body,
    type: type || 'system',
    reference_type: data?.reference_type || null,
    reference_id: data?.reference_id || null,
    is_read: false,
  });

  // Send real-time notification via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }

  // Send push notification via FCM
  try {
    await firebaseService.sendToUser(userId, { title, body, data });
  } catch (error) {
    console.warn('FCM push notification failed:', error.message);
  }

  return apiResponse(res, 201, 'Notification sent', notification);
});

/**
 * Register FCM token for push notifications
 */
const registerFCMToken = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { fcm_token } = req.body;

  if (!fcm_token) {
    return apiResponse(res, 400, 'FCM token is required');
  }

  // Store token on user record (or a separate tokens table)
  await User.update(
    { fcm_token },
    { where: { id: userId } }
  );

  return apiResponse(res, 200, 'FCM token registered');
});

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  sendNotification,
  registerFCMToken,
};
