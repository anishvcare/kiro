const { Op } = require('sequelize');
const {
  Shop,
  ShopCategory,
  ShopKeyword,
  ShopPaymentAccount,
  CustomerRequest,
  Quotation,
  User,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');

/**
 * Register a new shop
 * POST /api/shop/register
 */
const registerShop = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category_id,
    address,
    latitude,
    longitude,
    city,
    pincode,
    phone,
    whatsapp,
    email,
    opening_time,
    closing_time,
    working_days,
    keywords,
    upi_id,
    upi_phone,
    bharatpe_id,
  } = req.body;

  if (!name || !address) {
    return apiResponse(res, 400, 'Shop name and address are required');
  }

  const transaction = await sequelize.transaction();

  try {
    // Create the shop
    const shop = await Shop.create({
      id: generateId(),
      owner_id: req.user.id,
      name,
      description,
      category_id: category_id || null,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      city: city || null,
      pincode: pincode || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      email: email || null,
      opening_time: opening_time || null,
      closing_time: closing_time || null,
      working_days: working_days || null,
      is_active: true,
      is_verified: false,
    }, { transaction });

    // Add keywords if provided
    if (keywords && Array.isArray(keywords) && keywords.length > 0) {
      const keywordRecords = keywords.map((kw) => ({
        shop_id: shop.id,
        keyword: kw.trim(),
      }));
      await ShopKeyword.bulkCreate(keywordRecords, { transaction });
    }

    // Add payment details if provided
    if (upi_id || upi_phone || bharatpe_id) {
      const paymentDetails = {};
      if (upi_id) paymentDetails.upi_id = upi_id;
      if (upi_phone) paymentDetails.upi_phone = upi_phone;
      if (bharatpe_id) paymentDetails.bharatpe_id = bharatpe_id;

      await ShopPaymentAccount.create({
        shop_id: shop.id,
        payment_method_id: 1, // Default payment method
        account_details: paymentDetails,
        is_primary: true,
        is_active: true,
      }, { transaction });
    }

    await transaction.commit();

    const shopWithDetails = await Shop.findByPk(shop.id, {
      include: [
        { model: ShopCategory, as: 'category', attributes: ['id', 'name', 'icon'] },
        { model: ShopKeyword, as: 'keywords', attributes: ['keyword'] },
        { model: ShopPaymentAccount, as: 'paymentAccounts' },
      ],
    });

    return apiResponse(res, 201, 'Shop registered successfully', { shop: shopWithDetails });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
});

/**
 * Update shop profile
 * PUT /api/shop/:id/profile
 */
const updateShopProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category_id,
    address,
    latitude,
    longitude,
    city,
    pincode,
    phone,
    whatsapp,
    email,
    keywords,
  } = req.body;

  const shop = await Shop.findOne({
    where: { id, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  // Update shop fields
  const updateData = {};
  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (category_id) updateData.category_id = category_id;
  if (address) updateData.address = address;
  if (latitude !== undefined) updateData.latitude = latitude;
  if (longitude !== undefined) updateData.longitude = longitude;
  if (city !== undefined) updateData.city = city;
  if (pincode !== undefined) updateData.pincode = pincode;
  if (phone !== undefined) updateData.phone = phone;
  if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
  if (email !== undefined) updateData.email = email;

  await shop.update(updateData);

  // Update keywords if provided
  if (keywords && Array.isArray(keywords)) {
    await ShopKeyword.destroy({ where: { shop_id: id } });
    if (keywords.length > 0) {
      const keywordRecords = keywords.map((kw) => ({
        shop_id: id,
        keyword: kw.trim(),
      }));
      await ShopKeyword.bulkCreate(keywordRecords);
    }
  }

  const updatedShop = await Shop.findByPk(id, {
    include: [
      { model: ShopCategory, as: 'category', attributes: ['id', 'name', 'icon'] },
      { model: ShopKeyword, as: 'keywords', attributes: ['keyword'] },
    ],
  });

  return apiResponse(res, 200, 'Shop profile updated successfully', { shop: updatedShop });
});

/**
 * Update business hours
 * PUT /api/shop/:id/hours
 */
const updateBusinessHours = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { opening_time, closing_time, working_days } = req.body;

  const shop = await Shop.findOne({
    where: { id, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  await shop.update({
    opening_time: opening_time || shop.opening_time,
    closing_time: closing_time || shop.closing_time,
    working_days: working_days || shop.working_days,
  });

  return apiResponse(res, 200, 'Business hours updated successfully', { shop });
});

/**
 * Update payment details
 * PUT /api/shop/:id/payment
 */
const updatePaymentDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { upi_id, upi_phone, bharatpe_id } = req.body;

  const shop = await Shop.findOne({
    where: { id, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  const paymentDetails = {};
  if (upi_id) paymentDetails.upi_id = upi_id;
  if (upi_phone) paymentDetails.upi_phone = upi_phone;
  if (bharatpe_id) paymentDetails.bharatpe_id = bharatpe_id;

  // Upsert payment account
  const existingAccount = await ShopPaymentAccount.findOne({
    where: { shop_id: id, is_primary: true },
  });

  if (existingAccount) {
    await existingAccount.update({ account_details: paymentDetails });
  } else {
    await ShopPaymentAccount.create({
      shop_id: id,
      payment_method_id: 1,
      account_details: paymentDetails,
      is_primary: true,
      is_active: true,
    });
  }

  return apiResponse(res, 200, 'Payment details updated successfully', {
    paymentDetails,
  });
});

/**
 * Upload shop logo
 * PUT /api/shop/:id/logo
 */
const uploadLogo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { logo_url } = req.body;

  const shop = await Shop.findOne({
    where: { id, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  await shop.update({ logo_url });

  return apiResponse(res, 200, 'Logo updated successfully', { shop });
});

/**
 * Upload shop banner
 * PUT /api/shop/:id/banner
 */
const uploadBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { banner_url } = req.body;

  const shop = await Shop.findOne({
    where: { id, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  await shop.update({ banner_url });

  return apiResponse(res, 200, 'Banner updated successfully', { shop });
});

/**
 * Get shop profile (owner view)
 * GET /api/shop/:id
 */
const getShopProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await Shop.findOne({
    where: { id, owner_id: req.user.id },
    include: [
      { model: ShopCategory, as: 'category', attributes: ['id', 'name', 'icon'] },
      { model: ShopKeyword, as: 'keywords', attributes: ['keyword'] },
      { model: ShopPaymentAccount, as: 'paymentAccounts' },
    ],
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  return apiResponse(res, 200, 'Shop profile retrieved', { shop });
});

/**
 * Get shop public profile (customer view)
 * GET /api/shop/:id/public
 */
const getShopPublicProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await Shop.findOne({
    where: { id, is_active: true },
    include: [
      { model: ShopCategory, as: 'category', attributes: ['id', 'name', 'icon'] },
      { model: ShopKeyword, as: 'keywords', attributes: ['keyword'] },
    ],
    attributes: {
      exclude: ['owner_id'],
    },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  return apiResponse(res, 200, 'Shop public profile retrieved', { shop });
});

/**
 * Toggle shop active/inactive status
 * PATCH /api/shop/:id/status
 */
const toggleShopStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await Shop.findOne({
    where: { id, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  await shop.update({ is_active: !shop.is_active });

  return apiResponse(res, 200, `Shop ${shop.is_active ? 'activated' : 'deactivated'} successfully`, { shop });
});

/**
 * Get all shops owned by the current user
 * GET /api/shop/my-shops
 */
const getMyShops = asyncHandler(async (req, res) => {
  const shops = await Shop.findAll({
    where: { owner_id: req.user.id },
    include: [
      { model: ShopCategory, as: 'category', attributes: ['id', 'name', 'icon'] },
    ],
    order: [['created_at', 'DESC']],
  });

  return apiResponse(res, 200, 'Shops retrieved', { shops });
});

/**
 * Get shop dashboard stats
 * GET /api/shop/:id/dashboard
 */
const getShopDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await Shop.findOne({
    where: { id, owner_id: req.user.id },
  });

  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  const [totalRequests, activeRequests, totalQuotations] = await Promise.all([
    CustomerRequest.count({ where: { shop_id: id } }),
    CustomerRequest.count({ where: { shop_id: id, status: { [Op.in]: ['pending', 'accepted'] } } }),
    Quotation.count({ where: { shop_id: id } }),
  ]);

  return apiResponse(res, 200, 'Shop dashboard data retrieved', {
    shop,
    stats: {
      totalRequests,
      activeRequests,
      totalQuotations,
      rating: parseFloat(shop.rating) || 0,
      totalRatings: shop.total_ratings || 0,
    },
  });
});

module.exports = {
  registerShop,
  updateShopProfile,
  updateBusinessHours,
  updatePaymentDetails,
  uploadLogo,
  uploadBanner,
  getShopProfile,
  getShopPublicProfile,
  toggleShopStatus,
  getMyShops,
  getShopDashboard,
};
