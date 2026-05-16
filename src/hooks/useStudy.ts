import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyApi, flashcardApi, quizApi } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const studyKeys = {
  all: ['study'] as const,
  history: (userId: string) => [...studyKeys.all, 'history', userId] as const,
  flashcardSession: (sessionId: string) => [...studyKeys.all, 'flashcard', sessionId] as const,
  quizSession: (sessionId: string) => [...studyKeys.all, 'quiz', sessionId] as const,
};

// Hook to generate flashcards from uploaded file
export function useGenerateStudyFlashcards() {
  return useMutation({
    mutationFn: ({ content, userId }: { content: string; userId: string }) =>
      flashcardApi.generateFromContent(content, userId),
    onSuccess: () => {
      toast.success('Flashcards generated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to generate flashcards');
    },
  });
}

// Hook to generate quiz from uploaded file
export function useGenerateStudyQuiz() {
  return useMutation({
    mutationFn: ({
      content,
      userId,
      quizType,
      numQuestions,
    }: {
      content: string;
      userId: string;
      quizType?: 'multiple_choice' | 'theory';
      numQuestions?: number;
    }) => quizApi.generateFromContent(content, userId, quizType, numQuestions),
    onSuccess: () => {
      toast.success('Quiz generated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to generate quiz');
    },
  });
}

// Hook to fetch study history
export function useStudyHistory(userId: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: studyKeys.history(userId),
    queryFn: () => studyApi.getHistory(userId, limit, offset),
    enabled: !!userId,
  });
}

// Hook to fetch a flashcard session
export function useStudyFlashcardSession(sessionId: string, userId: string) {
  return useQuery({
    queryKey: studyKeys.flashcardSession(sessionId),
    queryFn: () => studyApi.getFlashcardSession(sessionId, userId),
    enabled: !!sessionId && !!userId,
  });
}

// Hook to fetch a quiz session
export function useStudyQuizSession(sessionId: string, userId: string) {
  return useQuery({
    queryKey: studyKeys.quizSession(sessionId),
    queryFn: () => studyApi.getQuizSession(sessionId, userId),
    enabled: !!sessionId && !!userId,
  });
}
