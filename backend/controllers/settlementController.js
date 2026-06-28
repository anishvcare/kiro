const {
  SettlementTransaction,
  CashCollection,
  PaymentTransaction,
  Shop,
  sequelize,
} = require('../models');
const { apiResponse, asyncHandler, generateId } = require('../utils/helpers');

/**
 * Record cash collection by delivery boy
 * POST /api/settlements/cash-collection
 */
const recordCashCollection = asyncHandler(async (req, res) => {
  const { delivery_assignment_id, amount } = req.body;

  if (!delivery_assignment_id || !amount) {
    return apiResponse(res, 400, 'Delivery assignment ID and amount are required');
  }

  if (parseFloat(amount) <= 0) {
    return apiResponse(res, 400, 'Amount must be greater than zero');
  }

  const collection = await CashCollection.create({
    id: generateId(),
    delivery_assignment_id,
    delivery_boy_id: req.user.id,
    amount: parseFloat(amount),
    collected_at: new Date(),
    settled: false,
  });

  return apiResponse(res, 201, 'Cash collection recorded', { collection });
});

/**
 * Verify a cash collection (by delivery agent or admin)
 * PUT /api/settlements/cash-collection/:id/verify
 */
const verifyCollection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { verified, notes } = req.body;

  const collection = await CashCollection.findByPk(id);

  if (!collection) {
    return apiResponse(res, 404, 'Cash collection not found');
  }

  if (collection.settled) {
    return apiResponse(res, 400, 'Collection has already been settled');
  }

  if (!verified) {
    // Reject the collection
    await collection.destroy();
    return apiResponse(res, 200, 'Cash collection rejected and removed');
  }

  // Create a settlement transaction for the verified collection
  const settlement = await SettlementTransaction.create({
    id: generateId(),
    from_type: 'delivery_boy',
    from_id: collection.delivery_boy_id,
    to_type: 'platform',
    to_id: req.user.id, // delivery agent or admin verifying
    amount: collection.amount,
    reference_type: 'cash_collection',
    reference_id: collection.id,
    status: 'pending',
    notes: notes || `Cash collection verified for assignment ${collection.delivery_assignment_id}`,
  });

  return apiResponse(res, 200, 'Cash collection verified', { settlement, collection });
});

/**
 * Settle funds to shop
 * POST /api/settlements/settle-to-shop
 */
const settleToShop = asyncHandler(async (req, res) => {
  const { shop_id, amount, payment_transaction_ids, notes } = req.body;

  if (!shop_id || !amount) {
    return apiResponse(res, 400, 'Shop ID and amount are required');
  }

  const shop = await Shop.findByPk(shop_id);
  if (!shop) {
    return apiResponse(res, 404, 'Shop not found');
  }

  const t = await sequelize.transaction();

  try {
    // Create settlement record
    const settlement = await SettlementTransaction.create({
      id: generateId(),
      from_type: 'platform',
      from_id: req.user.id,
      to_type: 'shop',
      to_id: shop_id,
      amount: parseFloat(amount),
      reference_type: 'shop_settlement',
      reference_id: null,
      status: 'completed',
      notes: notes || `Settlement to shop ${shop.name}`,
    }, { transaction: t });

    // Mark payment transactions as settled if provided
    if (payment_transaction_ids && payment_transaction_ids.length > 0) {
      await PaymentTransaction.update(
        { metadata: sequelize.literal(`JSON_SET(COALESCE(metadata, '{}'), '$.settled', true, '$.settlement_id', '${settlement.id}')`) },
        { where: { id: payment_transaction_ids }, transaction: t }
      );
    }

    // Mark related cash collections as settled
    if (payment_transaction_ids) {
      await CashCollection.update(
        { settled: true, settled_at: new Date() },
        {
          where: { delivery_assignment_id: payment_transaction_ids },
          transaction: t,
        }
      );
    }

    await t.commit();

    return apiResponse(res, 201, 'Settlement to shop recorded', { settlement });
  } catch (error) {
    await t.rollback();
    throw error;
  }
});

/**
 * Get settlement history
 * GET /api/settlements/history
 */
const getSettlementHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, shop_id } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (shop_id) {
    where.to_id = shop_id;
    where.to_type = 'shop';
  }

  const isAdmin = req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('super_admin'));
  if (!isAdmin) {
    // Non-admin: show only settlements involving their shop or them
    const { Op } = require('sequelize');
    where[Op.or] = [
      { from_id: req.user.id },
      { to_id: req.user.id },
    ];
  }

  const { count, rows: settlements } = await SettlementTransaction.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Settlement history retrieved', {
    settlements,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / parseInt(limit)),
    },
  });
});

/**
 * Get settlement report/summary
 * GET /api/settlements/report
 */
const getSettlementReport = asyncHandler(async (req, res) => {
  const { start_date, end_date, shop_id } = req.query;

  const where = {};

  if (start_date && end_date) {
    const { Op } = require('sequelize');
    where.created_at = {
      [Op.between]: [new Date(start_date), new Date(end_date)],
    };
  }

  if (shop_id) {
    where.to_id = shop_id;
    where.to_type = 'shop';
  }

  // Total settlements
  const totalSettled = await SettlementTransaction.sum('amount', {
    where: { ...where, status: 'completed' },
  }) || 0;

  const pendingSettlement = await SettlementTransaction.sum('amount', {
    where: { ...where, status: 'pending' },
  }) || 0;

  const totalCollections = await CashCollection.sum('amount', {
    where: shop_id ? { settled: false } : {},
  }) || 0;

  const settledCollections = await CashCollection.sum('amount', {
    where: { settled: true },
  }) || 0;

  // Count transactions
  const totalTransactions = await SettlementTransaction.count({ where });
  const completedTransactions = await SettlementTransaction.count({
    where: { ...where, status: 'completed' },
  });

  return apiResponse(res, 200, 'Settlement report generated', {
    report: {
      total_settled: parseFloat(totalSettled),
      pending_settlement: parseFloat(pendingSettlement),
      total_cash_collections: parseFloat(totalCollections),
      settled_cash_collections: parseFloat(settledCollections),
      total_transactions: totalTransactions,
      completed_transactions: completedTransactions,
      period: {
        start: start_date || 'all_time',
        end: end_date || 'current',
      },
    },
  });
});

/**
 * Get unsettled cash collections
 * GET /api/settlements/unsettled-collections
 */
const getUnsettledCollections = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows: collections } = await CashCollection.findAndCountAll({
    where: { settled: false },
    order: [['collected_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  return apiResponse(res, 200, 'Unsettled collections retrieved', {
    collections,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(count / parseInt(limit)),
    },
  });
});

module.exports = {
  recordCashCollection,
  verifyCollection,
  settleToShop,
  getSettlementHistory,
  getSettlementReport,
  getUnsettledCollections,
};
