const { Op } = require('sequelize');
const { ServiceArea, AuditLog } = require('../models');
const { apiResponse, asyncHandler } = require('../utils/helpers');

/**
 * List all service areas
 * GET /api/admin/service-areas
 */
const listServiceAreas = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, is_active } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { city: { [Op.like]: `%${search}%` } },
      { pincode: { [Op.like]: `%${search}%` } },
    ];
  }
  if (is_active !== undefined) {
    where.is_active = is_active === 'true';
  }

  const { count, rows } = await ServiceArea.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Service areas retrieved', {
    serviceAreas: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get single service area
 * GET /api/admin/service-areas/:id
 */
const getServiceArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const area = await ServiceArea.findByPk(id);

  if (!area) {
    return apiResponse(res, 404, 'Service area not found');
  }

  return apiResponse(res, 200, 'Service area retrieved', { serviceArea: area });
});

/**
 * Create a service area
 * POST /api/admin/service-areas
 */
const createServiceArea = asyncHandler(async (req, res) => {
  const { name, city, state, pincode, latitude, longitude, radius_km, is_active } = req.body;

  if (!name || !city) {
    return apiResponse(res, 400, 'Name and city are required');
  }

  const area = await ServiceArea.create({
    name,
    city,
    state,
    pincode,
    latitude,
    longitude,
    radius_km: radius_km || 5,
    is_active: is_active !== undefined ? is_active : true,
  });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'create_service_area',
    entity_type: 'service_area',
    entity_id: area.id.toString(),
    new_values: { name, city, state, pincode },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 201, 'Service area created successfully', { serviceArea: area });
});

/**
 * Update a service area
 * PUT /api/admin/service-areas/:id
 */
const updateServiceArea = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, city, state, pincode, latitude, longitude, radius_km, is_active } = req.body;

  const area = await ServiceArea.findByPk(id);
  if (!area) {
    return apiResponse(res, 404, 'Service area not found');
  }

  const oldValues = area.toJSON();

  await area.update({
    ...(name && { name }),
    ...(city && { city }),
    ...(state !== undefined && { state }),
    ...(pincode !== undefined && { pincode }),
    ...(latitude !== undefined && { latitude }),
    ...(longitude !== undefined && { longitude }),
    ...(radius_km !== undefined && { radius_km }),
    ...(is_active !== undefined && { is_active }),
  });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'update_service_area',
    entity_type: 'service_area',
    entity_id: id.toString(),
    old_values: oldValues,
    new_values: area.toJSON(),
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, 'Service area updated successfully', { serviceArea: area });
});

/**
 * Delete a service area
 * DELETE /api/admin/service-areas/:id
 */
const deleteServiceArea = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const area = await ServiceArea.findByPk(id);
  if (!area) {
    return apiResponse(res, 404, 'Service area not found');
  }

  await AuditLog.create({
    user_id: req.user.id,
    action: 'delete_service_area',
    entity_type: 'service_area',
    entity_id: id.toString(),
    old_values: area.toJSON(),
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  await area.destroy();

  return apiResponse(res, 200, 'Service area deleted successfully');
});

module.exports = {
  listServiceAreas,
  getServiceArea,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
};
