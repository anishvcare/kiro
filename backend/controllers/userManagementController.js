const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const {
  User,
  Role,
  UserRole,
  Customer,
  Shop,
  DeliveryAgent,
  DeliveryBoy,
  AuditLog,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');

/**
 * List all users with filtering
 * GET /api/admin/users
 */
const listUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search, is_active } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where[Op.or] = [
      { email: { [Op.like]: `%${search}%` } },
      { first_name: { [Op.like]: `%${search}%` } },
      { last_name: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }
  if (is_active !== undefined) {
    where.is_active = is_active === 'true';
  }

  const include = [{
    model: Role,
    as: 'roles',
    through: { attributes: [] },
    ...(role ? { where: { name: role } } : {}),
  }];

  const { count, rows } = await User.findAndCountAll({
    where,
    include,
    attributes: { exclude: ['password_hash', 'refresh_token', 'reset_password_token', 'reset_password_expires'] },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return apiResponse(res, 200, 'Users retrieved', {
    users: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get single user details
 * GET /api/admin/users/:id
 */
const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password_hash', 'refresh_token', 'reset_password_token', 'reset_password_expires'] },
    include: [
      { model: Role, as: 'roles', through: { attributes: [] } },
      { model: Shop, as: 'shops' },
      { model: Customer, as: 'customerProfile' },
      { model: DeliveryAgent, as: 'deliveryAgentProfile' },
      { model: DeliveryBoy, as: 'deliveryBoyProfile' },
    ],
  });

  if (!user) {
    return apiResponse(res, 404, 'User not found');
  }

  return apiResponse(res, 200, 'User details retrieved', { user });
});

/**
 * Update user status (activate/deactivate)
 * PATCH /api/admin/users/:id/status
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    return apiResponse(res, 404, 'User not found');
  }

  const oldValues = { is_active: user.is_active };
  await user.update({ is_active });

  await AuditLog.create({
    user_id: req.user.id,
    action: is_active ? 'activate_user' : 'deactivate_user',
    entity_type: 'user',
    entity_id: id,
    old_values: oldValues,
    new_values: { is_active },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, `User ${is_active ? 'activated' : 'deactivated'} successfully`, { user: { id, is_active } });
});

/**
 * Update user profile (name)
 * PATCH /api/admin/users/:id/profile
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    return apiResponse(res, 404, 'User not found');
  }

  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (email !== undefined && email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return apiResponse(res, 409, 'Email already in use');
    }
    updates.email = email;
  }
  await user.update(updates);

  return apiResponse(res, 200, 'User profile updated', {
    user: { id, first_name: user.first_name, last_name: user.last_name, email: user.email },
  });
});

/**
 * Update user role
 * PATCH /api/admin/users/:id/role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await User.findByPk(id, {
    include: [{ model: Role, as: 'roles', through: { attributes: [] } }],
  });

  if (!user) {
    return apiResponse(res, 404, 'User not found');
  }

  const roleRecord = await Role.findOne({ where: { name: role } });
  if (!roleRecord) {
    return apiResponse(res, 400, 'Invalid role specified');
  }

  const transaction = await sequelize.transaction();
  try {
    // Remove existing roles
    await UserRole.destroy({ where: { user_id: id }, transaction });

    // Assign new role
    await UserRole.create({ user_id: id, role_id: roleRecord.id }, { transaction });

    await AuditLog.create({
      user_id: req.user.id,
      action: 'update_user_role',
      entity_type: 'user',
      entity_id: id,
      old_values: { roles: user.roles.map((r) => r.name) },
      new_values: { roles: [role] },
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
    }, { transaction });

    await transaction.commit();

    return apiResponse(res, 200, 'User role updated successfully', { user: { id, roles: [role] } });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Reset a user's password (admin action).
 * PATCH /api/admin/users/:id/password  { password }
 */
const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || String(password).length < 6) {
    return apiResponse(res, 400, 'Password must be at least 6 characters');
  }

  const user = await User.findByPk(id);
  if (!user) {
    return apiResponse(res, 404, 'User not found');
  }

  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(String(password), salt);
  // Also clear any stored refresh token so old sessions can't linger.
  await user.update({ password_hash, refresh_token: null });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'reset_user_password',
    entity_type: 'user',
    entity_id: id,
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, 'Password reset successfully', { user: { id, email: user.email } });
});

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return apiResponse(res, 404, 'User not found');
  }

  // Soft delete - deactivate instead of destroying
  await user.update({ is_active: false });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'delete_user',
    entity_type: 'user',
    entity_id: id,
    old_values: { email: user.email, first_name: user.first_name },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, 'User deleted successfully');
});

module.exports = {
  listUsers,
  getUserDetails,
  updateUserStatus,
  updateUserProfile,
  updateUserRole,
  resetUserPassword,
  deleteUser,
};
