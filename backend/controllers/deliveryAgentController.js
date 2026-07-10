/**
 * Delivery Agent Controller
 * Handles delivery agent dashboard operations: viewing requests,
 * assigning/reassigning delivery boys, tracking, COD verification, and reports.
 */

const {
  DeliveryAssignment,
  DeliveryBoy,
  DeliveryAgent,
  CustomerRequest,
  CashCollection,
  SettlementTransaction,
  Quotation,
  User,
  Shop,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');
const deliveryService = require('../services/deliveryService');
const { validateStatusTransition } = require('../services/requestService');
const { notifyStatusChange } = require('../services/notificationService');

/**
 * Get confirmed requests ready for delivery assignment
 * GET /api/delivery/agent/confirmed-requests
 */
const getConfirmedRequests = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');

  const requests = await CustomerRequest.findAll({
    where: {
      status: {
        [Op.in]: ['Customer Accepted Quote', 'Delivery Agent Notified'],
      },
    },
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name', 'address', 'latitude', 'longitude', 'phone'] },
    ],
    order: [['updated_at', 'DESC']],
  });

  return apiResponse(res, 200, 'Confirmed requests retrieved', { requests });
});

/**
 * Assign a delivery boy to a request
 * POST /api/delivery/agent/assign
 */
const assignDeliveryBoy = asyncHandler(async (req, res) => {
  const { request_id, delivery_boy_id, transaction_id } = req.body;

  if (!request_id || !delivery_boy_id) {
    return apiResponse(res, 400, 'Request ID and delivery boy ID are required');
  }

  // Find agent profile
  const agent = await DeliveryAgent.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return apiResponse(res, 403, 'Delivery agent profile not found');
  }

  try {
    const assignment = await deliveryService.assignDeliveryBoy(
      agent.id,
      request_id,
      delivery_boy_id,
      transaction_id
    );

    return apiResponse(res, 201, 'Delivery boy assigned successfully', { assignment });
  } catch (error) {
    return apiResponse(res, 400, error.message);
  }
});

/**
 * Reassign a delivery to a different delivery boy
 * PUT /api/delivery/agent/reassign
 */
const reassignDeliveryBoy = asyncHandler(async (req, res) => {
  const { assignment_id, new_delivery_boy_id } = req.body;

  if (!assignment_id || !new_delivery_boy_id) {
    return apiResponse(res, 400, 'Assignment ID and new delivery boy ID are required');
  }

  const agent = await DeliveryAgent.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return apiResponse(res, 403, 'Delivery agent profile not found');
  }

  try {
    const assignment = await deliveryService.reassignDeliveryBoy(
      agent.id,
      assignment_id,
      new_delivery_boy_id
    );

    return apiResponse(res, 200, 'Delivery reassigned successfully', { assignment });
  } catch (error) {
    return apiResponse(res, 400, error.message);
  }
});

/**
 * Get active deliveries managed by this agent
 * GET /api/delivery/agent/active-deliveries
 */
const getActiveDeliveries = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');

  const agent = await DeliveryAgent.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return apiResponse(res, 403, 'Delivery agent profile not found');
  }

  const assignments = await DeliveryAssignment.findAll({
    where: {
      agent_id: agent.id,
      status: { [Op.notIn]: ['delivered', 'failed', 'returned'] },
    },
    include: [
      {
        model: DeliveryBoy,
        as: 'deliveryBoy',
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'phone'] }],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  return apiResponse(res, 200, 'Active deliveries retrieved', { assignments });
});

/**
 * Get list of delivery boys under this agent
 * GET /api/delivery/agent/delivery-boys
 */
const getDeliveryBoyList = asyncHandler(async (req, res) => {
  const agent = await DeliveryAgent.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return apiResponse(res, 403, 'Delivery agent profile not found');
  }

  const deliveryBoys = await DeliveryBoy.findAll({
    where: { agent_id: agent.id },
    include: [
      { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone', 'email'] },
    ],
    order: [['is_available', 'DESC'], ['rating', 'DESC']],
  });

  return apiResponse(res, 200, 'Delivery boys retrieved', { deliveryBoys });
});

/**
 * Get performance metrics for a delivery boy
 * GET /api/delivery/agent/performance/:deliveryBoyId
 */
