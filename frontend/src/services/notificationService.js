/**
 * Notification Service
 * Handles notification API calls and FCM token registration
 */

import api from './api';

/**
 * Get user notifications
 * @param {object} params - { page, limit, unread_only }
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

/**
 * Mark a notification as read
 * @param {string} notificationId
 */
export const markNotificationRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};

/**
 * Send notification (admin)
 * @param {object} data - { userId, title, body, type, data }
 */
export const sendNotification = async (data) => {
  const response = await api.post('/notifications/send', data);
  return response.data;
};

/**
 * Register FCM token for push notifications
 * @param {string} token - FCM token
 */
export const registerFCMToken = async (token) => {
  const response = await api.post('/notifications/fcm-token', { fcm_token: token });
  return response.data;
};

/**
 * Request notification permission and get FCM token
 * @returns {string|null} FCM token or null if denied
 */
export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return null;
    }

    // FCM token would be obtained via Firebase messaging
    // For now, we return a placeholder indicating permission was granted
    return 'permission_granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  sendNotification,
  registerFCMToken,
  requestNotificationPermission,
};
