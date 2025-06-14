import axiosInstance from './axiosInstance';

interface RegisterData {
  email: string;
  password: string;
  role: string;
  name?: string;
  phone?: string;
  company?: object;
}

interface VerifyOtpData {
  email: string; // Use email instead of userId
  otp: string;
}

interface ResendOtpData {
  email: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const api = {
  async register(data: RegisterData, signal?: AbortSignal) {
    const response = await axiosInstance.post('/auth/register', data, { signal });
    return response.data;
  },

  async verifyOtp(data: VerifyOtpData, signal?: AbortSignal) {
    const response = await axiosInstance.post('/auth/verify-otp', data, { signal });
    return response.data;
  },
  
  async resendOtp(data: ResendOtpData, signal?: AbortSignal) {
    const response = await axiosInstance.post('/auth/resend-otp', data, { signal });
    return response.data;
  },

  
  async login(data: LoginData, signal?: AbortSignal) {
    const response = await axiosInstance.post('/auth/login', data, { signal });
    return response.data;
  },
};