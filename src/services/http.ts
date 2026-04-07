import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { env } from '@/env';
import { useAuthStore } from '@/store/authStore';

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
export const httpClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_GATEWAY_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Subscribe to token refresh
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers with new token or null if failed
function onTokenRefreshed(token: string | null) {
  refreshSubscribers.forEach((callback) => callback(token ? token : ''));
  refreshSubscribers = [];
}

// Request interceptor
httpClient.interceptors.request.use(
  async (config) => {
    const url = config.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
    
    // Skip all token refresh loops for auth endpoints
    if (isAuthEndpoint) {
      return config;
    }

    // Get token from store
    const { accessToken, isTokenExpired, refreshAccessToken } = useAuthStore.getState();
    
    // If token is expired, try to refresh it
    if (accessToken && isTokenExpired()) {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshed = await refreshAccessToken();
        isRefreshing = false;
        
        if (refreshed) {
          const { accessToken: newToken } = useAuthStore.getState();
          onTokenRefreshed(newToken!);
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          onTokenRefreshed(null); // prevent hanging promises on failure
        }
      } else {
        // Wait for token refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            resolve(config);
          });
        });
      }
    } else if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
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
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _skipLogout?: boolean };
    
    if (error.response) {
      const { status } = error.response;

      // Skip auth retry for auth endpoints to prevent infinite loops
      // Also skip for AI endpoints to prevent logout on AI service errors
      const url = originalRequest.url || '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/logout') || url.includes('/auth/register') || url.includes('/auth/refresh');
      const isAIEndpoint = url.includes('/ai/');

      // Handle 401 Unauthorized - try to refresh token
      // Skip auth endpoints only
      if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true;
        
        const { refreshAccessToken, logout, accessToken } = useAuthStore.getState();
        
        // If no access token, user is not logged in - don't try to refresh
        if (!accessToken) {
          return Promise.reject(error);
        }
        
        try {
          const refreshed = await refreshAccessToken();
          
          if (refreshed) {
            const { accessToken: newToken } = useAuthStore.getState();
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            };
            return httpClient(originalRequest);
          } else {
            // Refresh failed - mark as logged out but don't redirect aggressively
            console.error('Token refresh failed, logging out');
            logout();
            // Only redirect if we're on a protected page (not login/register)
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              // Use a small delay to let the logout complete
              setTimeout(() => {
                window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
              }, 100);
            }
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          logout();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            setTimeout(() => {
              window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            }, 100);
          }
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

// Typed HTTP methods - unwraps ApiResponse wrapper to return raw data
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.get<ApiResponse<T>>(url, config).then((res) => res.data.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.post<ApiResponse<T>>(url, data, config).then((res) => res.data.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.put<ApiResponse<T>>(url, data, config).then((res) => res.data.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    httpClient.patch<ApiResponse<T>>(url, data, config).then((res) => res.data.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    httpClient.delete<ApiResponse<T>>(url, config).then((res) => res.data.data),
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

// Apply same interceptors to AI client
aiClient.interceptors.request.use(
  async (config) => {
    const { accessToken, isTokenExpired, refreshAccessToken } = useAuthStore.getState();
    
    if (accessToken && isTokenExpired()) {
      if (!isRefreshing) {
        isRefreshing = true;
        await refreshAccessToken();
        isRefreshing = false;
      }
    }
    
    const { accessToken: currentToken } = useAuthStore.getState();
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

aiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      // Don't await logout to avoid recursion
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// AI HTTP methods
export const aiHttp = {
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    aiClient.post<T>(url, data, config).then((res) => res.data),

  get: <T>(url: string, config?: AxiosRequestConfig) =>
    aiClient.get<T>(url, config).then((res) => res.data),
};

export default httpClient;
