/**
 * Firebase Cloud Messaging Service
 * Handles push notification delivery via FCM
 */

const { User } = require('../models');

// Firebase Admin SDK initialization
let admin = null;
let messaging = null;

try {
  admin = require('firebase-admin');

  // Initialize only if not already initialized
  if (admin && admin.apps && !admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      messaging = admin.messaging();
      console.log('Firebase Admin SDK initialized successfully');
    } else {
      console.warn('Firebase service account not configured. Push notifications disabled.');
    }
  } else if (admin && admin.apps && admin.apps.length) {
    messaging = admin.messaging();
  }
} catch (error) {
  console.warn('Firebase Admin SDK not available:', error.message);
}

/**
 * Send push notification to a specific user
 * @param {string} userId - Target user ID
 * @param {object} notification - { title, body, data }
 */
const sendToUser = async (userId, { title, body, data = {} }) => {
  if (!messaging) {
    console.warn('FCM not configured, skipping push notification');
    return null;
  }

  try {
    const user = await User.findByPk(userId, { attributes: ['id', 'fcm_token'] });
    if (!user || !user.fcm_token) {
      return null;
    }

    const message = {
      token: user.fcm_token,
      notification: {
        title,
        body,
      },
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key] || '');
        return acc;
      }, {}),
      webpush: {
        notification: {
          title,
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
        },
      },
    };

    const result = await messaging.send(message);
    return result;
  } catch (error) {
    // Handle invalid token
    if (error.code === 'messaging/registration-token-not-registered') {
      await User.update({ fcm_token: null }, { where: { id: userId } });
    }
    console.error('FCM send error:', error.message);
    throw error;
  }
};

/**
 * Send push notification to multiple users
 * @param {string[]} userIds - Array of user IDs
 * @param {object} notification - { title, body, data }
 */
const sendToMultipleUsers = async (userIds, { title, body, data = {} }) => {
  if (!messaging) {
    console.warn('FCM not configured, skipping push notifications');
    return [];
  }

  const results = await Promise.allSettled(
    userIds.map((userId) => sendToUser(userId, { title, body, data }))
  );

  return results;
};

/**
 * Send notification to a topic
 * @param {string} topic - Topic name
 * @param {object} notification - { title, body, data }
 */
const sendToTopic = async (topic, { title, body, data = {} }) => {
  if (!messaging) {
    console.warn('FCM not configured, skipping topic notification');
    return null;
  }

  try {
    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key] || '');
        return acc;
      }, {}),
    };

    const result = await messaging.send(message);
    return result;
  } catch (error) {
    console.error('FCM topic send error:', error.message);
    throw error;
  }
};

module.exports = {
  sendToUser,
  sendToMultipleUsers,
  sendToTopic,
};
