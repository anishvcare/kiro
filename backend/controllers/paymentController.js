const {
  PaymentTransaction,
  PaymentScreenshot,
  PaymentWebhook,
  UpiPaymentLog,
  ShopPaymentAccount,
  Quotation,
  CustomerRequest,
  Customer,
  Shop,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');
const PaymentProviderFactory = require('../services/payment/PaymentProviderFactory');
const { generateUPIQRCode } = require('../services/qrCodeService');

/**
 * Resolve the customers.id for the authenticated user.
 * payment_transactions.customer_id and customer_requests.customer_id are foreign
 * keys to customers.id (NOT users.id), so we must look up (or lazily create) the
 * customer profile for the logged-in user.
 */
const resolveCustomerId = async (userId) => {
  const [customer] = await Customer.findOrCreate({
    where: { user_id: userId },
    defaults: { id: generateId(), user_id: userId },
  });
  return customer.id;
};

/**
 * Initiate a payment for a quotation
 * POST /api/payments/initiate
 */
const initiatePayment = asyncHandler(async (req, res) => {
  const { quotation_id, payment_method, delivery_address } = req.body;

  if (!quotation_id) {
    return apiResponse(res, 400, 'Quotation ID is required');
  }

  // Get quotation with shop details
  const quotation = await Quotation.findByPk(quotation_id, {
    include: [
      { model: Shop, as: 'shop' },
      { model: CustomerRequest, as: 'request' },
    ],
  });

  if (!quotation) {
    return apiResponse(res, 404, 'Quotation not found');
  }

  // Verify the customer owns this request
  const customerId = await resolveCustomerId(req.user.id);
  if (quotation.request.customer_id !== customerId) {
    return apiResponse(res, 403, 'Access denied');
  }

  // Check quotation status is accepted
  if (quotation.status !== 'accepted') {
    return apiResponse(res, 400, 'Quotation must be accepted before payment');
  }

  // Capture / update the delivery address for this order before payment.
  const finalDeliveryAddress = (delivery_address && delivery_address.trim())
    || quotation.request.delivery_address;
  if (!finalDeliveryAddress || !finalDeliveryAddress.trim()) {
    return apiResponse(res, 400, 'A delivery address is required before payment');
  }
  if (delivery_address && delivery_address.trim() &&
      delivery_address.trim() !== quotation.request.delivery_address) {
    await quotation.request.update({ delivery_address: delivery_address.trim() });
  }

  const method = payment_method || quotation.payment_method || 'upi';

  // For UPI payments, get shop UPI account
  let shopUpiId = null;
  let shopPhone = null;

  if (method === 'upi' || method === 'manual_upi') {
    const shopAccount = await ShopPaymentAccount.findOne({
      where: { shop_id: quotation.shop_id, is_active: true, is_primary: true },
    });

    if (shopAccount && shopAccount.account_details) {
      shopUpiId = shopAccount.account_details.upi_id;
      shopPhone = shopAccount.account_details.phone;
    }
  }

  // Create payment transaction
  const transaction = await PaymentTransaction.create({
    id: generateId(),
    quotation_id: quotation.id,
    customer_id: customerId,
    shop_id: quotation.shop_id,
    amount: quotation.final_amount,
    payment_method: method,
    status: 'initiated',
    metadata: {
      shop_name: quotation.shop.name,
      request_id: quotation.request_id,
      delivery_address: finalDeliveryAddress,
    },
  });

  let paymentData = {
    transaction_id: transaction.id,
    amount: quotation.final_amount,
    payment_method: method,
    status: 'initiated',
  };

  // Generate UPI data if applicable
  if (method === 'upi' || method === 'manual_upi') {
    // Use Manual UPI provider (primary fallback)
    const provider = PaymentProviderFactory.getProvider('manual_upi');
    const upiPayment = await provider.createPayment({
      upiId: shopUpiId || `${quotation.shop_id}@upi`,
      shopName: quotation.shop.name,
      amount: quotation.final_amount,
      requestId: quotation.request_id,
      shopPhone,
    });

    // Generate QR code
    const qrData = await generateUPIQRCode({
      upiId: shopUpiId || `${quotation.shop_id}@upi`,
      shopName: quotation.shop.name,
      amount: quotation.final_amount,
      requestId: quotation.request_id,
    });

    // Log UPI payment
    await UpiPaymentLog.create({
      transaction_id: transaction.id,
      upi_id: shopUpiId || `${quotation.shop_id}@upi`,
      status: 'initiated',
      response_data: upiPayment,
    });

    paymentData = {
      ...paymentData,
      upi_id: upiPayment.upi_id,
      deep_link: upiPayment.deep_link,
      qr_code: qrData.qr_code,
      shop_name: quotation.shop.name,
      shop_phone: shopPhone,
    };
  } else if (method === 'bharatpe') {
    // Try BharatPe provider
    try {
      const provider = PaymentProviderFactory.getProvider('bharatpe');
      const bharatpePayment = await provider.createPaymentLink({
        amount: quotation.final_amount,
        orderId: transaction.id,
        customerName: req.user.name,
        description: `Payment for quotation ${quotation.id}`,
      });

      paymentData = {
        ...paymentData,
        payment_link: bharatpePayment.url,
        bharatpe_id: bharatpePayment.id,
      };
    } catch (error) {
      // Fallback to manual UPI
      const provider = PaymentProviderFactory.getProvider('manual_upi');
      const upiPayment = await provider.createPayment({
        upiId: shopUpiId || `${quotation.shop_id}@upi`,
        shopName: quotation.shop.name,
        amount: quotation.final_amount,
        requestId: quotation.request_id,
        shopPhone,
      });

      const qrData = await generateUPIQRCode({
        upiId: shopUpiId || `${quotation.shop_id}@upi`,
        shopName: quotation.shop.name,
        amount: quotation.final_amount,
        requestId: quotation.request_id,
      });

      paymentData = {
        ...paymentData,
        payment_method: 'manual_upi',
        upi_id: upiPayment.upi_id,
        deep_link: upiPayment.deep_link,
        qr_code: qrData.qr_code,
        shop_name: quotation.shop.name,
        shop_phone: shopPhone,
        fallback: true,
      };

      // Update transaction method
      await transaction.update({ payment_method: 'manual_upi' });
    }
  } else if (method === 'cod') {
    // COD - no payment needed upfront
    paymentData = {
      ...paymentData,
      message: 'Cash on delivery selected. Payment will be collected at delivery.',
    };
    await transaction.update({ status: 'pending' });
  }

  return apiResponse(res, 201, 'Payment initiated', { payment: paymentData });
});

/**
 * Verify a payment (by shop owner or admin)
 * PUT /api/payments/:id/verify
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { approved, upi_ref_number, notes } = req.body;

  const transaction = await PaymentTransaction.findByPk(id, {
    include: [{ model: Shop, as: 'shop' }],
  });

  if (!transaction) {
    return apiResponse(res, 404, 'Payment transaction not found');
  }

  // Verify that the user is the shop owner or admin
  const isShopOwner = transaction.shop && transaction.shop.owner_id === req.user.id;
  const isAdmin = req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('super_admin'));

  if (!isShopOwner && !isAdmin) {
    return apiResponse(res, 403, 'Only shop owner or admin can verify payments');
  }

  if (transaction.status === 'success' || transaction.status === 'refunded') {
    return apiResponse(res, 400, 'Payment has already been processed');
  }

  const newStatus = approved ? 'success' : 'failed';

  await transaction.update({
    status: newStatus,
    paid_at: approved ? new Date() : null,
    metadata: {
      ...transaction.metadata,
      verified_by: req.user.id,
      verified_at: new Date().toISOString(),
      upi_ref_number: upi_ref_number || null,
      verification_notes: notes || null,
    },
  });

  // Update screenshot verification status if exists
  if (approved) {
    await PaymentScreenshot.update(
      { verified: true, verified_by: req.user.id, verified_at: new Date() },
      { where: { transaction_id: id } }
    );
  }

  // Log UPI verification
  if (upi_ref_number) {
    await UpiPaymentLog.create({
      transaction_id: id,
      upi_ref_number,
      status: newStatus,
      response_data: { verified_by: req.user.id, notes },
    });
  }

  return apiResponse(res, 200, `Payment ${approved ? 'verified' : 'rejected'} successfully`, {
    transaction: {
      id: transaction.id,
      status: newStatus,
      amount: transaction.amount,
      payment_method: transaction.payment_method,
      paid_at: transaction.paid_at,
    },
  });
});

/**
 * Upload payment screenshot
 * POST /api/payments/:id/screenshot
 */
const uploadPaymentScreenshot = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return apiResponse(res, 400, 'Screenshot image is required');
  }

  const transaction = await PaymentTransaction.findByPk(id);

  if (!transaction) {
    return apiResponse(res, 404, 'Payment transaction not found');
  }

  // Verify the customer owns this transaction
  const customerId = await resolveCustomerId(req.user.id);
  if (transaction.customer_id !== customerId) {
    return apiResponse(res, 403, 'Access denied');
  }

  const imageUrl = `/uploads/payments/${req.file.filename}`;

  const screenshot = await PaymentScreenshot.create({
    transaction_id: id,
    image_url: imageUrl,
    verified: false,
  });

  // Update transaction status to pending (screenshot uploaded, awaiting verification)
  await transaction.update({
    status: 'pending',
    metadata: {
      ...transaction.metadata,
      screenshot_uploaded_at: new Date().toISOString(),
    },
  });

  return apiResponse(res, 201, 'Payment screenshot uploaded successfully', {
    screenshot: {
      id: screenshot.id,
      image_url: imageUrl,
      transaction_id: id,
      status: 'pending_verification',
    },
  });
});

