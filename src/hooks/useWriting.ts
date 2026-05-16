import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { writingApi } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const writingKeys = {
  all: ['writing'] as const,
  history: (userId: string) => [...writingKeys.all, 'history', userId] as const,
  session: (sessionId: string, userId: string) => [...writingKeys.all, 'session', sessionId, userId] as const,
};

// Hook to generate notes from transcript
export function useGenerateNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      rawText,
      subject,
      userId,
      save,
    }: {
      sessionId: string;
      rawText: string;
      subject: string;
      userId: string;
      save?: boolean;
    }) => writingApi.generateNotes(sessionId, rawText, subject, userId, save),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: writingKeys.history(variables.userId) });
      toast.success('Notes generated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to generate notes');
    },
  });
}

// Hook to fetch writing history
export function useWritingHistory(userId: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: writingKeys.history(userId),
    queryFn: () => writingApi.getHistory(userId, limit, offset),
    enabled: !!userId,
  });
}

// Hook to fetch a specific notes session
export function useWritingSession(sessionId: string, userId: string) {
  return useQuery({
    queryKey: writingKeys.session(sessionId, userId),
    queryFn: () => writingApi.getNotesSession(sessionId, userId),
    enabled: !!sessionId && !!userId,
  });
}
