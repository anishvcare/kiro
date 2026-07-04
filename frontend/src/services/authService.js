import api from './api';

const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Request a WhatsApp OTP for the given phone number.
  requestOtp: async ({ phone }) => {
    const response = await api.post('/auth/otp/send', { phone });
    return response.data;
  },

  // Verify the WhatsApp OTP and receive an app session (creates account if new).
  verifyOtp: async ({ phone, otp, first_name, last_name }) => {
    const response = await api.post('/auth/otp/verify', { phone, otp, first_name, last_name });
    return response.data;
  },

  // Exchange a verified Firebase phone ID token for our app session (optional).
  phoneLogin: async ({ idToken, first_name, last_name }) => {
    const response = await api.post('/auth/phone-login', {
      id_token: idToken,
      first_name,
      last_name,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refresh_token: refreshToken });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
