/**
 * Location Socket Handler
 * Handles live GPS location tracking for delivery boys
 */

const { LiveLocation, DeliveryAssignment } = require('../models');

/**
 * Register location socket event handlers
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
const locationSocket = (io, socket) => {
  const userId = socket.user.id;

  /**
   * Delivery boy broadcasts GPS location update
   * @param {object} data - { assignmentId, latitude, longitude, accuracy, speed, heading }
   */
  socket.on('location:update', async (data) => {
    try {
      const { assignmentId, latitude, longitude, accuracy, speed, heading } = data;

      if (!assignmentId || !latitude || !longitude) {
        socket.emit('location:error', { message: 'Assignment ID and coordinates are required' });
        return;
      }

      // Store location in database
      await LiveLocation.create({
        delivery_assignment_id: assignmentId,
        delivery_boy_id: userId,
        latitude,
        longitude,
        accuracy: accuracy || null,
        speed: speed || null,
        heading: heading || null,
        recorded_at: new Date(),
      });

      // Broadcast to all subscribers of this delivery
      io.to(`delivery:${assignmentId}`).emit('location:updated', {
        assignmentId,
        deliveryBoyId: userId,
        latitude,
        longitude,
        accuracy,
        speed,
        heading,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating location:', error.message);
      socket.emit('location:error', { message: 'Failed to update location' });
    }
  });

  /**
   * Customer/agent subscribes to delivery tracking
   * @param {object} data - { assignmentId }
   */
  socket.on('location:subscribe', async (data) => {
    try {
      const { assignmentId } = data;
      if (!assignmentId) return;

      socket.join(`delivery:${assignmentId}`);

      // Send the latest known location
      const lastLocation = await LiveLocation.findOne({
        where: { delivery_assignment_id: assignmentId },
        order: [['recorded_at', 'DESC']],
      });

      if (lastLocation) {
        socket.emit('location:current', {
          assignmentId,
          deliveryBoyId: lastLocation.delivery_boy_id,
          latitude: parseFloat(lastLocation.latitude),
          longitude: parseFloat(lastLocation.longitude),
          accuracy: lastLocation.accuracy ? parseFloat(lastLocation.accuracy) : null,
          speed: lastLocation.speed ? parseFloat(lastLocation.speed) : null,
          heading: lastLocation.heading ? parseFloat(lastLocation.heading) : null,
          timestamp: lastLocation.recorded_at,
        });
      }

      socket.emit('location:subscribed', { assignmentId });
    } catch (error) {
      socket.emit('location:error', { message: 'Failed to subscribe to tracking' });
    }
  });

  /**
   * Unsubscribe from delivery tracking
   * @param {object} data - { assignmentId }
   */
  socket.on('location:unsubscribe', (data) => {
    const { assignmentId } = data;
    if (assignmentId) {
      socket.leave(`delivery:${assignmentId}`);
      socket.emit('location:unsubscribed', { assignmentId });
    }
  });

  /**
   * Delivery boy stops tracking (delivery completed)
   * @param {object} data - { assignmentId }
   */
  socket.on('location:stopTracking', (data) => {
    const { assignmentId } = data;
    if (assignmentId) {
      // Notify all subscribers that tracking has stopped
      io.to(`delivery:${assignmentId}`).emit('location:trackingStopped', {
        assignmentId,
        stoppedAt: new Date().toISOString(),
      });
    }
  });
};

module.exports = locationSocket;
