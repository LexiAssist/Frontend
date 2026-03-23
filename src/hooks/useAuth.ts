'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { http } from '@/services/http';
import { mockAuthApi, isMockMode } from '@/services/mockApi';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/components/ui/Toast';
import type { LoginCredentials, RegisterCredentials, User, AuthResponse } from '@/types';

const AUTH_KEYS = {
  user: ['auth', 'user'] as const,
};

// Fetch current user - uses real API or mock based on env
async function fetchCurrentUser(): Promise<User> {
  if (isMockMode()) {
    const response = await mockAuthApi.getCurrentUser();
    return response.data;
  }
  const response = await http.get<User>('/api/auth/me');
  return response.data;
}

// Login
async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  if (isMockMode()) {
    const response = await mockAuthApi.login(credentials);
    return response.data;
  }
  const response = await http.post<AuthResponse>('/api/auth/login', credentials);
  return response.data;
}

// Register
async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  if (isMockMode()) {
    const response = await mockAuthApi.register(credentials);
    return response.data;
  }
  const response = await http.post<AuthResponse>('/api/auth/register', credentials);
  return response.data;
}

// Logout
async function logoutUser(): Promise<void> {
  if (isMockMode()) {
    await mockAuthApi.logout();
    return;
  }
  await http.post('/api/auth/logout');
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { login: setAuthUser, logout: clearAuth, setLoading } = useAuthStore();

  // Query to fetch current user on mount
  const userQuery = useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation<AuthResponse, Error, LoginCredentials>({
    mutationFn: loginUser,
    onSuccess: (data: AuthResponse) => {
      setAuthUser(data.user);
      queryClient.setQueryData(AUTH_KEYS.user, data.user);
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed. Please try again.');
    },
  });

  // Register mutation
  const registerMutation = useMutation<AuthResponse, Error, RegisterCredentials>({
    mutationFn: registerUser,
    onSuccess: (data: AuthResponse) => {
      setAuthUser(data.user);
      queryClient.setQueryData(AUTH_KEYS.user, data.user);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Still clear local state even if server logout fails
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });

  return {
    // State
    user: userQuery.data,
    isLoading: userQuery.isLoading || loginMutation.isPending || registerMutation.isPending,
    isError: userQuery.isError,
    
    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    refetch: userQuery.refetch,
  };
}

// Hook to check if user is authenticated (for protected routes)
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (!isLoading && !user) {
    router.push('/login');
  }

  return { user, isLoading };
}
