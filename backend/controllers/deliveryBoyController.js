/**
 * Delivery Boy Controller
 * Handles delivery boy operations: online/offline toggle, accept/reject,
 * step-by-step delivery flow, cash collection, proof upload, OTP verification.
 */

const {
  DeliveryAssignment,
  DeliveryBoy,
  CustomerRequest,
  CashCollection,
  User,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');
const deliveryService = require('../services/deliveryService');
const otpService = require('../services/otpService');

/**
 * Set online/offline status
 * PUT /api/delivery/boy/status
 */
const setOnlineStatus = asyncHandler(async (req, res) => {
  const { is_available } = req.body;

  if (typeof is_available !== 'boolean') {
    return apiResponse(res, 400, 'is_available must be a boolean');
  }

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  boy.is_available = is_available;
  await boy.save();

  return apiResponse(res, 200, `Status updated to ${is_available ? 'online' : 'offline'}`, {
    is_available: boy.is_available,
  });
});

/**
 * Get assigned deliveries for the delivery boy
 * GET /api/delivery/boy/assigned
 */
const getAssignedDeliveries = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  const assignments = await DeliveryAssignment.findAll({
    where: {
      delivery_boy_id: boy.id,
      status: { [Op.notIn]: ['delivered', 'failed', 'returned'] },
    },
    order: [['created_at', 'DESC']],
  });

  return apiResponse(res, 200, 'Assigned deliveries retrieved', { assignments });
});

/**
 * Accept a delivery assignment
 * PUT /api/delivery/boy/accept/:assignmentId
 */
const acceptDelivery = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  const assignment = await DeliveryAssignment.findByPk(assignmentId);
  if (!assignment) {
    return apiResponse(res, 404, 'Assignment not found');
  }

  if (assignment.delivery_boy_id !== boy.id) {
    return apiResponse(res, 403, 'Not authorized to accept this delivery');
  }

  if (assignment.status !== 'assigned' && assignment.status !== 'pending') {
    return apiResponse(res, 400, 'Delivery cannot be accepted in current state');
  }

  assignment.status = 'assigned'; // Keep as assigned (accepted state)
  await assignment.save();

  return apiResponse(res, 200, 'Delivery accepted', { assignment });
});

/**
 * Reject a delivery assignment
 * PUT /api/delivery/boy/reject/:assignmentId
 */
const rejectDelivery = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { reason } = req.body;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  const assignment = await DeliveryAssignment.findByPk(assignmentId);
  if (!assignment) {
    return apiResponse(res, 404, 'Assignment not found');
  }

  if (assignment.delivery_boy_id !== boy.id) {
    return apiResponse(res, 403, 'Not authorized to reject this delivery');
  }

  assignment.status = 'pending';
  assignment.delivery_boy_id = null;
  assignment.notes = `Rejected by delivery boy. Reason: ${reason || 'Not specified'}`;
  await assignment.save();

  // Mark delivery boy as available again
  boy.is_available = true;
  await boy.save();

  return apiResponse(res, 200, 'Delivery rejected', { assignment });
});

/**
 * Mark reached shop
 * PUT /api/delivery/boy/reached-shop/:assignmentId
 */
const markReachedShop = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  try {
    const assignment = await deliveryService.updateDeliveryStatus(assignmentId, 'reached_shop', boy.id);
    return apiResponse(res, 200, 'Marked as reached shop', { assignment });
  } catch (error) {
    return apiResponse(res, 400, error.message);
  }
});

/**
 * Mark picked up from shop
 * PUT /api/delivery/boy/picked-up/:assignmentId
 */
const markPickedUp = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  try {
    const assignment = await deliveryService.updateDeliveryStatus(assignmentId, 'picked_up', boy.id);
    return apiResponse(res, 200, 'Marked as picked up', { assignment });
  } catch (error) {
    return apiResponse(res, 400, error.message);
  }
});

/**
 * Mark out for delivery
 * PUT /api/delivery/boy/out-for-delivery/:assignmentId
 */
const markOutForDelivery = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  try {
    const assignment = await deliveryService.updateDeliveryStatus(assignmentId, 'out_for_delivery', boy.id);
    return apiResponse(res, 200, 'Marked as out for delivery', { assignment });
  } catch (error) {
    return apiResponse(res, 400, error.message);
  }
});

/**
 * Mark reached customer
 * PUT /api/delivery/boy/reached-customer/:assignmentId
 */
const markReachedCustomer = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  try {
    const assignment = await deliveryService.updateDeliveryStatus(assignmentId, 'reached_customer', boy.id);

    // Generate OTP for delivery verification
    const otp = otpService.createDeliveryOTP(assignmentId, 'customer');

    return apiResponse(res, 200, 'Marked as reached customer. OTP generated for verification.', {
      assignment,
      otp_generated: true,
      otp, // In production, send this to customer via SMS/notification
    });
  } catch (error) {
    return apiResponse(res, 400, error.message);
  }
});

/**
 * Mark as delivered
 * PUT /api/delivery/boy/delivered/:assignmentId
 */
const markDelivered = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  try {
    const assignment = await deliveryService.updateDeliveryStatus(assignmentId, 'delivered', boy.id);

    // Mark delivery boy as available
    boy.is_available = true;
    boy.total_deliveries = (boy.total_deliveries || 0) + 1;
    await boy.save();

    return apiResponse(res, 200, 'Delivery completed', { assignment });
  } catch (error) {
    return apiResponse(res, 400, error.message);
  }
});

