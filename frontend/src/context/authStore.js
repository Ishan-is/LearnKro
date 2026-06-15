import { create } from "zustand";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("learnkro_user") || "null"),
  token: localStorage.getItem("learnkro_token") || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("learnkro_token", data.token);
      localStorage.setItem("learnkro_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Login failed");
      throw error;
    }
  },

  register: async (name, email, password, role = "student") => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/register", { name, email, password, role });
      set({ isLoading: false });
      toast.success(data.message || "Account created! Please verify your email.");
      return data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Registration failed");
      throw error;
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp });
      localStorage.setItem("learnkro_token", data.token);
      localStorage.setItem("learnkro_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      toast.success("Email verified successfully! Welcome to LearnKro AI!");
      return data.user;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Verification failed");
      throw error;
    }
  },

  resendOtp: async (email) => {
    try {
      const { data } = await api.post("/auth/resend-otp", { email });
      toast.success(data.message || "A new OTP has been sent to your email.");
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      set({ isLoading: false });
      toast.success("Password reset link sent to your email!");
      return data;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to request password reset");
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.put(`/auth/reset-password/${token}`, { password });
      localStorage.setItem("learnkro_token", data.token);
      localStorage.setItem("learnkro_user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      toast.success("Password reset successfully! You are now logged in.");
      return data.user;
    } catch (error) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || "Failed to reset password");
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("learnkro_token");
    localStorage.removeItem("learnkro_user");
    set({ user: null, token: null });
    toast.success("Logged out successfully");
  },

  updateUser: (userData) => {
    const updated = { ...get().user, ...userData };
    localStorage.setItem("learnkro_user", JSON.stringify(updated));
    set({ user: updated });
  },

  fetchMe: async () => {
    const token = localStorage.getItem("learnkro_token");
    if (!token) return;
    
    try {
      const { data } = await api.get("/auth/me");
      localStorage.setItem("learnkro_user", JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      get().logout();
    }
  },
}));
