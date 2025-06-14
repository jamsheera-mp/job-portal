import axiosInstance from './axiosInstance';

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
}

interface AuthResponse {
  user: User;
  redirectUrl: string;
}

class ApiService {
  async register(data: RegisterData, signal?: AbortSignal): Promise<{ message: string; email: string }> {
    const response = await axiosInstance.post('/auth/register', data, { signal });
    return response.data;
  }

  async resendOtp(data: { email: string }, signal?: AbortSignal): Promise<{ message: string }> {
    const response = await axiosInstance.post('/auth/resend-otp', data, { signal });
    return response.data;
  }

  async verifyOtp(data: VerifyOtpData, signal?: AbortSignal): Promise<AuthResponse> {
    const response = await axiosInstance.post('/auth/verify-otp', data, { signal });
    return response.data;
  }

  async login(data: LoginData, signal?: AbortSignal): Promise<AuthResponse> {
    const response = await axiosInstance.post('/auth/login', data, { signal });
    return response.data;
  }

  //  Google Sign-In
  googleSignIn(): void {
    const oauthUrl = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
    window.location.href = oauthUrl;
  }

  //  LinkedIn Sign-In
  linkedInSignIn(): void {
    const oauthUrl = `${import.meta.env.VITE_BACKEND_URL}/auth/linkedin`;
    window.location.href = oauthUrl;
  }
}

export const api = new ApiService();
