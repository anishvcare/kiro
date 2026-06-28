import api from './api';

/**
 * Create a quotation
 */
export const createQuotation = async (quotationData) => {
  const response = await api.post('/quotations', quotationData);
  return response.data.data;
};

/**
 * Update a quotation
 */
export const updateQuotation = async (quotationId, data) => {
  const response = await api.put(`/quotations/${quotationId}`, data);
  return response.data.data;
};

/**
 * Get a quotation by ID
 */
export const getQuotation = async (quotationId) => {
  const response = await api.get(`/quotations/${quotationId}`);
  return response.data.data;
};

/**
 * Accept a quotation
 */
export const acceptQuotation = async (quotationId) => {
  const response = await api.put(`/quotations/${quotationId}/accept`);
  return response.data.data;
};

/**
 * Reject a quotation
 */
export const rejectQuotation = async (quotationId, reason = '') => {
  const response = await api.put(`/quotations/${quotationId}/reject`, { reason });
  return response.data.data;
};

/**
 * Get quotations for a request
 */
export const getQuotationsByRequest = async (requestId) => {
  const response = await api.get(`/quotations/request/${requestId}`);
  return response.data.data;
};

export default {
  createQuotation,
  updateQuotation,
  getQuotation,
  acceptQuotation,
  rejectQuotation,
  getQuotationsByRequest,
};
