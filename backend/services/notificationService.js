/**
 * Notification Service
 * Handles creating and dispatching notifications on status changes and events
 */

const { Notification } = require('../models');
const { generateId } = require('../utils/helpers');

/**
 * Create a notification for a user
 * @param {object} params - Notification parameters
 * @param {string} params.userId - Target user ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (request, quotation, delivery, payment, system)
 * @param {object} params.data - Additional data (request_id, quotation_id, etc.)
 */
const createNotification = async ({ userId, title, message, type = 'system', data = {} }) => {
  try {
    const notification = await Notification.create({
      id: generateId(),
      user_id: userId,
      title,
      body: message,
      type,
      reference_type: data.request_id ? 'request' : data.quotation_id ? 'quotation' : null,
      reference_id: data.request_id || data.quotation_id || null,
      is_read: false,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Notify on request status change
 * @param {object} request - The customer request object
 * @param {string} newStatus - The new status
 * @param {object} additionalData - Extra context data
 */
const notifyStatusChange = async (request, newStatus, additionalData = {}) => {
  const notificationMap = {
    'Shop Received Request': {
      userId: request.customer_id,
      title: 'Request Received',
      message: 'Your request has been received by the shop.',
      type: 'request',
    },
    'Shop Quotation Sent': {
      userId: request.customer_id,
      title: 'Quotation Received',
      message: 'The shop has sent you a quotation. Please review and accept or reject.',
      type: 'quotation',
    },
    'Customer Accepted Quote': {
      userId: request.shop_id, // Will need to resolve to shop owner user_id
      title: 'Quotation Accepted',
      message: 'The customer has accepted your quotation.',
      type: 'quotation',
    },
    'Customer Rejected Quote': {
      userId: request.shop_id,
      title: 'Quotation Rejected',
      message: 'The customer has rejected your quotation.',
      type: 'quotation',
    },
    'Delivery Boy Assigned': {
      userId: request.customer_id,
      title: 'Delivery Boy Assigned',
      message: 'A delivery boy has been assigned to your order.',
      type: 'delivery',
    },
    'Picked Up From Shop': {
      userId: request.customer_id,
      title: 'Order Picked Up',
      message: 'Your order has been picked up from the shop.',
      type: 'delivery',
    },
    'Out For Delivery': {
      userId: request.customer_id,
      title: 'Out For Delivery',
      message: 'Your order is out for delivery.',
      type: 'delivery',
    },
    'Delivered': {
      userId: request.customer_id,
      title: 'Order Delivered',
      message: 'Your order has been delivered.',
      type: 'delivery',
    },
    'Completed': {
      userId: request.customer_id,
      title: 'Order Completed',
      message: 'Your order has been completed successfully.',
      type: 'system',
    },
    'Cancelled': {
      userId: request.customer_id,
      title: 'Request Cancelled',
      message: 'Your request has been cancelled.',
      type: 'system',
    },
  };

  const notifConfig = notificationMap[newStatus];
  if (notifConfig) {
    await createNotification({
      ...notifConfig,
      data: {
        request_id: request.id,
        status: newStatus,
        ...additionalData,
      },
    });
  }
};

/**
 * Notify shop owner of new request
 * @param {string} shopOwnerId - Shop owner user ID
 * @param {object} request - The customer request
 */
const notifyNewRequest = async (shopOwnerId, request) => {
  await createNotification({
    userId: shopOwnerId,
    title: 'New Customer Request',
    message: `You have received a new request: "${request.request_text?.substring(0, 50)}..."`,
    type: 'request',
    data: {
      request_id: request.id,
    },
  });
};

/**
 * Notify customer of new quotation
 * @param {string} customerId - Customer user ID
 * @param {object} quotation - The quotation object
 */
const notifyNewQuotation = async (customerId, quotation) => {
  await createNotification({
    userId: customerId,
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
