const { Op } = require('sequelize');
const {
  Shop,
  ShopCategory,
  User,
  Notification,
  AuditLog,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');

/**
 * List all shops with filtering
 * GET /api/admin/shops
 */
const listShops = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, is_verified, is_active, category_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { city: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }
  if (is_verified !== undefined) where.is_verified = is_verified === 'true';
  if (is_active !== undefined) where.is_active = is_active === 'true';
  if (category_id) where.category_id = category_id;

  const { count, rows } = await Shop.findAndCountAll({
    where,
    include: [
      { model: User, as: 'owner', attributes: ['id', 'first_name', 'last_name', 'email'] },
      { model: ShopCategory, as: 'category', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Shops retrieved', {
    shops: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get shop details
 * GET /api/admin/shops/:id
 */
const getShopDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await Shop.findByPk(id, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'first_name', 'last_name', 'email', 'phone'] },
      { model: ShopCategory, as: 'category' },
    ],
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  return apiResponse(res, 200, 'Shop details retrieved', { shop });
});

/**
 * Approve a shop
 * PATCH /api/admin/shops/:id/approve
 */
const approveShop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await Shop.findByPk(id);
  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  if (shop.is_verified) {
    return apiResponse(res, 400, 'Shop is already approved');
  }

  await shop.update({ is_verified: true, is_active: true });

  // Send notification to shop owner
  await Notification.create({
    id: generateId(),
    user_id: shop.owner_id,
    title: 'Shop Approved',
    body: `Your shop "${shop.name}" has been approved and is now live.`,
    type: 'shop_approval',
    reference_type: 'shop',
    reference_id: shop.id,
  });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'approve_shop',
    entity_type: 'shop',
    entity_id: id,
    old_values: { is_verified: false },
    new_values: { is_verified: true },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, 'Shop approved successfully', { shop: { id, is_verified: true } });
});

/**
 * Reject a shop
 * PATCH /api/admin/shops/:id/reject
 */
const rejectShop = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const shop = await Shop.findByPk(id);
  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  await shop.update({ is_verified: false, is_active: false });

  // Send notification to shop owner
  await Notification.create({
    id: generateId(),
    user_id: shop.owner_id,
    title: 'Shop Rejected',
    body: `Your shop "${shop.name}" has been rejected. Reason: ${reason || 'Not specified'}`,
    type: 'shop_rejection',
    reference_type: 'shop',
    reference_id: shop.id,
  });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'reject_shop',
    entity_type: 'shop',
    entity_id: id,
    old_values: { is_active: shop.is_active },
    new_values: { is_active: false, rejection_reason: reason },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, 'Shop rejected', { shop: { id, is_verified: false, is_active: false } });
});

/**
 * Update shop status
 * PATCH /api/admin/shops/:id/status
 */
const updateShopStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const shop = await Shop.findByPk(id);
  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  const oldValues = { is_active: shop.is_active };
  await shop.update({ is_active });

  await AuditLog.create({
    user_id: req.user.id,
    action: is_active ? 'activate_shop' : 'deactivate_shop',
    entity_type: 'shop',
    entity_id: id,
    old_values: oldValues,
    new_values: { is_active },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, `Shop ${is_active ? 'activated' : 'deactivated'} successfully`, { shop: { id, is_active } });
});

module.exports = {
  listShops,
  getShopDetails,
  approveShop,
  rejectShop,
  updateShopStatus,
};
