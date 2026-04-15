import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { wsClient, type WebSocketEvent } from '@/services/websocket';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface SyncState {
  isConnected: boolean;
  lastSync: Date | null;
}

export function useSync(): SyncState {
  const queryClient = useQueryClient();
  const { accessToken, isTokenExpired } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribe to connection events
    const unsubscribe = wsClient.subscribe((event: WebSocketEvent) => {
      switch (event.type) {
        case 'connection':
          setIsConnected(event.data.status === 'connected');
          if (event.data.status === 'connected') {
            toast.success('Connected to real-time updates');
          } else if (event.data.status === 'disconnected') {
            toast.error('Disconnected from real-time updates');
          }
          break;

        case 'sync':
        case 'update':
          setLastSync(new Date());
          break;

        case 'quiz_completed':
          toast.success(`Quiz completed! Score: ${event.data.score}%`);
          queryClient.invalidateQueries({ queryKey: ['quizzes'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          break;

        case 'goal_progress':
          toast.success('Goal progress updated!');
          queryClient.invalidateQueries({ queryKey: ['goals'] });
          break;

        case 'material_uploaded':
          toast.success(`New material uploaded: ${event.data.name}`);
          queryClient.invalidateQueries({ queryKey: ['materials'] });
          break;
      }
    });

    // Manage connection based on auth state
    if (accessToken && !isTokenExpired()) {
      wsClient.connect();
    } else {
      wsClient.disconnect();
      setIsConnected(false);
    }

    return () => {
      unsubscribe();
    };
  }, [accessToken, isTokenExpired, queryClient]);

  return {
    isConnected,
    lastSync,
  };
}

// Query keys for React Query
export const syncKeys = {
  all: ['sync'] as const,
  status: () => [...syncKeys.all, 'status'] as const,
};

export default useSync;
