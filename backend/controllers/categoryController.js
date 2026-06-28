const { Op } = require('sequelize');
const { ShopCategory, Shop, AuditLog } = require('../models');
const { apiResponse, asyncHandler } = require('../utils/helpers');

/**
 * List all categories
 * GET /api/admin/categories
 */
const listCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, is_active } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (search) {
    where.name = { [Op.like]: `%${search}%` };
  }
  if (is_active !== undefined) {
    where.is_active = is_active === 'true';
  }

  const { count, rows } = await ShopCategory.findAndCountAll({
    where,
    include: [{ model: Shop, as: 'shops', attributes: ['id'] }],
    order: [['name', 'ASC']],
    limit: parseInt(limit),
    offset,
  });

  const categories = rows.map((cat) => ({
    ...cat.toJSON(),
    shopCount: cat.shops ? cat.shops.length : 0,
  }));

  return apiResponse(res, 200, 'Categories retrieved', {
    categories,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get single category
 * GET /api/admin/categories/:id
 */
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await ShopCategory.findByPk(id, {
    include: [{ model: Shop, as: 'shops', attributes: ['id', 'name', 'is_active'] }],
  });

  if (!category) {
    return apiResponse(res, 404, 'Category not found');
  }

  return apiResponse(res, 200, 'Category retrieved', { category });
});

/**
 * Create a category
 * POST /api/admin/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, icon, description, is_active } = req.body;

  if (!name) {
    return apiResponse(res, 400, 'Category name is required');
  }

  const existing = await ShopCategory.findOne({ where: { name } });
  if (existing) {
    return apiResponse(res, 409, 'Category with this name already exists');
  }

  const category = await ShopCategory.create({
    name,
    icon,
    description,
    is_active: is_active !== undefined ? is_active : true,
  });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'create_category',
    entity_type: 'shop_category',
    entity_id: category.id.toString(),
    new_values: { name, icon, description },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 201, 'Category created successfully', { category });
});

/**
 * Update a category
 * PUT /api/admin/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, icon, description, is_active } = req.body;

  const category = await ShopCategory.findByPk(id);
  if (!category) {
    return apiResponse(res, 404, 'Category not found');
  }

  if (name && name !== category.name) {
    const existing = await ShopCategory.findOne({ where: { name, id: { [Op.ne]: id } } });
    if (existing) {
      return apiResponse(res, 409, 'Category with this name already exists');
    }
  }

  const oldValues = { name: category.name, icon: category.icon, description: category.description, is_active: category.is_active };

  await category.update({
    ...(name && { name }),
    ...(icon !== undefined && { icon }),
    ...(description !== undefined && { description }),
    ...(is_active !== undefined && { is_active }),
  });

  await AuditLog.create({
    user_id: req.user.id,
    action: 'update_category',
    entity_type: 'shop_category',
    entity_id: id.toString(),
    old_values: oldValues,
    new_values: { name, icon, description, is_active },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  return apiResponse(res, 200, 'Category updated successfully', { category });
});

/**
 * Delete a category
 * DELETE /api/admin/categories/:id
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await ShopCategory.findByPk(id, {
    include: [{ model: Shop, as: 'shops', attributes: ['id'] }],
  });

  if (!category) {
    return apiResponse(res, 404, 'Category not found');
  }

  if (category.shops && category.shops.length > 0) {
    return apiResponse(res, 400, 'Cannot delete category that has shops assigned. Deactivate it instead.');
  }

  await AuditLog.create({
    user_id: req.user.id,
    action: 'delete_category',
    entity_type: 'shop_category',
    entity_id: id.toString(),
    old_values: { name: category.name },
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
  });

  await category.destroy();

  return apiResponse(res, 200, 'Category deleted successfully');
});

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
