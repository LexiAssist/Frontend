"use client";

import { useState, useEffect, useCallback } from "react";

const MOCK_MODE_KEY = "lexiassist-settings-mock-mode";

interface UseMockModeReturn {
  isMockModeEnabled: boolean;
  toggleMockMode: () => void;
  setMockMode: (enabled: boolean) => void;
  isLoading: boolean;
}

/**
 * Hook to manage Developer Mock Mode state for Settings page.
 * Persists the mock mode preference in localStorage.
 * This mock mode ONLY affects Settings page forms.
 */
export function useMockMode(): UseMockModeReturn {
  const [isMockModeEnabled, setIsMockModeEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load mock mode preference from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(MOCK_MODE_KEY);
    if (stored !== null) {
      setIsMockModeEnabled(stored === "true");
    }
    setIsLoading(false);
  }, []);

  // Persist to localStorage whenever mock mode changes
  const setMockMode = useCallback((enabled: boolean) => {
    setIsMockModeEnabled(enabled);
    localStorage.setItem(MOCK_MODE_KEY, String(enabled));
  }, []);

  const toggleMockMode = useCallback(() => {
    setMockMode(!isMockModeEnabled);
  }, [isMockModeEnabled, setMockMode]);

  return {
    isMockModeEnabled,
    toggleMockMode,
    setMockMode,
    isLoading,
  };
}

export default useMockMode;
