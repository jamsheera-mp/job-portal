// frontend/src/core/services/axiosInstance.ts
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://localhost:5000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    console.log(`[Axios] Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[Axios] Request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[Axios] Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('[Axios] Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    if (error.response?.status === 401) {
      console.log('[Axios] Unauthorized, redirecting to /login');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;