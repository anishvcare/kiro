/**
 * Notification Service
 * Creates in-app notifications for the right USER (customer, shop owner,
 * delivery agent, delivery boy) on each request/quotation/delivery/payment event.
 *
 * IMPORTANT: notifications are keyed by User.id. A request stores customer_id
 * (Customer.id) and shop_id (Shop.id) which are NOT User ids, so we resolve
 * them to the owning User before creating a notification.
 */

const {
  Notification,
  Customer,
  Shop,
  DeliveryAgent,
  DeliveryBoy,
  DeliveryAssignment,
} = require('../models');
const { generateId } = require('../utils/helpers');

/**
 * Create a notification for a user (no-op if userId is missing).
 */
const createNotification = async ({ userId, title, message, type = 'system', data = {} }) => {
  if (!userId) return null;
  try {
    const notification = await Notification.create({
      id: generateId(),
      user_id: userId,
      title,
      body: message,
      type,
      reference_type: data.request_id ? 'request' : data.quotation_id ? 'quotation' : data.chat_id ? 'chat' : null,
      reference_id: data.request_id || data.quotation_id || data.chat_id || null,
      is_read: false,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

// ---- Recipient resolvers (return a User.id or null) ----

const resolveCustomerUserId = async (request) => {
  if (!request || !request.customer_id) return null;
  const c = await Customer.findByPk(request.customer_id, { attributes: ['user_id'] });
  return c ? c.user_id : null;
};

const resolveShopOwnerUserId = async (request) => {
  if (!request || !request.shop_id) return null;
  const s = await Shop.findByPk(request.shop_id, { attributes: ['owner_id'] });
  return s ? s.owner_id : null;
};

// Resolve the delivery boy & agent User ids from the request's latest assignment.
const resolveDeliveryUserIds = async (request) => {
  if (!request || !request.id) return { boyUserId: null, agentUserId: null };
  const assignment = await DeliveryAssignment.findOne({
    where: { request_id: request.id },
    order: [['created_at', 'DESC']],
  });
  if (!assignment) return { boyUserId: null, agentUserId: null };

  let boyUserId = null;
  let agentUserId = null;
  if (assignment.delivery_boy_id) {
    const boy = await DeliveryBoy.findByPk(assignment.delivery_boy_id, { attributes: ['user_id'] });
    boyUserId = boy ? boy.user_id : null;
  }
  if (assignment.agent_id) {
    const agent = await DeliveryAgent.findByPk(assignment.agent_id, { attributes: ['user_id'] });
    agentUserId = agent ? agent.user_id : null;
  }
  return { boyUserId, agentUserId };
};

/**
 * Notify the relevant users when a request's status changes.
 * Covers the full lifecycle across all roles.
 */
const notifyStatusChange = async (request, newStatus, additionalData = {}) => {
  try {
    const data = { request_id: request.id, status: newStatus, ...additionalData };

    const notifyCustomer = async (title, message, type = 'delivery') => {
      const uid = await resolveCustomerUserId(request);
      await createNotification({ userId: uid, title, message, type, data });
    };
    const notifyShop = async (title, message, type = 'request') => {
      const uid = await resolveShopOwnerUserId(request);
      await createNotification({ userId: uid, title, message, type, data });
    };
    const notifyAgent = async (title, message, type = 'delivery') => {
      const { agentUserId } = await resolveDeliveryUserIds(request);
      await createNotification({ userId: agentUserId, title, message, type, data });
    };
    const notifyBoy = async (title, message, type = 'delivery') => {
      const { boyUserId } = await resolveDeliveryUserIds(request);
      await createNotification({ userId: boyUserId, title, message, type, data });
    };
    // Before a boy is assigned there is no assignment yet, so an order that's
    // ready to assign is broadcast to all delivery agents.
    const notifyAllAgents = async (title, message, type = 'delivery') => {
      const agents = await DeliveryAgent.findAll({ attributes: ['user_id'] });
      await Promise.all(
        agents.map((a) => (a.user_id
          ? createNotification({ userId: a.user_id, title, message, type, data })
          : null))
      );
    };

    switch (newStatus) {
      case 'Shop Received Request':
        await notifyCustomer('Request Received', 'Your request has been received by the shop.', 'request');
        break;
      case 'Shop Quotation Sent':
        await notifyCustomer('Quotation Received', 'The shop sent you a quotation. Please review and accept or reject.', 'quotation');
        break;
      case 'Customer Accepted Quote':
        await notifyShop('Quotation Accepted', 'The customer accepted your quotation.', 'quotation');
        await notifyAllAgents('New Order To Assign', 'A customer accepted a quote. Please assign a delivery boy.', 'delivery');
        break;
      case 'Customer Rejected Quote':
        await notifyShop('Quotation Rejected', 'The customer rejected your quotation.', 'quotation');
        break;
      case 'Delivery Agent Notified':
        await notifyAllAgents('New Order To Assign', 'A new order is ready to be assigned to a delivery boy.', 'delivery');
        break;
      case 'Delivery Boy Assigned':
        await notifyCustomer('Delivery Boy Assigned', 'A delivery boy has been assigned to your order.', 'delivery');
        await notifyBoy('New Delivery Assigned', 'You have a new delivery assignment.', 'delivery');
        break;
      case 'Delivery Boy Accepted':
        await notifyCustomer('Delivery Accepted', 'The delivery boy accepted your order.', 'delivery');
        break;
      case 'Reached Shop':
        await notifyCustomer('Reached Shop', 'The delivery boy has reached the shop.', 'delivery');
        break;
      case 'Picked Up From Shop':
        await notifyCustomer('Order Picked Up', 'Your order has been picked up from the shop.', 'delivery');
        await notifyShop('Order Picked Up', 'The delivery boy picked up the order.', 'delivery');
        break;
      case 'Out For Delivery':
        await notifyCustomer('Out For Delivery', 'Your order is out for delivery.', 'delivery');
        break;
      case 'Reached Customer':
        await notifyCustomer('Arriving Now', 'Your delivery boy has reached your location.', 'delivery');
        break;
      case 'Cash Collected':
        await notifyAgent('Cash Collected', 'The delivery boy collected cash for an order.', 'payment');
        break;
      case 'Delivered':
        await notifyCustomer('Order Delivered', 'Your order has been delivered.', 'delivery');
        await notifyShop('Order Delivered', 'An order has been delivered.', 'delivery');
        await notifyAgent('Verify Payment', 'An order was delivered. Please verify the payment.', 'payment');
        break;
      case 'Payment Verified':
        await notifyAgent('Payment Verified', 'Payment verified. You can now settle it to the shop.', 'payment');
        break;
      case 'Payment Settled To Shop':
        await notifyShop('Payment Settled', 'The delivery agent settled the payment. Please confirm to complete the order.', 'payment');
        break;
      case 'Completed':
        await notifyCustomer('Order Completed', 'Your order has been completed successfully.', 'system');
        await notifyShop('Order Completed', 'The order has been completed.', 'system');
        break;
      case 'Cancelled':
        await notifyCustomer('Request Cancelled', 'Your request has been cancelled.', 'system');
        await notifyShop('Request Cancelled', 'A customer request was cancelled.', 'system');
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('notifyStatusChange failed:', error.message);
  }
};

/**
 * Notify a shop owner (User.id) of a new customer request.
 */
const notifyNewRequest = async (shopOwnerUserId, request) => {
  await createNotification({
    userId: shopOwnerUserId,
    title: 'New Customer Request',
    message: `You have received a new request: "${(request.request_text || '').substring(0, 50)}..."`,
    type: 'request',
    data: { request_id: request.id },
  });
};

/**
 * Notify a customer (User.id) of a new quotation.
 */
const notifyNewQuotation = async (customerUserId, quotation) => {
  await createNotification({
    userId: customerUserId,
    title: 'New Quotation Received',
    message: `You received a quotation for ${quotation.final_amount}. Review and respond.`,
    type: 'quotation',
    data: {
      quotation_id: quotation.id,
      request_id: quotation.request_id,
      amount: quotation.final_amount,
    },
  });
};

module.exports = {
  createNotification,
  notifyStatusChange,
  notifyNewRequest,
  notifyNewQuotation,
};
