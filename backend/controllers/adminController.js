const { Op } = require('sequelize');
const {
  User,
  Shop,
  DeliveryAssignment,
  PaymentTransaction,
  AuditLog,
  AdminSetting,
  Notification,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalShops,
    totalDeliveries,
    revenueResult,
  ] = await Promise.all([
    User.count(),
    Shop.count(),
    DeliveryAssignment.count({ where: { status: 'delivered' } }),
    PaymentTransaction.findOne({
      attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('amount')), 0), 'total']],
      where: { status: 'success' },
      raw: true,
    }),
  ]);

  const totalRevenue = parseFloat(revenueResult?.total || 0);

  return apiResponse(res, 200, 'Dashboard stats retrieved', {
    stats: {
      totalUsers,
      totalShops,
      totalDeliveries,
      totalRevenue,
    },
  });
});

/**
 * Get dashboard overview data
 * GET /api/admin/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    recentUsers,
    recentShops,
    pendingShops,
    recentActivity,
  ] = await Promise.all([
    User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
    }),
    Shop.findAll({
      attributes: ['id', 'name', 'is_verified', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
    }),
    Shop.count({ where: { is_verified: false } }),
    AuditLog.findAll({
      attributes: ['id', 'action', 'entity_type', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10,
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name'] }],
    }),
  ]);

  return apiResponse(res, 200, 'Dashboard data retrieved', {
    recentUsers,
    recentShops,
    pendingShops,
    recentActivity,
  });
});

/**
 * Get audit logs
 * GET /api/admin/audit-logs
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, action, entity_type, user_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (action) where.action = action;
  if (entity_type) where.entity_type = entity_type;
  if (user_id) where.user_id = user_id;

  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] }],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Audit logs retrieved', {
    logs: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get system settings
 * GET /api/admin/settings
 */
const getSystemSettings = asyncHandler(async (req, res) => {
  const settings = await AdminSetting.findAll({
    order: [['setting_key', 'ASC']],
  });

  return apiResponse(res, 200, 'System settings retrieved', { settings });
});

/**
 * Update system settings
 * PUT /api/admin/settings
 */
const updateSystemSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;

  if (!settings || !Array.isArray(settings)) {
    return apiResponse(res, 400, 'Settings array is required');
  }

  const transaction = await sequelize.transaction();

  try {
    for (const setting of settings) {
      await AdminSetting.upsert(
        {
          setting_key: setting.key,
          setting_value: setting.value,
          setting_type: setting.type || 'string',
          description: setting.description || null,
        },
        { transaction }
      );
    }

    await AuditLog.create({
      user_id: req.user.id,
      action: 'update_settings',
      entity_type: 'admin_settings',
      new_values: settings,
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    }, { transaction });

    await transaction.commit();

    const updatedSettings = await AdminSetting.findAll({
      order: [['setting_key', 'ASC']],
    });

    return apiResponse(res, 200, 'Settings updated successfully', { settings: updatedSettings });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Send system-wide notification
 * POST /api/admin/notifications
 */
const sendNotification = asyncHandler(async (req, res) => {
  const { title, body, type, user_ids } = req.body;

  if (!title || !body) {
    return apiResponse(res, 400, 'Title and body are required');
  }

  let targetUsers;
  if (user_ids && user_ids.length > 0) {
    targetUsers = user_ids;
  } else {
    const users = await User.findAll({ attributes: ['id'], where: { is_active: true } });
    targetUsers = users.map((u) => u.id);
  }

  const notifications = targetUsers.map((userId) => ({
    id: generateId(),
    user_id: userId,
    title,
    body,
    type: type || 'system',
  }));

  await Notification.bulkCreate(notifications);

  await AuditLog.create({
    user_id: req.user.id,
    action: 'send_notification',
    entity_type: 'notification',
    new_values: { title, body, type, recipientCount: targetUsers.length },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 201, 'Notifications sent successfully', {
    recipientCount: targetUsers.length,
  });
});

module.exports = {
  getStats,
  getDashboard,
  getAuditLogs,
  getSystemSettings,
  updateSystemSettings,
  sendNotification,
};
