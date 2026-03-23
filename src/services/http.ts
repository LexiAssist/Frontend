import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@/env';

// Types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// Create axios instance
const httpClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_GATEWAY_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    // Currently using HTTP-only cookies for session
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle specific error cases
    if (error.response) {
      const { status } = error.response;

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }

      // Handle 403 Forbidden
      if (status === 403) {
        console.error('Access forbidden:', error.response.data);
      }

      // Handle 500 Server Error
      if (status >= 500) {
        console.error('Server error:', error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

// Typed HTTP methods
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.get<ApiResponse<T>>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.post<ApiResponse<T>>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.put<ApiResponse<T>>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.patch<ApiResponse<T>>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete<ApiResponse<T>>(url, config).then((res) => res.data),
};

// AI Proxy specific client (for Python AI Orchestrator)
export const aiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_AI_PROXY_URL,
  timeout: 60000, // Longer timeout for AI operations
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// AI HTTP methods
export const aiHttp = {
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    aiClient.post<T>(url, data, config).then((res) => res.data),

  get: <T>(url: string, config?: AxiosRequestConfig) =>
    aiClient.get<T>(url, config).then((res) => res.data),
};

export default httpClient;
