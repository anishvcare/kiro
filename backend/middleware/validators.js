const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Request validation rules
const createRequestValidation = [
  body('shop_id').isUUID().withMessage('Valid shop ID is required'),
  body('request_text').trim().notEmpty().isLength({ min: 3, max: 2000 }).withMessage('Request text must be 3-2000 characters'),
  body('delivery_address').optional().trim().isLength({ max: 500 }).withMessage('Address must not exceed 500 characters'),
  body('urgency').optional().isIn(['normal', 'urgent', 'scheduled']).withMessage('Urgency must be normal, urgent, or scheduled'),
  body('scheduled_date').optional().isISO8601().withMessage('Valid scheduled date required'),
  validate,
];

// Quotation validation rules
const createQuotationValidation = [
  body('request_id').isUUID().withMessage('Valid request ID is required'),
  body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('approx_weight').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Weight must be non-negative'),
  body('delivery_charge').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Delivery charge must be non-negative'),
  body('bill_image_url').optional({ nullable: true }).isString(),
  body('items').optional({ nullable: true }).isArray(),
  validate,
];

// Payment validation rules
const initiatePaymentValidation = [
  body('quotation_id').isUUID().withMessage('Valid quotation ID is required'),
  body('payment_method').isIn(['upi', 'cod', 'bank_transfer', 'wallet']).withMessage('Invalid payment method'),
  validate,
];

// Shop registration validation rules
const registerShopValidation = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 255 }).withMessage('Shop name must be 2-255 characters'),
  body('address').trim().notEmpty().isLength({ max: 500 }).withMessage('Address is required'),
  body('city').trim().notEmpty().isLength({ max: 100 }).withMessage('City is required'),
  body('category_id').optional().isInt({ min: 1 }).withMessage('Valid category ID required'),
  body('phone').optional().matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Valid phone number required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  validate,
];

// Delivery assignment validation rules
const assignDeliveryValidation = [
  body('request_id').notEmpty().withMessage('Please select a request'),
  body('delivery_boy_id').notEmpty().withMessage('Please select a delivery boy'),
  body('transaction_id').optional({ nullable: true }),
  validate,
];

// Status update validation
const updateDeliveryStatusValidation = [
  param('id').isUUID().withMessage('Valid assignment ID is required'),
  body('status').isIn(['picked_up', 'in_transit', 'delivered', 'failed', 'returned']).withMessage('Invalid delivery status'),
  validate,
];

// Chat message validation
const sendMessageValidation = [
  body('chat_id').isUUID().withMessage('Valid chat ID is required'),
  body('content').trim().notEmpty().isLength({ max: 5000 }).withMessage('Message content must be 1-5000 characters'),
  body('message_type').optional().isIn(['text', 'image', 'file', 'location']).withMessage('Invalid message type'),
  validate,
];

// UUID param validation
const uuidParamValidation = [
  param('id').isUUID().withMessage('Valid ID is required'),
  validate,
];

// Report date query validation
const reportDateValidation = [
  query('start_date').optional().isISO8601().withMessage('Valid start date required'),
  query('end_date').optional().isISO8601().withMessage('Valid end date required'),
  validate,
];

// Export validation
const exportValidation = [
  query('report_type').isIn(['revenue', 'daily-requests', 'completed-deliveries', 'cash-collections', 'delivery-performance', 'summary']).withMessage('Valid report type is required'),
  query('start_date').optional().isISO8601().withMessage('Valid start date required'),
  query('end_date').optional().isISO8601().withMessage('Valid end date required'),
  validate,
];

module.exports = {
  validate,
  createRequestValidation,
  createQuotationValidation,
  initiatePaymentValidation,
  registerShopValidation,
  assignDeliveryValidation,
  updateDeliveryStatusValidation,
  sendMessageValidation,
  uuidParamValidation,
  reportDateValidation,
  exportValidation,
};
