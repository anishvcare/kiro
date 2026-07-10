/**
 * Rating Controller
 * Lets a customer rate a shop and leave a written review after their order is
 * delivered, and keeps the shop's aggregate rating (shop.rating / total_ratings)
 * up to date.
 */

const { Rating, Review, Shop, Customer, CustomerRequest, User, sequelize } = require('../models');
const { apiResponse, asyncHandler } = require('../utils/helpers');

// Statuses at/after which the customer may rate the shop.
const RATEABLE_STATUSES = ['Delivered', 'Payment Verified', 'Payment Settled To Shop', 'Completed'];

/**
 * Recompute a shop's average rating + total from all its shop ratings.
 */
const recomputeShopRating = async (shopId) => {
  const rows = await Rating.findAll({
    where: { target_type: 'shop', target_id: shopId },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('score')), 'avg'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'cnt'],
    ],
    raw: true,
  });
  const avg = parseFloat(rows[0] && rows[0].avg) || 0;
  const cnt = parseInt(rows[0] && rows[0].cnt, 10) || 0;
  await Shop.update(
    { rating: avg.toFixed(2), total_ratings: cnt },
    { where: { id: shopId } }
  );
  return { rating: parseFloat(avg.toFixed(2)), total_ratings: cnt };
};

/**
 * Create or update a customer's rating (+ review) for a shop, tied to an order.
 * POST /api/ratings   body: { request_id, score (1-5), comment }
 */
const createRating = asyncHandler(async (req, res) => {
  const { request_id, comment } = req.body;
  const score = parseInt(req.body.score, 10);

  if (!request_id || !score || score < 1 || score > 5) {
    return apiResponse(res, 400, 'An order and a score between 1 and 5 are required');
  }

  const customer = await Customer.findOne({ where: { user_id: req.user.id } });
  if (!customer) {
    return apiResponse(res, 403, 'Customer profile not found');
  }

  const request = await CustomerRequest.findByPk(request_id);
  if (!request) {
    return apiResponse(res, 404, 'Order not found');
  }
  if (request.customer_id !== customer.id) {
    return apiResponse(res, 403, 'You can only rate your own orders');
  }
  if (!RATEABLE_STATUSES.includes(request.status)) {
    return apiResponse(res, 400, 'You can rate the shop only after the order is delivered');
  }

  // One rating per order — update the existing one if present.
  let rating = await Rating.findOne({
    where: { user_id: req.user.id, target_type: 'shop', request_id },
  });

  if (rating) {
    rating.score = score;
    await rating.save();
    const existingReview = await Review.findOne({ where: { rating_id: rating.id } });
    if (existingReview) {
      existingReview.comment = comment || null;
      await existingReview.save();
    } else if (comment) {
      await Review.create({ rating_id: rating.id, comment });
    }
  } else {
    rating = await Rating.create({
      user_id: req.user.id,
      target_type: 'shop',
      target_id: request.shop_id,
      request_id,
      score,
    });
    if (comment) {
      await Review.create({ rating_id: rating.id, comment });
    }
  }

  const aggregate = await recomputeShopRating(request.shop_id);

  return apiResponse(res, 200, 'Thank you for your feedback', {
    rating: { id: rating.id, score: rating.score, comment: comment || null },
    shop: aggregate,
  });
});

/**
 * Get the current customer's rating for a specific order (if any).
 * GET /api/ratings/my?request_id=...
 */
const getMyRating = asyncHandler(async (req, res) => {
  const { request_id } = req.query;
  if (!request_id) {
    return apiResponse(res, 400, 'request_id is required');
  }

  const rating = await Rating.findOne({
    where: { user_id: req.user.id, target_type: 'shop', request_id },
    include: [{ model: Review, as: 'review', attributes: ['comment'] }],
  });

  return apiResponse(res, 200, 'Rating retrieved', {
    rating: rating
      ? { id: rating.id, score: rating.score, comment: rating.review ? rating.review.comment : null }
      : null,
  });
});

/**
 * List a shop's ratings + reviews (public, for shop profile display).
 * GET /api/ratings/shop/:shopId
 */
const getShopRatings = asyncHandler(async (req, res) => {
  const { shopId } = req.params;

  const ratings = await Rating.findAll({
    where: { target_type: 'shop', target_id: shopId },
    include: [
      { model: Review, as: 'review', attributes: ['comment'] },
      { model: User, as: 'user', attributes: ['first_name', 'last_name'] },
    ],
    order: [['created_at', 'DESC']],
    limit: 50,
  });

  const shop = await Shop.findByPk(shopId, { attributes: ['id', 'rating', 'total_ratings'] });

  const reviews = ratings.map((r) => ({
    id: r.id,
    score: r.score,
    comment: r.review ? r.review.comment : null,
    reviewer: r.user ? `${r.user.first_name || ''} ${r.user.last_name || ''}`.trim() || 'Customer' : 'Customer',
    created_at: r.created_at,
  }));

  return apiResponse(res, 200, 'Shop ratings retrieved', {
    rating: shop ? parseFloat(shop.rating) || 0 : 0,
    total_ratings: shop ? shop.total_ratings || 0 : 0,
    reviews,
  });
});

module.exports = {
  createRating,
  getMyRating,
  getShopRatings,
  recomputeShopRating,
};
