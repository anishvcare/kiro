import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth_token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  googleLogin: (data: { token: string }) =>
    api.post("/auth/google", data),
  sendOTP: (data: { phone: string }) =>
    api.post("/auth/otp/send", data),
  verifyOTP: (data: { phone: string; otp: string }) =>
    api.post("/auth/otp/verify", data),
  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),
  resetPassword: (data: { email: string; token: string; password: string; password_confirmation: string }) =>
    api.post("/auth/reset-password", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getTodayTests: () => api.get("/dashboard/today-tests"),
};

// Test API
export const testAPI = {
  getDailyChallenge: (type: "morning" | "evening") =>
    api.get(`/tests/daily/${type}`),
  startTest: (testId: number) => api.post(`/tests/${testId}/start`),
  submitAnswer: (attemptId: number, data: { question_id: number; selected_option: string; time_taken: number }) =>
    api.post(`/tests/attempts/${attemptId}/answer`, data),
  completeTest: (attemptId: number) =>
    api.post(`/tests/attempts/${attemptId}/complete`),
  getTestResult: (attemptId: number) =>
    api.get(`/tests/attempts/${attemptId}/result`),
  getGrandMock: () => api.get("/tests/grand-mock"),
};

// Subject API
export const subjectAPI = {
  getAll: () => api.get("/subjects"),
  getById: (id: number) => api.get(`/subjects/${id}`),
  getTopics: (subjectId: number) => api.get(`/subjects/${subjectId}/topics`),
  getPracticeTest: (subjectId: number, topicId?: number) =>
    api.get(`/subjects/${subjectId}/practice`, { params: { topic_id: topicId } }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get("/analytics/overview"),
  getSubjectPerformance: () => api.get("/analytics/subjects"),
  getWeaknesses: () => api.get("/analytics/weaknesses"),
  getDailyProgress: (days?: number) =>
    api.get("/analytics/daily", { params: { days } }),
};

// Leaderboard API
export const leaderboardAPI = {
  getGlobal: (params?: { period?: string; page?: number }) =>
    api.get("/leaderboard", { params }),
  getByUniversity: (university: string) =>
    api.get("/leaderboard/university", { params: { university } }),
  getByCountry: (country: string) =>
    api.get("/leaderboard/country", { params: { country } }),
};

// Challenge API
export const challengeAPI = {
  getCurrent: () => api.get("/challenge/current"),
  start: () => api.post("/challenge/start"),
  getProgress: () => api.get("/challenge/progress"),
};

// Subscription API
export const subscriptionAPI = {
  getPlans: () => api.get("/subscriptions/plans"),
  subscribe: (data: { plan: string; payment_method: string }) =>
    api.post("/subscriptions/subscribe", data),
  cancel: () => api.post("/subscriptions/cancel"),
  getInvoices: () => api.get("/subscriptions/invoices"),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
  registerDevice: (data: { token: string; platform: string }) =>
    api.post("/notifications/register-device", data),
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard"),
  
  // Users
  getUsers: (params?: { page?: number; search?: string }) =>
    api.get("/admin/users", { params }),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  updateUser: (id: number, data: Partial<any>) =>
    api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  
  // Questions
  getQuestions: (params?: { page?: number; subject_id?: number; status?: string }) =>
    api.get("/admin/questions", { params }),
  createQuestion: (data: any) => api.post("/admin/questions", data),
  updateQuestion: (id: number, data: any) =>
    api.put(`/admin/questions/${id}`, data),
  deleteQuestion: (id: number) => api.delete(`/admin/questions/${id}`),
  bulkImport: (file: FormData) =>
    api.post("/admin/questions/import", file, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  
  // Subjects
  getSubjects: () => api.get("/admin/subjects"),
  createSubject: (data: any) => api.post("/admin/subjects", data),
  updateSubject: (id: number, data: any) =>
    api.put(`/admin/subjects/${id}`, data),
  deleteSubject: (id: number) => api.delete(`/admin/subjects/${id}`),
  
  // Notifications
  sendNotification: (data: { title: string; body: string; target: string }) =>
    api.post("/admin/notifications/send", data),
  
  // Reports
  getReports: (type: string, params?: any) =>
    api.get(`/admin/reports/${type}`, { params }),
};