/**
 * Get payment status
 * GET /api/payments/:id/status
 */
const getPaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await PaymentTransaction.findByPk(id, {
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name'] },
    ],
  });

  if (!transaction) {
    return apiResponse(res, 404, 'Payment transaction not found');
  }

  // Verify access
  const customerId = await resolveCustomerId(req.user.id);
  const isCustomer = transaction.customer_id === customerId;
  const isShopOwner = transaction.shop && transaction.shop.owner_id === req.user.id;
  const isAdmin = req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('super_admin'));

  if (!isCustomer && !isShopOwner && !isAdmin) {
    return apiResponse(res, 403, 'Access denied');
  }

  // Get screenshots if any
  const screenshots = await PaymentScreenshot.findAll({
    where: { transaction_id: id },
  });

  return apiResponse(res, 200, 'Payment status retrieved', {
    payment: {
      id: transaction.id,
      quotation_id: transaction.quotation_id,
      amount: transaction.amount,
      payment_method: transaction.payment_method,
      status: transaction.status,
      paid_at: transaction.paid_at,
      shop: transaction.shop,
      screenshots,
      metadata: transaction.metadata,
      created_at: transaction.createdAt,
    },
  });
});

/**
 * Handle payment webhook from gateway
 * POST /api/payments/webhook/:gateway
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const { gateway } = req.params;
  const payload = req.body;
  const signature = req.headers['x-webhook-signature'] || req.headers['x-bharatpe-signature'] || '';

  // Store webhook
  const webhookLog = await PaymentWebhook.create({
    gateway,
    event_type: payload.event || payload.event_type || 'unknown',
    payload,
    processed: false,
  });

  try {
    // Get the appropriate provider
    const provider = PaymentProviderFactory.getProvider(gateway);
    const result = await provider.processWebhook(payload, signature);

    // Find and update the transaction
    if (result.transaction_id || result.order_id) {
      const transaction = await PaymentTransaction.findOne({
        where: result.order_id
          ? { id: result.order_id }
          : { gateway_transaction_id: result.transaction_id },
      });

      if (transaction) {
        const statusMap = {
          success: 'success',
          failed: 'failed',
          pending: 'pending',
          refunded: 'refunded',
        };

        await transaction.update({
          status: statusMap[result.status] || transaction.status,
          gateway_transaction_id: result.transaction_id || transaction.gateway_transaction_id,
          paid_at: result.status === 'success' ? new Date() : transaction.paid_at,
          metadata: { ...transaction.metadata, webhook_data: result },
        });
      }
    }

    // Mark webhook as processed
    await webhookLog.update({ processed: true, processed_at: new Date() });

    return apiResponse(res, 200, 'Webhook processed');
  } catch (error) {
    await webhookLog.update({
      processed: true,
      processed_at: new Date(),
      payload: { ...webhookLog.payload, processing_error: error.message },
    });

    return apiResponse(res, 200, 'Webhook received');
  }
});

/**
 * Get transaction history for user
 * GET /api/payments/history
 */
const getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  const isAdmin = req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('super_admin'));

  if (!isAdmin) {
    // Regular users see only their transactions
    where.customer_id = await resolveCustomerId(req.user.id);
  }

  if (status) {
    where.status = status;
  }

  const { count, rows: transactions } = await PaymentTransaction.findAndCountAll({
    where,
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Transaction history retrieved', {
    transactions,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get payment details for a quotation
 * GET /api/payments/quotation/:quotationId
 */
const getPaymentByQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const transaction = await PaymentTransaction.findOne({
    where: { quotation_id: quotationId },
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  });

  if (!transaction) {
    return apiResponse(res, 404, 'No payment found for this quotation');
  }

  const screenshots = await PaymentScreenshot.findAll({
    where: { transaction_id: transaction.id },
  });

  return apiResponse(res, 200, 'Payment details retrieved', {
    payment: {
      id: transaction.id,
      quotation_id: transaction.quotation_id,
      amount: transaction.amount,
      payment_method: transaction.payment_method,
      status: transaction.status,
      paid_at: transaction.paid_at,
      shop: transaction.shop,
      screenshots,
      metadata: transaction.metadata,
      created_at: transaction.createdAt,
    },
  });
});

module.exports = {
  initiatePayment,
  verifyPayment,
  uploadPaymentScreenshot,
  getPaymentStatus,
  handleWebhook,
  getTransactionHistory,
  getPaymentByQuotation,
};