const getDeliveryBoyPerformance = asyncHandler(async (req, res) => {
  const { deliveryBoyId } = req.params;

  const performance = await deliveryService.getDeliveryBoyPerformance(deliveryBoyId);
  const boy = await DeliveryBoy.findByPk(deliveryBoyId, {
    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'phone'] }],
  });

  if (!boy) {
    return apiResponse(res, 404, 'Delivery boy not found');
  }

  return apiResponse(res, 200, 'Performance retrieved', {
    deliveryBoy: boy,
    performance,
  });
});

/**
 * Verify cash collection from delivery boy
 * PUT /api/delivery/agent/verify-cash/:collectionId
 */
const verifyCashCollection = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  const { verified, notes } = req.body;

  const collection = await CashCollection.findByPk(collectionId);
  if (!collection) {
    return apiResponse(res, 404, 'Cash collection not found');
  }

  if (collection.settled) {
    return apiResponse(res, 400, 'Collection already settled');
  }

  if (!verified) {
    await collection.destroy();
    return apiResponse(res, 200, 'Cash collection rejected');
  }

  const settlement = await SettlementTransaction.create({
    id: generateId(),
    from_type: 'delivery_boy',
    from_id: collection.delivery_boy_id,
    to_type: 'platform',
    to_id: req.user.id,
    amount: collection.amount,
    reference_type: 'cash_collection',
    reference_id: collection.id,
    status: 'pending',
    notes: notes || `Verified cash collection ${collection.id}`,
  });

  return apiResponse(res, 200, 'Cash collection verified', { settlement, collection });
});

/**
 * Get cash collection report
 * GET /api/delivery/agent/cash-report
 */
const getCashReport = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');
  const { start_date, end_date, settled } = req.query;

  const agent = await DeliveryAgent.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return apiResponse(res, 403, 'Delivery agent profile not found');
  }

  const where = {};

  if (start_date && end_date) {
    where.collected_at = {
      [Op.between]: [new Date(start_date), new Date(end_date)],
    };
  }

  if (settled !== undefined) {
    where.settled = settled === 'true';
  }

  const collections = await CashCollection.findAll({
    where,
    include: [
      {
        model: DeliveryBoy,
        as: 'deliveryBoy',
        where: { agent_id: agent.id },
        include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
      },
    ],
    order: [['collected_at', 'DESC']],
  });

  const totalCollected = collections.reduce((sum, c) => sum + parseFloat(c.amount), 0);
  const totalSettled = collections.filter((c) => c.settled).reduce((sum, c) => sum + parseFloat(c.amount), 0);
  const totalPending = totalCollected - totalSettled;

  return apiResponse(res, 200, 'Cash report retrieved', {
    collections,
    summary: {
      total_collected: totalCollected,
      total_settled: totalSettled,
      total_pending: totalPending,
      count: collections.length,
    },
  });
});

/**
 * Get settlement report for agent
 * GET /api/delivery/agent/settlement-report
 */
const getSettlementReport = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');
  const { start_date, end_date } = req.query;

  const where = {
    to_id: req.user.id,
    to_type: 'platform',
  };

  if (start_date && end_date) {
    where.created_at = {
      [Op.between]: [new Date(start_date), new Date(end_date)],
    };
  }

  const settlements = await SettlementTransaction.findAll({
    where,
    order: [['created_at', 'DESC']],
  });

  const totalAmount = settlements.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  const pendingCount = settlements.filter((s) => s.status === 'pending').length;
  const completedCount = settlements.filter((s) => s.status === 'completed').length;

  return apiResponse(res, 200, 'Settlement report retrieved', {
    settlements,
    summary: {
      total_amount: totalAmount,
      pending_count: pendingCount,
      completed_count: completedCount,
      total_count: settlements.length,
    },
  });
});

/**
 * List orders handled by this agent that are awaiting payment verification or
 * settlement to the shop (status Delivered or Payment Verified).
 * GET /api/delivery/agent/pending-settlements
 */
