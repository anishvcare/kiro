/**
 * Notification Socket Handler
 * Handles real-time notification delivery to connected clients
 */

const { Notification } = require('../models');
const { Op } = require('sequelize');

/**
 * Register notification socket event handlers
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
const notificationSocket = (io, socket) => {
  const userId = socket.user.id;

  /**
   * Get unread notification count on connection
   */
  socket.on('notification:getCount', async () => {
    try {
      const count = await Notification.count({
        where: { user_id: userId, is_read: false },
      });

      socket.emit('notification:count', { count });
    } catch (error) {
      console.error('Error getting notification count:', error.message);
    }
  });

  /**
   * Mark notification as read
   * @param {object} data - { notificationId }
   */
  socket.on('notification:markRead', async (data) => {
    try {
      const { notificationId } = data;
      if (!notificationId) return;

      await Notification.update(
        { is_read: true, read_at: new Date() },
        { where: { id: notificationId, user_id: userId } }
      );

      // Send updated count
      const count = await Notification.count({
        where: { user_id: userId, is_read: false },
      });

      socket.emit('notification:count', { count });
      socket.emit('notification:read', { notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
    }
  });

  /**
   * Mark all notifications as read
   */
  socket.on('notification:markAllRead', async () => {
    try {
      await Notification.update(
        { is_read: true, read_at: new Date() },
        { where: { user_id: userId, is_read: false } }
      );

      socket.emit('notification:count', { count: 0 });
      socket.emit('notification:allRead', {});
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
    }
  });
};

/**
 * Send a real-time notification to a user
 * @param {import('socket.io').Server} io
 * @param {string} userId
 * @param {object} notification
 */
const sendRealtimeNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};

module.exports = notificationSocket;
module.exports.sendRealtimeNotification = sendRealtimeNotification;
