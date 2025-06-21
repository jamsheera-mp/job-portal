import axiosInstance from "./axiosInstance";

interface RegisterData {
  email: string;
  password: string;
  role: string;
  name?: string;
  phone?: string;
  company?: {
    name: string;
    logoUrl?: string;
    description?: string;
    website?: string;
    industry?: string;
    location?: string;
  };
}

interface VerifyOtpData {
  email: string;
  otp: string;
  userId?: string;
  isReset?: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  phone?: string;
  name?: string;
  password: string; // Added for password comparison
  company?: {
    name: string;
    logoUrl?: string;
    description?: string;
    website?: string;
    industry?: string;
    location?: string;
  };
}

interface AuthResponse {
  message?: string;
  userId?: string;
  user?: User;
  redirectUrl?: string;
}

interface ProfileUpdateData {
  company?: {
    name?: string;
    logoUrl?: string;
    description?: string;
    website?: string;
    industry?: string;
    location?: string;
  };
}

interface ProfileResponse {
  user: User;
}

class ApiService {
  async register(data: RegisterData, signal?: AbortSignal): Promise<{ message: string; email: string }> {
    console.log("[API] Register request:", data);
    try {
      const response = await axiosInstance.post("/auth/register", data, { signal });
      console.log("[API] Register response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Register error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async resendOtp(data: { email: string }, signal?: AbortSignal): Promise<{ message: string }> {
    console.log("[API] Resend OTP request:", data);
    try {
      const response = await axiosInstance.post("/auth/resend-otp", data, { signal });
      console.log("[API] Resend OTP response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Resend OTP error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async verifyOtp(data: VerifyOtpData, signal?: AbortSignal): Promise<AuthResponse> {
    console.log("[API] Verify OTP request:", { email: data.email, otp: "[REDACTED]", isReset: data.isReset });
    try {
      const response = await axiosInstance.post("/auth/verify-otp", data, { signal });
      console.log("[API] Verify OTP response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Verify OTP error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async login(data: LoginData, signal?: AbortSignal): Promise<AuthResponse> {
    console.log("[API] Login request:", data);
    try {
      const response = await axiosInstance.post("/auth/login", data, { signal });
      console.log("[API] Login response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Login error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async logout(signal?: AbortSignal): Promise<{ message: string }> {
    console.log("[API] Logout request");
    try {
      const response = await axiosInstance.post("/auth/logout", {}, { signal });
      console.log("[API] Logout response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Logout error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async fetchProfile(signal?: AbortSignal): Promise<ProfileResponse> {
    console.log("[API] Fetch profile request");
    try {
      const response = await axiosInstance.get("/profile", { signal });
      console.log("[API] Fetch profile response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Fetch profile error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async updateProfile(data: ProfileUpdateData, signal?: AbortSignal): Promise<ProfileResponse> {
    console.log("[API] Update profile request:", data);
    try {
      const response = await axiosInstance.patch("/profile", data, { signal });
      console.log("[API] Update profile response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Update profile error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async resetPassword(data: { email: string; otp: string; newPassword: string }, signal?: AbortSignal): Promise<{ message: string }> {
    console.log("[API] Reset password request:", { email: data.email, otp: "[REDACTED]", newPassword: "[REDACTED]" });
    try {
      const response = await axiosInstance.post("/auth/reset-password", data, { signal });
      console.log("[API] Reset password response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("[API] Reset password error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }
}

export const api = new ApiService();