const getPendingSettlements = asyncHandler(async (req, res) => {
  const { Op } = require('sequelize');

  const agent = await DeliveryAgent.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return apiResponse(res, 403, 'Delivery agent profile not found');
  }

  // Requests this agent handled (via their assignments).
  const assignments = await DeliveryAssignment.findAll({
    where: { agent_id: agent.id, request_id: { [Op.ne]: null } },
    attributes: ['request_id'],
  });
  const requestIds = [...new Set(assignments.map((a) => a.request_id).filter(Boolean))];
  if (requestIds.length === 0) {
    return apiResponse(res, 200, 'Pending settlements retrieved', { requests: [] });
  }

  const requests = await CustomerRequest.findAll({
    where: {
      id: { [Op.in]: requestIds },
      status: { [Op.in]: ['Delivered', 'Payment Verified'] },
    },
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name', 'address', 'phone'] },
      {
        model: Quotation,
        as: 'quotations',
        attributes: ['id', 'total_amount', 'delivery_charge', 'final_amount', 'payment_method', 'status'],
      },
    ],
    order: [['updated_at', 'DESC']],
  });

  return apiResponse(res, 200, 'Pending settlements retrieved', { requests });
});

/**
 * Delivery agent verifies the payment for a delivered order.
 * PUT /api/delivery/agent/verify-payment/:requestId  -> 'Payment Verified'
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const agent = await DeliveryAgent.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return apiResponse(res, 403, 'Delivery agent profile not found');
  }

  const request = await CustomerRequest.findByPk(requestId);
  if (!request) {
    return apiResponse(res, 404, 'Request not found');
  }

  const validation = validateStatusTransition(request.status, 'Payment Verified');
  if (!validation.valid) {
    return apiResponse(res, 400, validation.message);
  }

  request.status = 'Payment Verified';
  await request.save();

  try { await notifyStatusChange(request, 'Payment Verified'); } catch (e) { console.error('notify (payment verified) failed:', e.message); }

  return apiResponse(res, 200, 'Payment verified', { request });
});

/**
 * Delivery agent settles the collected payment to the shop.
 * PUT /api/delivery/agent/settle-to-shop/:requestId  -> 'Payment Settled To Shop'
 */
const settleToShop = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const agent = await DeliveryAgent.findOne({ where: { user_id: req.user.id } });
  if (!agent) {
    return apiResponse(res, 403, 'Delivery agent profile not found');
  }

  const request = await CustomerRequest.findByPk(requestId, {
    include: [{ model: Quotation, as: 'quotations' }],
  });
  if (!request) {
    return apiResponse(res, 404, 'Request not found');
  }

  const validation = validateStatusTransition(request.status, 'Payment Settled To Shop');
  if (!validation.valid) {
    return apiResponse(res, 400, validation.message);
  }

  request.status = 'Payment Settled To Shop';
  await request.save();

  try { await notifyStatusChange(request, 'Payment Settled To Shop'); } catch (e) { console.error('notify (payment settled) failed:', e.message); }

  // Record the settlement to the shop (best-effort; never blocks the status update).
  try {
    const quote = (request.quotations || []).find((q) => q.status === 'accepted') || (request.quotations || [])[0];
    const amount = quote ? parseFloat(quote.total_amount || quote.final_amount || 0) : 0;
    await SettlementTransaction.create({
      id: generateId(),
      from_type: 'delivery_agent',
      from_id: agent.id,
      to_type: 'shop',
      to_id: request.shop_id,
      amount,
      reference_type: 'request',
      reference_id: request.id,
      status: 'completed',
      notes: `Settled to shop for request ${request.id}`,
    });
  } catch (e) {
    console.error('settleToShop settlement record failed:', e.message);
  }

  // Mark the cash collection(s) for this order's delivery as settled, so the
  // Cash Report status reflects the settled payment.
  try {
    const { Op } = require('sequelize');
    const assignments = await DeliveryAssignment.findAll({
      where: { request_id: request.id },
      attributes: ['id'],
    });
    const assignmentIds = assignments.map((a) => a.id);
    if (assignmentIds.length > 0) {
      await CashCollection.update(
        { settled: true, settled_at: new Date() },
        { where: { delivery_assignment_id: { [Op.in]: assignmentIds }, settled: false } }
      );
    }
  } catch (e) {
    console.error('settleToShop cash-collection update failed:', e.message);
  }

  return apiResponse(res, 200, 'Payment settled to shop', { request });
});

module.exports = {
  getConfirmedRequests,
  assignDeliveryBoy,
  reassignDeliveryBoy,
  getActiveDeliveries,
  getDeliveryBoyList,
  getDeliveryBoyPerformance,
  verifyCashCollection,
  getCashReport,
  getSettlementReport,
  getPendingSettlements,
  verifyPayment,
  settleToShop,
};
