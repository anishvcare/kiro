import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const flowsApi = {
  getAll: () => api.get('/flows'),
  create: (data) => api.post('/flows', data),
  update: (id, data) => api.put(`/flows/${id}`, data),
  delete: (id) => api.delete(`/flows/${id}`),
  toggle: (id) => api.patch(`/flows/${id}/toggle`),
  seed: () => api.post('/flows/seed')
};

export const contactsApi = {
  getAll: (params) => api.get('/contacts', { params }),
  getStats: () => api.get('/contacts/stats/overview'),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`)
};

export const chatsApi = {
  getConversations: () => api.get('/chats'),
  getHistory: (phone) => api.get(`/chats/${phone}`),
  send: (phone, message) => api.post('/chats/send', { phone, message })
};

export default api;
