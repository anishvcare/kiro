/**
 * Delivery Service - Assignment logic, OTP, and proof verification
 */

const {
  DeliveryAssignment,
  DeliveryBoy,
  DeliveryAgent,
  CustomerRequest,
  CashCollection,
  User,
  Shop,
  Quotation,
  PaymentTransaction,
  sequelize,
} = require('../models');
const { generateId } = require('../utils/helpers');
const { validateStatusTransition } = require('./requestService');
const otpService = require('./otpService');

/**
 * Get confirmed requests that are ready for delivery assignment
 * Status: 'Customer Accepted Quote' or 'Delivery Agent Notified'
 */
const getConfirmedRequests = async (agentId) => {
  const { Op } = require('sequelize');

  const requests = await CustomerRequest.findAll({
    where: {
      status: {
        [Op.in]: ['Customer Accepted Quote', 'Delivery Agent Notified'],
      },
    },
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name', 'address', 'latitude', 'longitude'] },
    ],
    order: [['updated_at', 'DESC']],
  });

  return requests;
};

/**
 * Assign a delivery boy to a request
 */
const assignDeliveryBoy = async (agentId, requestId, deliveryBoyId, transactionId) => {
  const t = await sequelize.transaction();

  try {
    // Get the request
    const request = await CustomerRequest.findByPk(requestId);
    if (!request) {
      throw new Error('Request not found');
    }

    // Validate status transition
    const validation = validateStatusTransition(request.status, 'Delivery Boy Assigned');
    if (!validation.valid) {
      // If already at Delivery Agent Notified, transition to assigned
      if (request.status !== 'Customer Accepted Quote' && request.status !== 'Delivery Agent Notified') {
        throw new Error(validation.message);
      }
    }

    // Verify delivery boy exists and is available
    const deliveryBoy = await DeliveryBoy.findByPk(deliveryBoyId);
    if (!deliveryBoy) {
      throw new Error('Delivery boy not found');
    }
    if (!deliveryBoy.is_available || !deliveryBoy.is_active) {
      throw new Error('Delivery boy is not available');
    }

    // Create delivery assignment
    const assignment = await DeliveryAssignment.create({
      id: generateId(),
      transaction_id: transactionId || generateId(),
      delivery_boy_id: deliveryBoyId,
      agent_id: agentId,
      status: 'assigned',
      pickup_address: request.delivery_address || 'Shop pickup',
      delivery_address: request.delivery_address || 'Customer address',
      notes: `Assigned for request ${requestId}`,
    }, { transaction: t });

    // Update request status
    if (request.status === 'Customer Accepted Quote') {
      request.status = 'Delivery Agent Notified';
      await request.save({ transaction: t });
    }
    request.status = 'Delivery Boy Assigned';
    await request.save({ transaction: t });

    // Mark delivery boy as not available
    deliveryBoy.is_available = false;
    await deliveryBoy.save({ transaction: t });

    await t.commit();

    return assignment;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Reassign a delivery to a different delivery boy
 */
const reassignDeliveryBoy = async (agentId, assignmentId, newDeliveryBoyId) => {
  const t = await sequelize.transaction();

  try {
    const assignment = await DeliveryAssignment.findByPk(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (['delivered', 'failed'].includes(assignment.status)) {
      throw new Error('Cannot reassign a completed or failed delivery');
    }

    // Release old delivery boy
    if (assignment.delivery_boy_id) {
      const oldBoy = await DeliveryBoy.findByPk(assignment.delivery_boy_id);
      if (oldBoy) {
        oldBoy.is_available = true;
        await oldBoy.save({ transaction: t });
      }
    }

    // Verify new delivery boy
    const newBoy = await DeliveryBoy.findByPk(newDeliveryBoyId);
    if (!newBoy) {
      throw new Error('New delivery boy not found');
    }
    if (!newBoy.is_available || !newBoy.is_active) {
      throw new Error('New delivery boy is not available');
    }

    // Update assignment
    assignment.delivery_boy_id = newDeliveryBoyId;
    assignment.status = 'assigned';
    assignment.notes = `Reassigned by agent. Previous boy released.`;
    await assignment.save({ transaction: t });

    // Mark new delivery boy as unavailable
    newBoy.is_available = false;
    await newBoy.save({ transaction: t });

    await t.commit();

    return assignment;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

/**
 * Update delivery status with step progression
 */
const updateDeliveryStatus = async (assignmentId, newStatus, deliveryBoyId) => {
  const statusMap = {
    'accepted': 'assigned',
    'reached_shop': 'assigned',
    'picked_up': 'picked_up',
    'out_for_delivery': 'picked_up',
    'reached_customer': 'in_transit',
    'delivered': 'delivered',
  };

  const assignment = await DeliveryAssignment.findByPk(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.delivery_boy_id !== deliveryBoyId) {
    throw new Error('Not authorized to update this delivery');
  }

  assignment.status = statusMap[newStatus] || newStatus;

  if (newStatus === 'delivered') {
    assignment.actual_delivery_time = new Date();
  }

  await assignment.save();

  return assignment;
};

/**
 * Generate delivery OTP for customer verification
 */
const generateDeliveryOTP = (assignmentId, customerId) => {
  return otpService.createDeliveryOTP(assignmentId, customerId);
};

/**
 * Verify delivery OTP
 */
const verifyDeliveryOTP = (assignmentId, otp) => {
  return otpService.validateDeliveryOTP(assignmentId, otp);
};

/**
 * Save delivery proof URL
 */
const saveDeliveryProof = async (assignmentId, proofUrl) => {
  const assignment = await DeliveryAssignment.findByPk(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  assignment.delivery_proof_url = proofUrl;
  await assignment.save();

  return assignment;
};

/**
 * Get delivery boy performance stats
 */
const getDeliveryBoyPerformance = async (deliveryBoyId) => {
  const { Op } = require('sequelize');

  const totalDeliveries = await DeliveryAssignment.count({
    where: { delivery_boy_id: deliveryBoyId, status: 'delivered' },
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayDeliveries = await DeliveryAssignment.count({
    where: {
      delivery_boy_id: deliveryBoyId,
      status: 'delivered',
      actual_delivery_time: { [Op.gte]: todayStart },
    },
  });

  const totalCashCollected = await CashCollection.sum('amount', {
    where: { delivery_boy_id: deliveryBoyId },
  }) || 0;

  const activeDeliveries = await DeliveryAssignment.count({
    where: {
      delivery_boy_id: deliveryBoyId,
      status: { [Op.notIn]: ['delivered', 'failed', 'returned'] },
    },
  });

  return {
    totalDeliveries,
    todayDeliveries,
    totalCashCollected: parseFloat(totalCashCollected),
    activeDeliveries,
  };
};

module.exports = {
  getConfirmedRequests,
  assignDeliveryBoy,
  reassignDeliveryBoy,
  updateDeliveryStatus,
  generateDeliveryOTP,
  verifyDeliveryOTP,
  saveDeliveryProof,
  getDeliveryBoyPerformance,
};
