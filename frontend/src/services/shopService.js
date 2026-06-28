import api from './api';

/**
 * Register a new shop
 */
export const registerShop = async (shopData) => {
  const response = await api.post('/shop/register', shopData);
  return response.data.data;
};

/**
 * Get all shops owned by the current user
 */
export const getMyShops = async () => {
  const response = await api.get('/shop/my-shops');
  return response.data.data.shops;
};

/**
 * Get shop profile (owner view)
 */
export const getShopProfile = async (shopId) => {
  const response = await api.get(`/shop/${shopId}`);
  return response.data.data.shop;
};

/**
 * Get shop public profile
 */
export const getShopPublicProfile = async (shopId) => {
  const response = await api.get(`/shop/${shopId}/public`);
  return response.data.data.shop;
};

/**
 * Get shop dashboard stats
 */
export const getShopDashboard = async (shopId) => {
  const response = await api.get(`/shop/${shopId}/dashboard`);
  return response.data.data;
};

/**
 * Update shop profile
 */
export const updateShopProfile = async (shopId, data) => {
  const response = await api.put(`/shop/${shopId}/profile`, data);
  return response.data.data.shop;
};

/**
 * Update business hours
 */
export const updateBusinessHours = async (shopId, data) => {
  const response = await api.put(`/shop/${shopId}/hours`, data);
  return response.data.data.shop;
};

/**
 * Update payment details
 */
export const updatePaymentDetails = async (shopId, data) => {
  const response = await api.put(`/shop/${shopId}/payment`, data);
  return response.data.data;
};

/**
 * Upload shop logo
 */
export const uploadLogo = async (shopId, logoUrl) => {
  const response = await api.put(`/shop/${shopId}/logo`, { logo_url: logoUrl });
  return response.data.data.shop;
};

/**
 * Upload shop banner
 */
export const uploadBanner = async (shopId, bannerUrl) => {
  const response = await api.put(`/shop/${shopId}/banner`, { banner_url: bannerUrl });
  return response.data.data.shop;
};

/**
 * Toggle shop active/inactive status
 */
export const toggleShopStatus = async (shopId) => {
  const response = await api.patch(`/shop/${shopId}/status`);
  return response.data.data.shop;
};

export default {
  registerShop,
  getMyShops,
  getShopProfile,
  getShopPublicProfile,
  getShopDashboard,
  updateShopProfile,
  updateBusinessHours,
  updatePaymentDetails,
  uploadLogo,
  uploadBanner,
  toggleShopStatus,
};
