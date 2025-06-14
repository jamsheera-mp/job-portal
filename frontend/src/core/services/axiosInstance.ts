import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const API_URL = 'http://localhost:5000/api';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Enable sending cookies (for HttpOnly cookies)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add any request modifications here (e.g., add auth token if needed)
    console.log(`Request sent to ${config.url}:`, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Optional: Log all requests (for debugging)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) : InternalAxiosRequestConfig=> {
    console.log(` Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error(' Request error:', error);
    return Promise.reject(error);
  }
);

// Optional: Handle all responses/errors globally
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response) {
      console.error(' Response error:', error.response.data);
      if (error.response.status === 401) {
        window.location.href = '/login'; // or show toast
      }
    } else {
      console.error(' Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;