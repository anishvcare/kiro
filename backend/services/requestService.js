/**
 * Request Service - Status flow validation and business logic
 * Enforces the 18-step request status progression
 */

// The 18 request statuses in order
const REQUEST_STATUSES = [
  'Customer Request Sent',
  'Shop Received Request',
  'Shop Quotation Sent',
  'Customer Accepted Quote',
  'Customer Rejected Quote',
  'Delivery Agent Notified',
  'Delivery Boy Assigned',
  'Delivery Boy Accepted',
  'Reached Shop',
  'Picked Up From Shop',
  'Out For Delivery',
  'Reached Customer',
  'Delivered',
  'Cash Collected',
  'Payment Verified',
  'Payment Settled To Shop',
  'Completed',
  'Cancelled',
];

// Valid status transitions map
const VALID_TRANSITIONS = {
  'Customer Request Sent': ['Shop Received Request', 'Cancelled'],
  'Shop Received Request': ['Shop Quotation Sent', 'Cancelled'],
  'Shop Quotation Sent': ['Customer Accepted Quote', 'Customer Rejected Quote', 'Cancelled'],
  'Customer Accepted Quote': ['Delivery Agent Notified', 'Cancelled'],
  'Customer Rejected Quote': [], // Terminal state (customer can create new request)
  'Delivery Agent Notified': ['Delivery Boy Assigned', 'Cancelled'],
  'Delivery Boy Assigned': ['Delivery Boy Accepted', 'Cancelled'],
  'Delivery Boy Accepted': ['Reached Shop', 'Cancelled'],
  'Reached Shop': ['Picked Up From Shop', 'Cancelled'],
  'Picked Up From Shop': ['Out For Delivery', 'Cancelled'],
  'Out For Delivery': ['Reached Customer', 'Cancelled'],
  'Reached Customer': ['Delivered', 'Cancelled'],
  'Delivered': ['Cash Collected', 'Payment Verified'],
  'Cash Collected': ['Payment Verified'],
  'Payment Verified': ['Payment Settled To Shop'],
  'Payment Settled To Shop': ['Completed'],
  'Completed': [], // Terminal state
  'Cancelled': [], // Terminal state
};

/**
 * Validate if a status transition is allowed
 * @param {string} currentStatus - Current request status
 * @param {string} newStatus - Requested new status
 * @returns {object} { valid: boolean, message: string }
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  if (!REQUEST_STATUSES.includes(currentStatus)) {
    return { valid: false, message: `Invalid current status: ${currentStatus}` };
  }

  if (!REQUEST_STATUSES.includes(newStatus)) {
    return { valid: false, message: `Invalid target status: ${newStatus}` };
  }

  const allowedTransitions = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    return {
      valid: false,
      message: `Cannot transition from "${currentStatus}" to "${newStatus}". Allowed: ${allowedTransitions.join(', ') || 'none (terminal state)'}`,
    };
  }

  return { valid: true, message: 'Transition is valid' };
};

/**
 * Get the index/position of a status in the flow
 * @param {string} status - The status to check
 * @returns {number} Index position (0-based), -1 if not found
 */
const getStatusIndex = (status) => {
  return REQUEST_STATUSES.indexOf(status);
};

/**
 * Check if a status is a terminal state
 * @param {string} status - The status to check
 * @returns {boolean}
 */
const isTerminalStatus = (status) => {
  const transitions = VALID_TRANSITIONS[status];
  return transitions && transitions.length === 0;
};

/**
 * Get all statuses up to the current one (for timeline display)
 * @param {string} currentStatus - Current request status
 * @returns {Array} Array of status objects with completed flag
 */
const getStatusTimeline = (currentStatus) => {
  const currentIndex = getStatusIndex(currentStatus);

  // For cancelled/rejected, show different timeline
  if (currentStatus === 'Cancelled' || currentStatus === 'Customer Rejected Quote') {
    return REQUEST_STATUSES.map((status) => ({
      status,
      completed: status === currentStatus,
      active: status === currentStatus,
      cancelled: currentStatus === 'Cancelled' && status === 'Cancelled',
      rejected: currentStatus === 'Customer Rejected Quote' && status === 'Customer Rejected Quote',
    }));
  }

  return REQUEST_STATUSES.filter((s) => s !== 'Cancelled' && s !== 'Customer Rejected Quote').map((status, index) => {
    const statusIndex = getStatusIndex(status);
    return {
      status,
      completed: statusIndex <= currentIndex && statusIndex !== -1,
      active: status === currentStatus,
    };
  });
};

/**
 * Determine which role can perform the status transition
 * @param {string} newStatus - The target status
 * @returns {string} Role that should trigger this transition
 */
const getTransitionRole = (newStatus) => {
  const roleMap = {
    'Customer Request Sent': 'customer',
    'Shop Received Request': 'shop_owner',
    'Shop Quotation Sent': 'shop_owner',
    'Customer Accepted Quote': 'customer',
    'Customer Rejected Quote': 'customer',
    'Delivery Agent Notified': 'system',
    'Delivery Boy Assigned': 'delivery_agent',
    'Delivery Boy Accepted': 'delivery_boy',
    'Reached Shop': 'delivery_boy',
    'Picked Up From Shop': 'delivery_boy',
    'Out For Delivery': 'delivery_boy',
    'Reached Customer': 'delivery_boy',
    'Delivered': 'delivery_boy',
    'Cash Collected': 'delivery_boy',
    'Payment Verified': 'system',
    'Payment Settled To Shop': 'super_admin',
    'Completed': 'system',
    'Cancelled': 'customer',
  };

  return roleMap[newStatus] || 'system';
};

module.exports = {
  REQUEST_STATUSES,
  VALID_TRANSITIONS,
  validateStatusTransition,
  getStatusIndex,
  isTerminalStatus,
  getStatusTimeline,
  getTransitionRole,
};
