/**
 * HTTP Client with Fetch API
 * 
 * Base HTTP client using native fetch API for all backend communication.
 * Implements automatic token refresh, retry logic, and error handling.
 */

import { env } from '@/env';
import { useAuthStore } from '@/store/authStore';
import { APIError, getUserFriendlyMessage } from '@/lib/errorHandler';

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

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

/**
 * APIClient class - Base HTTP client with fetch API
 * 
 * Features:
 * - Automatic JWT token injection
 * - Token expiry detection and refresh
 * - Request queuing during token refresh
 * - Retry logic with exponential backoff
 * - Configurable timeouts (30s default, 5min for AI)
 */
class APIClient {
  private baseURL: string;
  private defaultTimeout: number = 30000; // 30 seconds
  private aiTimeout: number = 300000; // 5 minutes
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Subscribe to token refresh completion
   */
  private subscribeTokenRefresh(callback: (token: string | null) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify all subscribers when token refresh completes
   */
  private onTokenRefreshed(token: string | null): void {
    this.refreshSubscribers.forEach(cb => cb(token));
    this.refreshSubscribers = [];
  }

  /**
   * Check if token is expired or expiring soon (within 5 minutes)
   */
  private isTokenExpired(): boolean {
    const { tokenExpiresAt } = useAuthStore.getState();
    if (!tokenExpiresAt) return true;
    
    const expiresAt = new Date(tokenExpiresAt);
    const now = new Date();
    const fiveMinutes = 5 * 60 * 1000;
    
    return expiresAt.getTime() - now.getTime() < fiveMinutes;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<boolean> {
    const { refreshToken, refreshAccessToken } = useAuthStore.getState();
    
    if (!refreshToken) return false;
    
    try {
      return await refreshAccessToken();
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Redirect to login page with intended destination URL (Requirement 4.6)
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
        window.location.href = loginUrl;
      }
      
      return false;
    }
  }

  /**
   * Main fetch method with token refresh and retry logic
   * 
   * @param endpoint - API endpoint (relative to baseURL)
   * @param options - Fetch options with additional retry/timeout config
   * @returns Promise with typed response data
   */
  async fetch<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = options.timeout || this.defaultTimeout;
    const maxRetries = options.retries !== undefined ? options.retries : 3;
    const retryDelay = options.retryDelay || 1000;

    // Skip token refresh for auth endpoints
    const isAuthEndpoint = endpoint.includes('/auth/login') || 
                          endpoint.includes('/auth/register') || 
                          endpoint.includes('/auth/refresh');

    // Handle token refresh if needed
    if (!isAuthEndpoint) {
      const { accessToken } = useAuthStore.getState();
      
      if (accessToken && this.isTokenExpired()) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          const refreshed = await this.refreshToken();
          this.isRefreshing = false;
          
          if (refreshed) {
            const { accessToken: newToken } = useAuthStore.getState();
            this.onTokenRefreshed(newToken);
          } else {
            this.onTokenRefreshed(null);
            throw new Error('Session expired. Please log in again.');
          }
        } else {
          // Wait for ongoing refresh
          await new Promise<void>((resolve, reject) => {
            this.subscribeTokenRefresh((token) => {
              if (token) {
                resolve();
              } else {
                reject(new Error('Session expired. Please log in again.'));
              }
            });
          });
        }
      }
    }

    // Add auth header
    const { accessToken } = useAuthStore.getState();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    
    if (accessToken && !isAuthEndpoint) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Retry logic with exponential backoff
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 - try token refresh once
        if (response.status === 401 && !isAuthEndpoint && attempt === 0) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry with new token
            const { accessToken: newToken } = useAuthStore.getState();
            headers['Authorization'] = `Bearer ${newToken}`;
            continue;
          } else {
            throw new Error('Session expired. Please log in again.');
          }
        }

        // Handle other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Extract retry-after header for rate limiting (Requirement 21.5)
          const retryAfter = response.headers.get('retry-after');
          const retryAfterSeconds = retryAfter ? parseInt(retryAfter) : undefined;
          
          const errorMessage = errorData.message || 
                              errorData.error || 
                              getUserFriendlyMessage(response.status, retryAfterSeconds);
          
          throw new APIError(
            errorMessage,
            response.status,
            errorData.code,
            errorData.errors,
            retryAfterSeconds
          );
        }

        // Parse response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text() as T;
        }
      } catch (error) {
        lastError = error as Error;
        
        // Handle abort (timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new APIError('Request timed out. Please try again.', 0, 'TIMEOUT_ERROR');
        }
        
        // Don't retry on client errors (4xx) except 401
        if (error instanceof APIError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 401) {
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, retryDelay * Math.pow(2, attempt))
        );
      }
    }

    throw lastError || new APIError('Request failed after retries', 0, 'REQUEST_FAILED');
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request with JSON body
   */
  post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request with JSON body
   */
  put<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload FormData with progress tracking
   * 
   * @param endpoint - API endpoint
   * @param formData - FormData object with file and metadata
   * @param onProgress - Optional progress callback (0-100)
   * @returns Promise with typed response data
   */
  async uploadFormData<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const { accessToken } = useAuthStore.getState();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            resolve(xhr.responseText as T);
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || `Upload failed: ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', url);
      
      if (accessToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      }

      xhr.send(formData);
    });
  }
}

/**
 * Main API client instance for backend services
 */
export const apiClient = new APIClient(
  env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8080'
);

/**
 * AI-specific API client with extended timeout
 */
export const aiClient = new APIClient(
  env.NEXT_PUBLIC_AI_PROXY_URL || 'http://localhost:8000'
);

/**
 * Typed HTTP methods - unwraps ApiResponse wrapper to return raw data
 */
export const http = {
  get: <T>(url: string, options?: FetchOptions) =>
    apiClient.get<ApiResponse<T>>(url, options).then((res) => res.data),

  post: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    apiClient.post<ApiResponse<T>>(url, data, options).then((res) => res.data),

  put: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    apiClient.put<ApiResponse<T>>(url, data, options).then((res) => res.data),

  delete: <T>(url: string, options?: FetchOptions) =>
    apiClient.delete<ApiResponse<T>>(url, options).then((res) => res.data),
};

/**
 * AI HTTP methods with extended timeout
 */
export const aiHttp = {
  post: <T>(url: string, data?: unknown, options?: FetchOptions) =>
    aiClient.post<T>(url, data, { timeout: 300000, ...options }),

  get: <T>(url: string, options?: FetchOptions) =>
    aiClient.get<T>(url, { timeout: 300000, ...options }),

  uploadFormData: <T>(url: string, formData: FormData, onProgress?: (progress: number) => void) =>
    aiClient.uploadFormData<T>(url, formData, onProgress),
};

export default apiClient;
