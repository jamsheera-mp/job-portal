import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

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
  (config: AxiosRequestConfig) => {
    // Add any request modifications here (e.g., add auth token if needed)
    console.log(`Request sent to ${config.url}:`, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      console.error('Response error:', error.response.data);
      // Example: If 401 Unauthorized, redirect to login
      if (error.response.status === 401) {
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;