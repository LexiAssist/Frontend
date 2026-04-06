import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// Keys for query caching
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// Hook to get current user
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => authApi.getMe(),
    retry: false,
  });
}

// Hook for login
export function useLogin() {
  const router = useRouter();
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      // Update auth store with tokens
      login(data.user, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      });
      
      // Update React Query cache
      queryClient.setQueryData(authKeys.user(), data.user);
      
      toast.success('Welcome back!');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
}

// Hook for registration
export function useRegister() {
  const router = useRouter();
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (response, variables) => {
      const user = response.data;
      
      // If email is already verified (bypass mode), auto-login
      if (user.email_verified) {
        toast.success('Account created! Logging you in...');
        // Auto-login since email is already verified
        authApi.login(variables.email, variables.password)
          .then((loginData) => {
            login(loginData.user, {
              accessToken: loginData.access_token,
              refreshToken: loginData.refresh_token,
              expiresAt: loginData.expires_at,
            });
            queryClient.setQueryData(authKeys.user(), loginData.user);
            toast.success('Welcome to LexiAssist!');
            router.push('/dashboard');
          })
          .catch(() => {
            toast.error('Auto-login failed. Please log in manually.');
            router.push('/login');
          });
      } else {
        // Normal flow - redirect to verification
        toast.success('Account created! Please check your email for verification code.');
        router.push(`/verify-email?userId=${user.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
}

// Hook for email verification
export function useVerifyEmail() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: ({ userId, code }: { userId: string; code: string }) =>
      authApi.verifyEmail(userId, code),
    onSuccess: () => {
      toast.success('Email verified! Please log in.');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Verification failed');
    },
  });
}

// Unified auth hook for components
export function useAuth() {
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoading: loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
  };
}

// Hook for logout
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/login');
    },
    onError: () => {
      // Even if logout fails, clear local state
      queryClient.clear();
      router.push('/login');
    },
  });
}
