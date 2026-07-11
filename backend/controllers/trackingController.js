/**
 * Tracking Controller
 * REST-based live location for delivery tracking (no websocket server needed):
 * the delivery boy POSTs their GPS position, and the customer/agent polls the
 * latest position via GET.
 */

const { LiveLocation, DeliveryBoy } = require('../models');
const { apiResponse, asyncHandler } = require('../utils/helpers');

/**
 * Save the delivery boy's current location for an assignment.
 * POST /api/tracking/:assignmentId/location
 * body: { latitude, longitude, accuracy, speed, heading }
 */
const postLocation = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { latitude, longitude, accuracy, speed, heading } = req.body;

  if (latitude == null || longitude == null) {
    return apiResponse(res, 400, 'latitude and longitude are required');
  }

  // Resolve the real delivery_boys.id for the FK (falls back to user id).
  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });

  await LiveLocation.create({
    delivery_assignment_id: assignmentId,
    delivery_boy_id: boy ? boy.id : req.user.id,
    latitude,
    longitude,
    accuracy: accuracy != null ? accuracy : null,
    speed: speed != null ? speed : null,
    heading: heading != null ? heading : null,
    recorded_at: new Date(),
  });

  return apiResponse(res, 201, 'Location updated');
});

/**
 * Get the latest known location for an assignment (for the customer's live map).
 * GET /api/tracking/:assignmentId/location
 */
const getLatestLocation = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const last = await LiveLocation.findOne({
    where: { delivery_assignment_id: assignmentId },
    order: [['recorded_at', 'DESC']],
  });

  if (!last) {
    return apiResponse(res, 200, 'No location yet', { location: null });
  }

  const ageMs = Date.now() - new Date(last.recorded_at).getTime();

  return apiResponse(res, 200, 'Latest location', {
    location: {
      latitude: parseFloat(last.latitude),
      longitude: parseFloat(last.longitude),
      accuracy: last.accuracy != null ? parseFloat(last.accuracy) : null,
      speed: last.speed != null ? parseFloat(last.speed) : null,
      heading: last.heading != null ? parseFloat(last.heading) : null,
      recorded_at: last.recorded_at,
      timestamp: last.recorded_at,
      // Considered "live" if updated within the last 60 seconds.
      is_live: ageMs < 60000,
    },
  });
});

module.exports = {
  postLocation,
  getLatestLocation,
};
