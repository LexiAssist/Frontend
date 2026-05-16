import { useMutation, useQuery } from '@tanstack/react-query';
import { readingApi } from '@/services/api';
import type { ReadingStreamEvent } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const readingKeys = {
  all: ['reading'] as const,
  session: (sessionId: string, userId: string) => [...readingKeys.all, 'session', sessionId, userId] as const,
};

// Hook to analyse a document (async)
export function useAnalyseDocument() {
  return useMutation({
    mutationFn: ({
      file,
      userId,
      summaryType,
      voice,
      temperature,
    }: {
      file: File;
      userId: string;
      summaryType?: string;
      voice?: string;
      temperature?: number;
    }) => readingApi.analyse(file, userId, summaryType, voice, undefined, temperature),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to analyse document');
    },
  });
}

// Hook to analyse a document with streaming
export function useAnalyseDocumentStream() {
  return useMutation({
    mutationFn: ({
      file,
      userId,
      onEvent,
      onError,
      summaryType,
      voice,
      temperature,
    }: {
      file: File;
      userId: string;
      onEvent: (event: ReadingStreamEvent) => void;
      onError: (error: Error) => void;
      summaryType?: string;
      voice?: string;
      temperature?: number;
    }) => readingApi.analyseStream(file, userId, onEvent, onError, summaryType, voice, temperature),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to analyse document');
    },
  });
}

// Hook to fetch a reading session
export function useReadingSession(sessionId: string, userId: string) {
  return useQuery({
    queryKey: readingKeys.session(sessionId, userId),
    queryFn: () => readingApi.getSession(sessionId, userId),
    enabled: !!sessionId && !!userId,
  });
}

// Hook to simplify text
export function useSimplifyText() {
  return useMutation({
    mutationFn: ({ text, level }: { text: string; level: 'beginner' | 'intermediate' }) =>
      readingApi.simplify(text, level),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to simplify text');
    },
  });
}
