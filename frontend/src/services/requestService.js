import api from './api';

/**
 * Create a new customer request
 */
export const createRequest = async (requestData) => {
  const response = await api.post('/requests', requestData);
  return response.data.data;
};

/**
 * Upload images to a request
 */
export const uploadRequestImages = async (requestId, formData) => {
  const response = await api.post(`/requests/${requestId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

/**
 * Get customer's requests
 */
export const getMyRequests = async (params = {}) => {
  const response = await api.get('/requests/my-requests', { params });
  return response.data.data;
};

/**
 * Get shop's incoming requests
 */
export const getShopRequests = async (shopId, params = {}) => {
  const response = await api.get(`/requests/shop/${shopId}`, { params });
  return response.data.data;
};

/**
 * Get request details
 */
export const getRequestDetails = async (requestId) => {
  const response = await api.get(`/requests/${requestId}`);
  return response.data.data;
};

/**
 * Update request status
 */
export const updateRequestStatus = async (requestId, status) => {
  const response = await api.put(`/requests/${requestId}/status`, { status });
  return response.data.data;
};

/**
 * Cancel a request
 */
export const cancelRequest = async (requestId) => {
  const response = await api.put(`/requests/${requestId}/cancel`);
  return response.data.data;
};

export default {
  createRequest,
  uploadRequestImages,
  getMyRequests,
  getShopRequests,
  getRequestDetails,
  updateRequestStatus,
  cancelRequest,
};
