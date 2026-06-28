const { Op } = require('sequelize');
const {
  CustomerRequest,
  RequestImage,
  Quotation,
  QuotationItem,
  Shop,
  User,
  Customer,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');
const { validateStatusTransition, getStatusTimeline, REQUEST_STATUSES } = require('../services/requestService');
const { notifyStatusChange, notifyNewRequest } = require('../services/notificationService');

/**
 * Create a new customer request
 * POST /api/requests
 */
const createRequest = asyncHandler(async (req, res) => {
  const {
    shop_id,
    request_text,
    delivery_address,
    delivery_latitude,
    delivery_longitude,
    urgency,
    scheduled_date,
    scheduled_time,
  } = req.body;

  if (!shop_id || !request_text) {
    return apiResponse(res, 400, 'Shop ID and request text are required');
  }

  // Verify shop exists and is active
  const shop = await Shop.findOne({
    where: { id: shop_id, is_active: true },
    include: [{ model: User, as: 'owner', attributes: ['id'] }],
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found or is inactive');
  }

  // Use the user ID directly as customer_id (matching how associations work in the system)
  const request = await CustomerRequest.create({
    id: generateId(),
    customer_id: req.user.id,
    shop_id,
    request_text,
    status: 'Customer Request Sent',
    delivery_address: delivery_address || null,
    delivery_latitude: delivery_latitude || null,
    delivery_longitude: delivery_longitude || null,
    urgency: urgency || 'normal',
    scheduled_date: scheduled_date || null,
    scheduled_time: scheduled_time || null,
  });

  // Notify shop owner
  if (shop.owner) {
    await notifyNewRequest(shop.owner.id, request);
  }

  return apiResponse(res, 201, 'Request created successfully', { request });
});

/**
 * Upload images to a request
 * POST /api/requests/:id/images
 */
const uploadRequestImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await CustomerRequest.findOne({
    where: { id, customer_id: req.user.id },
  });

  if (!request) {
    return apiResponse(res, 404, 'Request not found');
  }

  if (!req.files || req.files.length === 0) {
    return apiResponse(res, 400, 'No images uploaded');
  }

  const images = [];
  for (const file of req.files) {
    const image = await RequestImage.create({
      request_id: id,
      image_url: `/uploads/requests/${file.filename}`,
      caption: req.body.caption || null,
    });
    images.push(image);
  }

  return apiResponse(res, 201, 'Images uploaded successfully', { images });
});

/**
 * Get customer's requests
 * GET /api/requests/my-requests
 */
const getCustomerRequests = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const where = { customer_id: req.user.id };
  if (status) {
    where.status = status;
  }

  const { count, rows: requests } = await CustomerRequest.findAndCountAll({
    where,
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name', 'address', 'phone', 'logo_url'] },
      { model: RequestImage, as: 'images', attributes: ['id', 'image_url', 'caption'] },
      {
        model: Quotation,
        as: 'quotations',
        attributes: ['id', 'total_amount', 'delivery_charge', 'final_amount', 'status', 'created_at'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return apiResponse(res, 200, 'Requests retrieved successfully', {
    requests,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  });
});

/**
 * Get shop's incoming requests
 * GET /api/requests/shop/:shopId
 */
const getShopRequests = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  // Verify shop ownership
  const shop = await Shop.findOne({
    where: { id: shopId, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found or access denied');
  }

  const where = { shop_id: shopId };
  if (status) {
    where.status = status;
  }

  const { count, rows: requests } = await CustomerRequest.findAndCountAll({
    where,
    include: [
      { model: Customer, as: 'customer' },
      { model: RequestImage, as: 'images', attributes: ['id', 'image_url', 'caption'] },
      {
        model: Quotation,
        as: 'quotations',
        attributes: ['id', 'total_amount', 'delivery_charge', 'final_amount', 'status', 'created_at'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return apiResponse(res, 200, 'Shop requests retrieved successfully', {
    requests,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    },
  });
});

/**
 * Get request details
 * GET /api/requests/:id
 */
const getRequestDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await CustomerRequest.findByPk(id, {
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'name', 'address', 'phone', 'logo_url', 'owner_id'] },
      { model: Customer, as: 'customer' },
      { model: RequestImage, as: 'images', attributes: ['id', 'image_url', 'caption'] },
      {
        model: Quotation,
        as: 'quotations',
        include: [
          { model: QuotationItem, as: 'items' },
        ],
      },
    ],
  });

  if (!request) {
    return apiResponse(res, 404, 'Request not found');
  }

  // Verify access (customer who created it or shop owner)
  const isCustomer = request.customer_id === req.user.id;
  const isShopOwner = request.shop && request.shop.owner_id === req.user.id;

  if (!isCustomer && !isShopOwner) {
    return apiResponse(res, 403, 'Access denied');
  }

  // Get status timeline
  const timeline = getStatusTimeline(request.status);

  return apiResponse(res, 200, 'Request details retrieved', {
    request,
    timeline,
    statuses: REQUEST_STATUSES,
  });
});

/**
 * Update request status
 * PUT /api/requests/:id/status
 */
const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  if (!newStatus) {
    return apiResponse(res, 400, 'New status is required');
  }

  const request = await CustomerRequest.findByPk(id, {
    include: [
      { model: Shop, as: 'shop', attributes: ['id', 'owner_id'] },
    ],
  });

  if (!request) {
    return apiResponse(res, 404, 'Request not found');
  }

  // Validate the status transition
  const validation = validateStatusTransition(request.status, newStatus);
  if (!validation.valid) {
    return apiResponse(res, 400, validation.message);
  }

  // Update the status
  await request.update({ status: newStatus });

  // Send notification
  await notifyStatusChange(request, newStatus);

  const timeline = getStatusTimeline(newStatus);

  return apiResponse(res, 200, 'Status updated successfully', {
    request,
    timeline,
  });
});

/**
 * Cancel a request
 * PUT /api/requests/:id/cancel
 */
const cancelRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await CustomerRequest.findOne({
    where: { id, customer_id: req.user.id },
  });

  if (!request) {
    return apiResponse(res, 404, 'Request not found');
  }

  // Validate cancellation is allowed
  const validation = validateStatusTransition(request.status, 'Cancelled');
  if (!validation.valid) {
    return apiResponse(res, 400, validation.message);
  }

  await request.update({ status: 'Cancelled' });

  await notifyStatusChange(request, 'Cancelled');

  return apiResponse(res, 200, 'Request cancelled successfully', { request });
});

module.exports = {
  createRequest,
  uploadRequestImage,
  getCustomerRequests,
  getShopRequests,
  getRequestDetails,
  updateRequestStatus,
  cancelRequest,
};
