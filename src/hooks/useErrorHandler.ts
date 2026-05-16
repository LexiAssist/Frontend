/**
 * useErrorHandler Hook
 * 
 * Custom hook for handling API errors with toast notifications
 * and optional retry functionality.
 */

'use client';

import { useCallback } from 'react';
import { handleAPIError, isNetworkError, isRateLimitError, shouldRetry } from '@/lib/errorHandler';
import { Toast } from '@/components/Toast';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  onRetry?: () => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { showToast: shouldShowToast = true, onRetry } = options;

  const handleError = useCallback((error: unknown) => {
    const apiError = handleAPIError(error);

    // Show toast notification if enabled
    if (shouldShowToast) {
      if (isRateLimitError(apiError)) {
        // Rate limit toast is shown by the HTTP client (http.ts) with a live countdown.
        // Skip the generic error toast to avoid duplicate notifications.
        return apiError;
      }
      if (isNetworkError(apiError) && onRetry) {
        // Show error with retry button for network errors
        Toast.error(apiError.message, { duration: 5000 });
      } else {
        Toast.error(apiError.message);
      }
    }

    // Log error for debugging
    console.error('API Error:', apiError);

    return apiError;
  }, [shouldShowToast, onRetry]);

  const canRetry = useCallback((error: unknown) => {
    const apiError = handleAPIError(error);
    return shouldRetry(apiError);
  }, []);

  return {
    handleError,
    canRetry,
  };
}
