import api from './api';

/**
 * Delivery boy posts their current GPS position for an assignment.
 */
export const postLocation = async (assignmentId, data) => {
  const response = await api.post(`/tracking/${assignmentId}/location`, data);
  return response.data;
};

/**
 * Get the latest known location for an assignment (customer live map).
 * Returns { latitude, longitude, speed, heading, accuracy, recorded_at, timestamp, is_live } or null.
 */
export const getLatestLocation = async (assignmentId) => {
  const response = await api.get(`/tracking/${assignmentId}/location`);
  return response.data.data ? response.data.data.location : null;
};

export default {
  postLocation,
  getLatestLocation,
};
