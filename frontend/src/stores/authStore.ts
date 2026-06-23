import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types";
import { authAPI } from "@/lib/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const { user, token } = response.data.data;
          Cookies.set("auth_token", token, { expires: 30 });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, passwordConfirmation: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
          });
          const { user, token } = response.data.data;
          Cookies.set("auth_token", token, { expires: 30 });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      googleLogin: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.googleLogin({ token });
          const { user, token: authToken } = response.data.data;
          Cookies.set("auth_token", authToken, { expires: 30 });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Google login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      sendOTP: async (phone: string) => {
        set({ isLoading: true, error: null });
        try {
          await authAPI.sendOTP({ phone });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to send OTP",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyOTP: async (phone: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.verifyOTP({ phone, otp });
          const { user, token } = response.data.data;
          Cookies.set("auth_token", token, { expires: 30 });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "OTP verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch {
          // Continue with logout even if API call fails
        }
        Cookies.remove("auth_token");
        set({ user: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authAPI.me();
          set({ user: response.data.data, isAuthenticated: true, isLoading: false });
        } catch {
          Cookies.remove("auth_token");
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user: User) => set({ user, isAuthenticated: true }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "fmge-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
