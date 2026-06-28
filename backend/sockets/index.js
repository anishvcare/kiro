/**
 * Socket.IO Setup and Namespace Configuration
 * Main entry point for real-time features
 */

const { verifyAccessToken } = require('../services/tokenService');
const chatSocket = require('./chatSocket');
const locationSocket = require('./locationSocket');
const notificationSocket = require('./notificationSocket');

/**
 * Initialize Socket.IO with authentication and namespaces
 * @param {import('socket.io').Server} io - Socket.IO server instance
 */
const initializeSockets = (io) => {
  // Authentication middleware for all connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      if (!decoded) {
        return next(new Error('Invalid or expired token'));
      }

      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`User connected: ${userId} (socket: ${socket.id})`);

    // Join user's personal room for notifications
    socket.join(`user:${userId}`);

    // Register chat event handlers
    chatSocket(io, socket);

    // Register location event handlers
    locationSocket(io, socket);

    // Register notification event handlers
    notificationSocket(io, socket);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${userId} (reason: ${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error.message);
    });
  });

  return io;
};

module.exports = initializeSockets;