/**
 * Submit cash collection for COD orders
 * POST /api/delivery/boy/cash-collection
 */
const submitCashCollection = asyncHandler(async (req, res) => {
  const { assignment_id, amount } = req.body;

  if (!assignment_id || !amount) {
    return apiResponse(res, 400, 'Assignment ID and amount are required');
  }

  if (parseFloat(amount) <= 0) {
    return apiResponse(res, 400, 'Amount must be greater than zero');
  }

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  const collection = await CashCollection.create({
    id: generateId(),
    delivery_assignment_id: assignment_id,
    delivery_boy_id: boy.id,
    amount: parseFloat(amount),
    collected_at: new Date(),
    settled: false,
  });

  return apiResponse(res, 201, 'Cash collection recorded', { collection });
});

/**
 * Upload delivery proof photo
 * POST /api/delivery/boy/proof/:assignmentId
 */
const uploadDeliveryProof = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  // Handle file upload (base64 or URL)
  const proofUrl = req.body.proof_url || (req.file ? `/uploads/proofs/${req.file.filename}` : null);

  if (!proofUrl) {
    return apiResponse(res, 400, 'Proof photo is required');
  }

  try {
    const assignment = await deliveryService.saveDeliveryProof(assignmentId, proofUrl);
    return apiResponse(res, 200, 'Delivery proof uploaded', { assignment });
  } catch (error) {
    return apiResponse(res, 400, error.message);
  }
});

/**
 * Verify OTP for delivery confirmation
 * POST /api/delivery/boy/verify-otp/:assignmentId
 */
const verifyOTP = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { otp } = req.body;

  if (!otp) {
    return apiResponse(res, 400, 'OTP is required');
  }

  const result = otpService.validateDeliveryOTP(assignmentId, otp);

  if (!result.valid) {
    return apiResponse(res, 400, result.message);
  }

  return apiResponse(res, 200, result.message, { verified: true });
});

/**
 * Get daily deliveries count/stats
 * GET /api/delivery/boy/daily-deliveries
 */
const getDailyDeliveries = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayDeliveries = await DeliveryAssignment.findAll({
    where: {
      delivery_boy_id: boy.id,
      status: 'delivered',
      actual_delivery_time: { [Op.gte]: todayStart },
    },
    order: [['actual_delivery_time', 'DESC']],
  });

  const todayCash = await CashCollection.sum('amount', {
    where: {
      delivery_boy_id: boy.id,
      collected_at: { [Op.gte]: todayStart },
    },
  }) || 0;

  return apiResponse(res, 200, 'Daily deliveries retrieved', {
    deliveries: todayDeliveries,
    stats: {
      count: todayDeliveries.length,
      cash_collected: parseFloat(todayCash),
    },
  });
});

/**
 * Get earnings summary
 * GET /api/delivery/boy/earnings
 */
const getEarnings = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');
  const { period = 'today' } = req.query;

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  let startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  }

  const deliveryCount = await DeliveryAssignment.count({
    where: {
      delivery_boy_id: boy.id,
      status: 'delivered',
      actual_delivery_time: { [Op.gte]: startDate },
    },
  });

  const cashCollected = await CashCollection.sum('amount', {
    where: {
      delivery_boy_id: boy.id,
      collected_at: { [Op.gte]: startDate },
    },
  }) || 0;

  // Estimated earnings (commission per delivery)
  const earningsPerDelivery = 30; // Configurable
  const estimatedEarnings = deliveryCount * earningsPerDelivery;

  return apiResponse(res, 200, 'Earnings retrieved', {
    earnings: {
      period,
      delivery_count: deliveryCount,
      cash_collected: parseFloat(cashCollected),
      estimated_earnings: estimatedEarnings,
      per_delivery: earningsPerDelivery,
    },
  });
});

/**
 * Get delivery history
 * GET /api/delivery/boy/history
 */
const getDeliveryHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const boy = await DeliveryBoy.findOne({ where: { user_id: req.user.id } });
  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy profile not found');
  }

  const { count, rows: deliveries } = await DeliveryAssignment.findAndCountAll({
    where: { delivery_boy_id: boy.id },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Delivery history retrieved', {
    deliveries,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get tracking info (OTP + pickup/dropoff coords) for a delivery assignment.
 * Accessible by customer (to view OTP & destination) as well as agent/boy.
 * GET /api/delivery/track-info/:assignmentId
 */
const getTrackInfo = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const assignment = await DeliveryAssignment.findByPk(assignmentId);
  if (!assignment) {
    return apiResponse(res, 404, 'Delivery assignment not found');
  }

  // Provide the OTP so the customer can read it out to the delivery boy.
  const otp = otpService.getActiveOTP(assignmentId);

  return apiResponse(res, 200, 'Track info retrieved', {
    status: assignment.status,
    otp,
    pickup: {
      address: assignment.pickup_address,
      latitude: assignment.pickup_latitude,
      longitude: assignment.pickup_longitude,
    },
    dropoff: {
      address: assignment.delivery_address,
      latitude: assignment.delivery_latitude,
      longitude: assignment.delivery_longitude,
    },
  });
});

module.exports = {
  setOnlineStatus,
  getAssignedDeliveries,
  acceptDelivery,
  rejectDelivery,
  markReachedShop,
  markPickedUp,
  markOutForDelivery,
  markReachedCustomer,
  markDelivered,
  submitCashCollection,
  uploadDeliveryProof,
  verifyOTP,
  getTrackInfo,
  getDailyDeliveries,
  getEarnings,
  getDeliveryHistory,
};
