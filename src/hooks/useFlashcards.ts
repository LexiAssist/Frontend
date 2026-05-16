import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashcardApi } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const flashcardKeys = {
  all: ['flashcards'] as const,
  lists: () => [...flashcardKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number }) => [...flashcardKeys.lists(), filters] as const,
  details: () => [...flashcardKeys.all, 'detail'] as const,
  detail: (id: string) => [...flashcardKeys.details(), id] as const,
  generated: () => [...flashcardKeys.all, 'generated'] as const,
};

// Hook to fetch all flashcard decks
export function useFlashcardDecks(limit = 20, offset = 0) {
  return useQuery({
    queryKey: flashcardKeys.list({ limit, offset }),
    queryFn: () => flashcardApi.getAllDecks(limit, offset),
  });
}

// Hook to fetch a single flashcard deck
export function useFlashcardDeck(id: string) {
  return useQuery({
    queryKey: flashcardKeys.detail(id),
    queryFn: () => flashcardApi.getDeckById(id),
    enabled: !!id,
  });
}

// Hook to create a flashcard deck
export function useCreateFlashcardDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: flashcardApi.createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
      toast.success('Flashcard deck created successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create flashcard deck');
    },
  });
}

// Hook to update a flashcard deck
export function useUpdateFlashcardDeck(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof flashcardApi.updateDeck>[1]) =>
      flashcardApi.updateDeck(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
      toast.success('Flashcard deck updated successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update flashcard deck');
    },
  });
}

// Hook to delete a flashcard deck
export function useDeleteFlashcardDeck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: flashcardApi.deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.lists() });
      toast.success('Flashcard deck deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete flashcard deck');
    },
  });
}

// Hook to add cards to a deck
export function useAddCardsToDeck(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cards: Parameters<typeof flashcardApi.addCardsToDeck>[1]) =>
      flashcardApi.addCardsToDeck(id, cards),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: flashcardKeys.detail(id) });
      toast.success('Cards added to deck successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to add cards to deck');
    },
  });
}

// Hook to generate flashcards from content
export function useGenerateFlashcards() {
  return useMutation({
    mutationFn: ({ content, userId }: { content: string; userId: string }) =>
      flashcardApi.generateFromContent(content, userId),
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to generate flashcards');
    },
  });
}
