const {
  CustomerRequest,
  Quotation,
  QuotationItem,
  Shop,
  User,
  Customer,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');
const { validateStatusTransition } = require('../services/requestService');
const { notifyNewQuotation, notifyStatusChange } = require('../services/notificationService');

/**
 * Resolve the customers.id for the authenticated user.
 * customer_requests.customer_id is a foreign key to customers.id (NOT users.id),
 * so ownership checks must compare against the resolved customer profile ID.
 */
const resolveCustomerId = async (userId) => {
  const [customer] = await Customer.findOrCreate({
    where: { user_id: userId },
    defaults: { id: generateId(), user_id: userId },
  });
  return customer.id;
};

/**
 * Create a quotation for a request
 * POST /api/quotations
 */
const createQuotation = asyncHandler(async (req, res) => {
  const {
    request_id,
    shop_id,
    items,
    delivery_charge,
    discount,
    tax_amount,
    notes,
    valid_until,
    payment_method,
    estimated_prep_time,
  } = req.body;

  if (!request_id || !shop_id) {
    return apiResponse(res, 400, 'Request ID and Shop ID are required');
  }

  // Verify shop ownership
  const shop = await Shop.findOne({
    where: { id: shop_id, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found or access denied');
  }

  // Verify request exists and is for this shop
  const request = await CustomerRequest.findOne({
    where: { id: request_id, shop_id },
  });

  if (!request) {
    return apiResponse(res, 404, 'Request not found for this shop');
  }

  // Validate status transition
  const validation = validateStatusTransition(request.status, 'Shop Quotation Sent');
  if (!validation.valid) {
    return apiResponse(res, 400, validation.message);
  }

  const transaction = await sequelize.transaction();

  try {
    // Calculate totals
    let totalAmount = 0;
    if (items && Array.isArray(items)) {
      totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * (item.quantity || 1)), 0);
    }

    const deliveryChargeAmount = parseFloat(delivery_charge) || 0;
    const discountAmount = parseFloat(discount) || 0;
    const taxAmountValue = parseFloat(tax_amount) || 0;
    const finalAmount = totalAmount + deliveryChargeAmount - discountAmount + taxAmountValue;

    // Create quotation
    const quotation = await Quotation.create({
      id: generateId(),
      request_id,
      shop_id,
      total_amount: totalAmount,
      delivery_charge: deliveryChargeAmount,
      discount: discountAmount,
      tax_amount: taxAmountValue,
      final_amount: finalAmount,
      notes: notes || null,
      valid_until: valid_until || null,
      status: 'sent',
      payment_method: payment_method || null,
      estimated_prep_time: estimated_prep_time || null,
    }, { transaction });

    // Create quotation items
    if (items && Array.isArray(items) && items.length > 0) {
      const quotationItems = items.map((item) => ({
        quotation_id: quotation.id,
        item_name: item.item_name,
        quantity: item.quantity || 1,
        unit: item.unit || null,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.unit_price) * (item.quantity || 1),
        notes: item.notes || null,
      }));
      await QuotationItem.bulkCreate(quotationItems, { transaction });
    }

    // Update request status
    await request.update({ status: 'Shop Quotation Sent' }, { transaction });

    await transaction.commit();

    // Notify customer (resolve customers.id -> users.id for the notification target)
    const customerProfile = await Customer.findByPk(request.customer_id);
    if (customerProfile) {
      await notifyNewQuotation(customerProfile.user_id, quotation);
    }
    await notifyStatusChange(request, 'Shop Quotation Sent');

    // Fetch full quotation with items
    const fullQuotation = await Quotation.findByPk(quotation.id, {
      include: [{ model: QuotationItem, as: 'items' }],
    });

    return apiResponse(res, 201, 'Quotation created successfully', { quotation: fullQuotation });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Update a quotation
 * PUT /api/quotations/:id
 */
const updateQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    items,
    delivery_charge,
    discount,
    tax_amount,
    notes,
    valid_until,
    payment_method,
    estimated_prep_time,
  } = req.body;

  const quotation = await Quotation.findByPk(id, {
    include: [
      { model: Shop, as: 'shop' },
    ],
  });

  if (!quotation) {
    return apiResponse(res, 404, 'Quotation not found');
  }

  // Verify ownership
  if (quotation.shop.owner_id !== req.user.id) {
    return apiResponse(res, 403, 'Access denied');
  }

  // Can only update quotations in 'sent' status
  if (quotation.status !== 'sent') {
    return apiResponse(res, 400, 'Can only update quotations that have not been accepted or rejected');
  }

  const transaction = await sequelize.transaction();

  try {
    let totalAmount = quotation.total_amount;

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Remove existing items
      await QuotationItem.destroy({ where: { quotation_id: id }, transaction });

      totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * (item.quantity || 1)), 0);

      const quotationItems = items.map((item) => ({
        quotation_id: id,
        item_name: item.item_name,
        quantity: item.quantity || 1,
        unit: item.unit || null,
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.unit_price) * (item.quantity || 1),
        notes: item.notes || null,
      }));
      await QuotationItem.bulkCreate(quotationItems, { transaction });
    }

    const deliveryChargeAmount = delivery_charge !== undefined ? parseFloat(delivery_charge) : parseFloat(quotation.delivery_charge);
    const discountAmount = discount !== undefined ? parseFloat(discount) : parseFloat(quotation.discount);
    const taxAmountValue = tax_amount !== undefined ? parseFloat(tax_amount) : parseFloat(quotation.tax_amount);
    const finalAmount = totalAmount + deliveryChargeAmount - discountAmount + taxAmountValue;

    await quotation.update({
      total_amount: totalAmount,
      delivery_charge: deliveryChargeAmount,
      discount: discountAmount,
      tax_amount: taxAmountValue,
      final_amount: finalAmount,
      notes: notes !== undefined ? notes : quotation.notes,
      valid_until: valid_until !== undefined ? valid_until : quotation.valid_until,
      payment_method: payment_method !== undefined ? payment_method : quotation.payment_method,
      estimated_prep_time: estimated_prep_time !== undefined ? estimated_prep_time : quotation.estimated_prep_time,
    }, { transaction });

    await transaction.commit();

    const updatedQuotation = await Quotation.findByPk(id, {
      include: [{ model: QuotationItem, as: 'items' }],
    });

    return apiResponse(res, 200, 'Quotation updated successfully', { quotation: updatedQuotation });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Get a quotation by ID
 * GET /api/quotations/:id
 */
const getQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quotation = await Quotation.findByPk(id, {
    include: [
      { model: QuotationItem, as: 'items' },
      { model: Shop, as: 'shop', attributes: ['id', 'name', 'address', 'phone', 'owner_id'] },
      {
        model: CustomerRequest,
        as: 'request',
        attributes: ['id', 'customer_id', 'request_text', 'status'],
      },
    ],
  });

  if (!quotation) {
    return apiResponse(res, 404, 'Quotation not found');
  }

  // Verify access
  const isShopOwner = quotation.shop.owner_id === req.user.id;
  const isCustomer = quotation.request.customer_id === (await resolveCustomerId(req.user.id));

  if (!isShopOwner && !isCustomer) {
    return apiResponse(res, 403, 'Access denied');
  }

  return apiResponse(res, 200, 'Quotation retrieved', { quotation });
});

/**
 * Accept a quotation
 * PUT /api/quotations/:id/accept
 */
const acceptQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quotation = await Quotation.findByPk(id, {
    include: [
      { model: CustomerRequest, as: 'request' },
    ],
  });

  if (!quotation) {
    return apiResponse(res, 404, 'Quotation not found');
  }

  // Verify customer owns the request
  if (quotation.request.customer_id !== (await resolveCustomerId(req.user.id))) {
    return apiResponse(res, 403, 'Access denied');
  }

  // Validate status transition
  const validation = validateStatusTransition(quotation.request.status, 'Customer Accepted Quote');
  if (!validation.valid) {
    return apiResponse(res, 400, validation.message);
  }

  if (quotation.status !== 'sent' && quotation.status !== 'viewed') {
    return apiResponse(res, 400, 'Quotation is no longer available for acceptance');
  }

  const transaction = await sequelize.transaction();

  try {
    // Update quotation status
    await quotation.update({ status: 'accepted' }, { transaction });

    // Update request status
    await quotation.request.update({ status: 'Customer Accepted Quote' }, { transaction });

    await transaction.commit();

    await notifyStatusChange(quotation.request, 'Customer Accepted Quote');

    return apiResponse(res, 200, 'Quotation accepted successfully', { quotation });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Reject a quotation
 * PUT /api/quotations/:id/reject
 */
const rejectQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const quotation = await Quotation.findByPk(id, {
    include: [
      { model: CustomerRequest, as: 'request' },
    ],
  });

  if (!quotation) {
    return apiResponse(res, 404, 'Quotation not found');
  }

  // Verify customer owns the request
  if (quotation.request.customer_id !== (await resolveCustomerId(req.user.id))) {
    return apiResponse(res, 403, 'Access denied');
  }

  // Validate status transition
  const validation = validateStatusTransition(quotation.request.status, 'Customer Rejected Quote');
  if (!validation.valid) {
    return apiResponse(res, 400, validation.message);
  }

  if (quotation.status !== 'sent' && quotation.status !== 'viewed') {
    return apiResponse(res, 400, 'Quotation is no longer available for rejection');
  }

  const transaction = await sequelize.transaction();

  try {
    // Update quotation status
    await quotation.update({
      status: 'rejected',
      notes: reason ? `${quotation.notes || ''}\nRejection reason: ${reason}`.trim() : quotation.notes,
    }, { transaction });

    // Update request status
    await quotation.request.update({ status: 'Customer Rejected Quote' }, { transaction });

    await transaction.commit();

    await notifyStatusChange(quotation.request, 'Customer Rejected Quote');

    return apiResponse(res, 200, 'Quotation rejected successfully', { quotation });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Get quotations for a request
 * GET /api/quotations/request/:requestId
 */
const getQuotationsByRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await CustomerRequest.findByPk(requestId, {
    include: [{ model: Shop, as: 'shop', attributes: ['owner_id'] }],
  });

  if (!request) {
    return apiResponse(res, 404, 'Request not found');
  }

  // Verify access
  const isCustomer = request.customer_id === (await resolveCustomerId(req.user.id));
  const isShopOwner = request.shop && request.shop.owner_id === req.user.id;

  if (!isCustomer && !isShopOwner) {
    return apiResponse(res, 403, 'Access denied');
  }

  const quotations = await Quotation.findAll({
    where: { request_id: requestId },
    include: [
      { model: QuotationItem, as: 'items' },
      { model: Shop, as: 'shop', attributes: ['id', 'name', 'logo_url'] },
    ],
    order: [['created_at', 'DESC']],
  });

  return apiResponse(res, 200, 'Quotations retrieved', { quotations });
});

module.exports = {
  createQuotation,
  updateQuotation,
  getQuotation,
  acceptQuotation,
  rejectQuotation,
  getQuotationsByRequest,
};
