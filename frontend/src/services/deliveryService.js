import api from './api';

// ===== DELIVERY AGENT API CALLS =====

export const getConfirmedRequests = async () => {
  const response = await api.get('/delivery/agent/confirmed-requests');
  return response.data.data;
};

export const assignDeliveryBoy = async (data) => {
  const response = await api.post('/delivery/agent/assign', data);
  return response.data.data;
};

export const reassignDeliveryBoy = async (data) => {
  const response = await api.put('/delivery/agent/reassign', data);
  return response.data.data;
};

export const getActiveDeliveries = async () => {
  const response = await api.get('/delivery/agent/active-deliveries');
  return response.data.data;
};

export const getDeliveryBoyList = async () => {
  const response = await api.get('/delivery/agent/delivery-boys');
  return response.data.data;
};

export const getDeliveryBoyPerformance = async (deliveryBoyId) => {
  const response = await api.get(`/delivery/agent/performance/${deliveryBoyId}`);
  return response.data.data;
};

export const verifyCashCollection = async (collectionId, data) => {
  const response = await api.put(`/delivery/agent/verify-cash/${collectionId}`, data);
  return response.data.data;
};

export const getCashReport = async (params = {}) => {
  const response = await api.get('/delivery/agent/cash-report', { params });
  return response.data.data;
};

export const getSettlementReport = async (params = {}) => {
  const response = await api.get('/delivery/agent/settlement-report', { params });
  return response.data.data;
};

export const getPendingSettlements = async () => {
  const response = await api.get('/delivery/agent/pending-settlements');
  return response.data.data;
};

export const verifyPayment = async (requestId) => {
  const response = await api.put(`/delivery/agent/verify-payment/${requestId}`);
  return response.data.data;
};

export const settleToShop = async (requestId) => {
  const response = await api.put(`/delivery/agent/settle-to-shop/${requestId}`);
  return response.data.data;
};

// ===== DELIVERY BOY API CALLS =====

export const setOnlineStatus = async (is_available) => {
  const response = await api.put('/delivery/boy/status', { is_available });
  return response.data.data;
};

export const getOnlineStatus = async () => {
  const response = await api.get('/delivery/boy/status');
  return response.data.data;
};

export const getAssignedDeliveries = async () => {
  const response = await api.get('/delivery/boy/assigned');
  return response.data.data;
};

export const acceptDelivery = async (assignmentId) => {
  const response = await api.put(`/delivery/boy/accept/${assignmentId}`);
  return response.data.data;
};

export const rejectDelivery = async (assignmentId, reason) => {
  const response = await api.put(`/delivery/boy/reject/${assignmentId}`, { reason });
  return response.data.data;
};

export const markReachedShop = async (assignmentId) => {
  const response = await api.put(`/delivery/boy/reached-shop/${assignmentId}`);
  return response.data.data;
};

export const markPickedUp = async (assignmentId) => {
  const response = await api.put(`/delivery/boy/picked-up/${assignmentId}`);
  return response.data.data;
};

export const markOutForDelivery = async (assignmentId) => {
  const response = await api.put(`/delivery/boy/out-for-delivery/${assignmentId}`);
  return response.data.data;
};

export const markReachedCustomer = async (assignmentId) => {
  const response = await api.put(`/delivery/boy/reached-customer/${assignmentId}`);
  return response.data.data;
};

export const markCashCollected = async (assignmentId) => {
  const response = await api.put(`/delivery/boy/cash-collected/${assignmentId}`);
  return response.data.data;
};

export const markDelivered = async (assignmentId) => {
  const response = await api.put(`/delivery/boy/delivered/${assignmentId}`);
  return response.data.data;
};

export const submitCashCollection = async (data) => {
  const response = await api.post('/delivery/boy/cash-collection', data);
  return response.data.data;
};

export const uploadDeliveryProof = async (assignmentId, data) => {
  const isForm = typeof FormData !== 'undefined' && data instanceof FormData;
  const response = await api.post(
    `/delivery/boy/proof/${assignmentId}`,
    data,
    isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined
  );
  return response.data.data;
};

export const verifyOTP = async (assignmentId, otp) => {
  const response = await api.post(`/delivery/boy/verify-otp/${assignmentId}`, { otp });
  return response.data.data;
};

export const getDailyDeliveries = async () => {
  const response = await api.get('/delivery/boy/daily-deliveries');
  return response.data.data;
};

export const getEarnings = async (params = {}) => {
  const response = await api.get('/delivery/boy/earnings', { params });
  return response.data.data;
};

export const getDeliveryHistory = async (params = {}) => {
  const response = await api.get('/delivery/boy/history', { params });
  return response.data.data;
};

export default {
  // Agent
  getConfirmedRequests,
  assignDeliveryBoy,
  reassignDeliveryBoy,
  getActiveDeliveries,
  getDeliveryBoyList,
  getDeliveryBoyPerformance,
  verifyCashCollection,
  getCashReport,
  getSettlementReport,
  getPendingSettlements,
  verifyPayment,
  settleToShop,
  // Boy
  setOnlineStatus,
  getAssignedDeliveries,
  acceptDelivery,
  rejectDelivery,
  markReachedShop,
  markPickedUp,
  markOutForDelivery,
  markReachedCustomer,
  markCashCollected,
  markDelivered,
  submitCashCollection,
  uploadDeliveryProof,
  verifyOTP,
  getDailyDeliveries,
  getEarnings,
  getDeliveryHistory,
};
