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
const { validateStatusTransition, getStatusIndex } = require('./requestService');
const { notifyStatusChange } = require('./notificationService');
const otpService = require('./otpService');

// Maps the delivery boy's fine-grained step (short code) to the customer-facing
// long-form request status, so the customer's Status Timeline advances with
// each delivery step.
const DELIVERY_STEP_TO_REQUEST_STATUS = {
  accepted: 'Delivery Boy Accepted',
  reached_shop: 'Reached Shop',
  picked_up: 'Picked Up From Shop',
  out_for_delivery: 'Out For Delivery',
  reached_customer: 'Reached Customer',
  cash_collected: 'Cash Collected',
  delivered: 'Delivered',
};

// Advance the linked customer_request.status forward to match a delivery step.
// Never regresses an already-further status. Resolves the request via
// request_id, falling back to the payment transaction's quotation.
const syncRequestStatusForStep = async (assignment, step) => {
  const targetStatus = DELIVERY_STEP_TO_REQUEST_STATUS[step];
  if (!targetStatus) return;

  let requestId = assignment.request_id;
  if (!requestId && assignment.transaction_id) {
    const txn = await PaymentTransaction.findByPk(assignment.transaction_id);
    if (txn) {
      const quo = await Quotation.findByPk(txn.quotation_id);
      if (quo) requestId = quo.request_id;
    }
  }
  if (!requestId) return;

  const request = await CustomerRequest.findByPk(requestId);
  if (!request) return;

  // Only move forward through the timeline (index-based; earlier steps auto-complete).
  if (getStatusIndex(targetStatus) > getStatusIndex(request.status)) {
    request.status = targetStatus;
    await request.save();
    // In-app notifications for this delivery step (customer/shop/agent).
    try {
      await notifyStatusChange(request, targetStatus);
    } catch (e) {
      console.error('notify (delivery step) failed:', e.message);
    }
  }
};

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

    // Resolve the REAL payment transaction for this request (via its quotation).
    // Never invent a fake id - that violates the FK to payment_transactions.
    // If there is no payment yet (e.g. COD collected at delivery), leave it null.
    let resolvedTransactionId = transactionId || null;
    if (!resolvedTransactionId) {
      const quotation = await Quotation.findOne({
        where: { request_id: requestId },
        order: [['created_at', 'DESC']],
      });
      if (quotation) {
        const txn = await PaymentTransaction.findOne({
          where: { quotation_id: quotation.id },
          order: [['created_at', 'DESC']],
        });
        if (txn) resolvedTransactionId = txn.id;
      }
    }

    // Load the shop so pickup = shop location and delivery = customer location.
    const shop = await Shop.findByPk(request.shop_id);

    // Create delivery assignment
    const assignment = await DeliveryAssignment.create({
      id: generateId(),
      transaction_id: resolvedTransactionId,
      request_id: requestId,
      delivery_boy_id: deliveryBoyId,
      agent_id: agentId,
      status: 'assigned',
      delivery_step: 'assigned',
      pickup_address: (shop && shop.address) || 'Shop pickup',
      pickup_latitude: shop ? shop.latitude : null,
      pickup_longitude: shop ? shop.longitude : null,
      delivery_address: request.delivery_address || 'Customer address',
      delivery_latitude: request.delivery_latitude || null,
      delivery_longitude: request.delivery_longitude || null,
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

    // Notify customer + assigned delivery boy (after commit so the assignment
    // is resolvable by the notification service).
    try {
      await notifyStatusChange(request, 'Delivery Boy Assigned');
    } catch (e) {
      console.error('notify (delivery boy assigned) failed:', e.message);
    }

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
    'cash_collected': 'in_transit',
    'delivered': 'delivered',
  };

  const assignment = await DeliveryAssignment.findByPk(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }

  if (assignment.delivery_boy_id !== deliveryBoyId) {
    throw new Error('Not authorized to update this delivery');
  }

  // Coarse ENUM status (for downstream logic) + fine-grained step (for the UI).
  assignment.status = statusMap[newStatus] || newStatus;
  assignment.delivery_step = newStatus;

  if (newStatus === 'delivered') {
    assignment.actual_delivery_time = new Date();
  }

  await assignment.save();

  // Keep the customer-facing request status in sync so the customer's Status
  // Timeline advances with each delivery step (Reached Shop ... Delivered).
  try {
    await syncRequestStatusForStep(assignment, newStatus);
  } catch (err) {
    console.error('syncRequestStatusForStep failed:', err.message);
  }

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
