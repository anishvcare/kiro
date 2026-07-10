import api from './api';

/**
 * Submit (or update) the current customer's rating + review for a shop, tied to
 * a delivered order.
 */
export const submitShopRating = async ({ requestId, score, comment }) => {
  const response = await api.post('/ratings', { request_id: requestId, score, comment });
  return response.data.data;
};

/**
 * Get the current customer's existing rating for an order (or null).
 */
export const getMyRatingForRequest = async (requestId) => {
  const response = await api.get('/ratings/my', { params: { request_id: requestId } });
  return response.data.data;
};

/**
 * Get a shop's ratings + reviews.
 */
export const getShopRatings = async (shopId) => {
  const response = await api.get(`/ratings/shop/${shopId}`);
  return response.data.data;
};

export default {
  submitShopRating,
  getMyRatingForRequest,
  getShopRatings,
};
