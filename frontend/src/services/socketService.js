/**
 * Socket.IO Client Service
 * Manages real-time connections and event handlers
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket = null;

/**
 * Connect to Socket.IO server
 * @param {string} token - JWT access token
 * @returns {import('socket.io-client').Socket}
 */
export const connect = (token) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  return socket;
};

/**
 * Disconnect from Socket.IO server
 */
export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Get the current socket instance
 * @returns {import('socket.io-client').Socket|null}
 */
export const getSocket = () => socket;

/**
 * Join a chat room
 * @param {string} chatId
 */
export const joinChat = (chatId) => {
  if (socket) {
    socket.emit('chat:join', { chatId });
  }
};

/**
 * Leave a chat room
 * @param {string} chatId
 */
export const leaveChat = (chatId) => {
  if (socket) {
    socket.emit('chat:leave', { chatId });
  }
};

/**
 * Send a chat message
 * @param {object} data - { chatId, content, messageType, fileUrl }
 */
export const sendMessage = (data) => {
  if (socket) {
    socket.emit('chat:sendMessage', data);
  }
};

/**
 * Send typing indicator
 * @param {string} chatId
 * @param {boolean} isTyping
 */
export const sendTyping = (chatId, isTyping) => {
  if (socket) {
    socket.emit('chat:typing', { chatId, isTyping });
  }
};

/**
 * Mark messages as seen
 * @param {string} chatId
 */
export const markMessagesSeen = (chatId) => {
  if (socket) {
    socket.emit('chat:markSeen', { chatId });
  }
};

/**
 * Get chat history
 * @param {string} chatId
 * @param {number} page
 */
export const getChatHistory = (chatId, page = 1) => {
  if (socket) {
    socket.emit('chat:getHistory', { chatId, page });
  }
};

/**
 * Subscribe to delivery location updates
 * @param {string} assignmentId
 */
export const subscribeToDelivery = (assignmentId) => {
  if (socket) {
    socket.emit('location:subscribe', { assignmentId });
  }
};

/**
 * Unsubscribe from delivery location updates
 * @param {string} assignmentId
 */
export const unsubscribeFromDelivery = (assignmentId) => {
  if (socket) {
    socket.emit('location:unsubscribe', { assignmentId });
  }
};

/**
 * Update delivery boy location
 * @param {object} data - { assignmentId, latitude, longitude, accuracy, speed, heading }
 */
export const updateLocation = (data) => {
  if (socket) {
    socket.emit('location:update', data);
  }
};

/**
 * Stop location tracking
 * @param {string} assignmentId
 */
export const stopTracking = (assignmentId) => {
  if (socket) {
    socket.emit('location:stopTracking', { assignmentId });
  }
};

/**
 * Get notification count
 */
export const getNotificationCount = () => {
  if (socket) {
    socket.emit('notification:getCount');
  }
};

/**
 * Mark notification as read via socket
 * @param {string} notificationId
 */
export const markNotificationRead = (notificationId) => {
  if (socket) {
    socket.emit('notification:markRead', { notificationId });
  }
};

/**
 * Mark all notifications as read via socket
 */
export const markAllNotificationsRead = () => {
  if (socket) {
    socket.emit('notification:markAllRead');
  }
};

export default {
  connect,
  disconnect,
  getSocket,
  joinChat,
  leaveChat,
  sendMessage,
  sendTyping,
  markMessagesSeen,
  getChatHistory,
  subscribeToDelivery,
  unsubscribeFromDelivery,
  updateLocation,
  stopTracking,
  getNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
};
