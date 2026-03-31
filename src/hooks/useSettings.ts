"use client";

import { useState, useCallback } from "react";
import { useMockMode } from "./useMockMode";
import {
  mockSettingsService,
  type ProfileData,
  type NotificationSettings,
  type PrivacySettings,
} from "@/lib/mockSettingsService";

interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseSettingsReturn {
  // Mock mode
  isMockModeEnabled: boolean;
  toggleMockMode: () => void;
  setMockMode: (enabled: boolean) => void;
  isMockLoading: boolean;

  // Form states
  profileState: FormState;
  notificationsState: FormState;
  privacyState: FormState;
  passwordState: FormState;
  deleteState: FormState;

  // Actions
  saveProfile: (data: ProfileData) => Promise<boolean>;
  saveNotifications: (settings: NotificationSettings) => Promise<boolean>;
  savePrivacy: (settings: PrivacySettings) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  deleteAccount: (confirmation: string) => Promise<boolean>;
  resetFormState: (form: keyof UseSettingsReturn["formStates"]) => void;

  formStates: {
    profile: FormState;
    notifications: FormState;
    privacy: FormState;
    password: FormState;
    delete: FormState;
  };
}

type FormKey = "profile" | "notifications" | "privacy" | "password" | "delete";

const initialFormState: FormState = {
  isLoading: false,
  error: null,
  success: false,
};

/**
 * Hook to manage Settings page forms with optional mock backend support.
 * When mock mode is enabled, API calls are routed through mockSettingsService.
 * When mock mode is disabled, real API calls would be made (placeholder for now).
 */
export function useSettings(): UseSettingsReturn {
  const {
    isMockModeEnabled,
    toggleMockMode,
    setMockMode,
    isLoading: isMockLoading,
  } = useMockMode();

  const [formStates, setFormStates] = useState<Record<FormKey, FormState>>({
    profile: initialFormState,
    notifications: initialFormState,
    privacy: initialFormState,
    password: initialFormState,
    delete: initialFormState,
  });

  const setFormLoading = useCallback((form: FormKey, loading: boolean) => {
    setFormStates((prev) => ({
      ...prev,
      [form]: { ...prev[form], isLoading: loading },
    }));
  }, []);

  const setFormError = useCallback((form: FormKey, error: string | null) => {
    setFormStates((prev) => ({
      ...prev,
      [form]: { ...prev[form], error, success: false },
    }));
  }, []);

  const setFormSuccess = useCallback((form: FormKey, success: boolean) => {
    setFormStates((prev) => ({
      ...prev,
      [form]: { ...prev[form], success, error: null },
    }));
  }, []);

  const resetFormState = useCallback((form: FormKey) => {
    setFormStates((prev) => ({
      ...prev,
      [form]: initialFormState,
    }));
  }, []);

  const saveProfile = useCallback(
    async (data: ProfileData): Promise<boolean> => {
      setFormLoading("profile", true);
      setFormError("profile", null);

      try {
        let response;

        if (isMockModeEnabled) {
          response = await mockSettingsService.saveProfile(data);
        } else {
          // TODO: Replace with real API call
          // Example: response = await fetch('/api/settings/profile', { method: 'POST', body: JSON.stringify(data) })
          response = await mockSettingsService.saveProfile(data);
        }

        if (response.success) {
          setFormSuccess("profile", true);
          return true;
        } else {
          setFormError("profile", response.error || "Failed to save profile");
          return false;
        }
      } catch (err) {
        setFormError(
          "profile",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("profile", false);
      }
    },
    [isMockModeEnabled, setFormError, setFormLoading, setFormSuccess]
  );

  const saveNotifications = useCallback(
    async (settings: NotificationSettings): Promise<boolean> => {
      setFormLoading("notifications", true);
      setFormError("notifications", null);

      try {
        let response;

        if (isMockModeEnabled) {
          response = await mockSettingsService.saveNotifications(settings);
        } else {
          // TODO: Replace with real API call
          response = await mockSettingsService.saveNotifications(settings);
        }

        if (response.success) {
          setFormSuccess("notifications", true);
          return true;
        } else {
          setFormError(
            "notifications",
            response.error || "Failed to save notification settings"
          );
          return false;
        }
      } catch (err) {
        setFormError(
          "notifications",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("notifications", false);
      }
    },
    [isMockModeEnabled, setFormError, setFormLoading, setFormSuccess]
  );

  const savePrivacy = useCallback(
    async (settings: PrivacySettings): Promise<boolean> => {
      setFormLoading("privacy", true);
      setFormError("privacy", null);

      try {
        let response;

        if (isMockModeEnabled) {
          response = await mockSettingsService.savePrivacy(settings);
        } else {
          // TODO: Replace with real API call
          response = await mockSettingsService.savePrivacy(settings);
        }

        if (response.success) {
          setFormSuccess("privacy", true);
          return true;
        } else {
          setFormError(
            "privacy",
            response.error || "Failed to save privacy settings"
          );
          return false;
        }
      } catch (err) {
        setFormError(
          "privacy",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("privacy", false);
      }
    },
    [isMockModeEnabled, setFormError, setFormLoading, setFormSuccess]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      setFormLoading("password", true);
      setFormError("password", null);

      try {
        let response;

        if (isMockModeEnabled) {
          response = await mockSettingsService.changePassword(
            currentPassword,
            newPassword
          );
        } else {
          // TODO: Replace with real API call
          response = await mockSettingsService.changePassword(
            currentPassword,
            newPassword
          );
        }

        if (response.success) {
          setFormSuccess("password", true);
          return true;
        } else {
          setFormError(
            "password",
            response.error || "Failed to change password"
          );
          return false;
        }
      } catch (err) {
        setFormError(
          "password",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("password", false);
      }
    },
    [isMockModeEnabled, setFormError, setFormLoading, setFormSuccess]
  );

  const deleteAccount = useCallback(
    async (confirmation: string): Promise<boolean> => {
      setFormLoading("delete", true);
      setFormError("delete", null);

      try {
        let response;

        if (isMockModeEnabled) {
          response = await mockSettingsService.deleteAccount(confirmation);
        } else {
          // TODO: Replace with real API call
          response = await mockSettingsService.deleteAccount(confirmation);
        }

        if (response.success) {
          setFormSuccess("delete", true);
          return true;
        } else {
          setFormError(
            "delete",
            response.error || "Failed to delete account"
          );
          return false;
        }
      } catch (err) {
        setFormError(
          "delete",
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        return false;
      } finally {
        setFormLoading("delete", false);
      }
    },
    [isMockModeEnabled, setFormError, setFormLoading, setFormSuccess]
  );

  return {
    isMockModeEnabled,
    toggleMockMode,
    setMockMode,
    isMockLoading,
    profileState: formStates.profile,
    notificationsState: formStates.notifications,
    privacyState: formStates.privacy,
    passwordState: formStates.password,
    deleteState: formStates.delete,
    saveProfile,
    saveNotifications,
    savePrivacy,
    changePassword,
    deleteAccount,
    resetFormState,
    formStates,
  };
}

export default useSettings;
