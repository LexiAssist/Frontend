// Mock API service for development without backend
// This file is kept minimal - only for checking mock mode status
// All actual API calls should go through the real backend services

/**
 * Check if the application is running in mock mode
 * @returns true if mock mode is enabled via environment variables
 */
export const isMockMode = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || 
         process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
};

/**
 * @deprecated Use real API services instead
 * Mock mode is no longer supported - all features require backend services
 */
export const mockAuthApi = null;

/**
 * @deprecated Use real API services instead
 * Mock mode is no longer supported - all features require backend services
 */
export const mockMaterialsApi = null;

/**
 * @deprecated Use real API services instead
 * Mock mode is no longer supported - all features require backend services
 */
export const mockFlashcardsApi = null;
