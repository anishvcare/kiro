import api from './api';

/**
 * Initiate a payment for a quotation
 */
export const initiatePayment = async (data) => {
  const response = await api.post('/payments/initiate', data);
  return response.data.data;
};

/**
 * Upload payment screenshot
 */
export const uploadPaymentScreenshot = async (transactionId, file) => {
  const formData = new FormData();
  formData.append('screenshot', file);
  const response = await api.post(`/payments/${transactionId}/screenshot`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (transactionId) => {
  const response = await api.get(`/payments/${transactionId}/status`);
  return response.data.data;
};

/**
 * Verify a payment (shop owner / admin)
 */
export const verifyPayment = async (transactionId, data) => {
  const response = await api.put(`/payments/${transactionId}/verify`, data);
  return response.data.data;
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (params = {}) => {
  const response = await api.get('/payments/history', { params });
  return response.data.data;
};

/**
 * Get payment for a quotation
 */
export const getPaymentByQuotation = async (quotationId) => {
  const response = await api.get(`/payments/quotation/${quotationId}`);
  return response.data.data;
};

/**
 * Record cash collection (delivery boy)
 */
export const recordCashCollection = async (data) => {
  const response = await api.post('/settlements/cash-collection', data);
  return response.data.data;
};

/**
 * Verify cash collection (delivery agent / admin)
 */
export const verifyCashCollection = async (collectionId, data) => {
  const response = await api.put(`/settlements/cash-collection/${collectionId}/verify`, data);
  return response.data.data;
};

/**
 * Settle funds to shop (admin)
 */
export const settleToShop = async (data) => {
  const response = await api.post('/settlements/settle-to-shop', data);
  return response.data.data;
};

/**
 * Get settlement history
 */
export const getSettlementHistory = async (params = {}) => {
  const response = await api.get('/settlements/history', { params });
  return response.data.data;
};

/**
 * Get settlement report (admin)
 */
export const getSettlementReport = async (params = {}) => {
  const response = await api.get('/settlements/report', { params });
  return response.data.data;
};

/**
 * Get unsettled collections (admin)
 */
export const getUnsettledCollections = async (params = {}) => {
  const response = await api.get('/settlements/unsettled-collections', { params });
  return response.data.data;
};

export default {
  initiatePayment,
  uploadPaymentScreenshot,
  getPaymentStatus,
  verifyPayment,
  getTransactionHistory,
  getPaymentByQuotation,
  recordCashCollection,
  verifyCashCollection,
  settleToShop,
  getSettlementHistory,
  getSettlementReport,
  getUnsettledCollections,
};
