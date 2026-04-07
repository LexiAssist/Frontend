import { useMutation } from '@tanstack/react-query';
import { aiApi } from '@/services/api';
import { toast } from 'sonner';

// Hook for AI Chat
export function useAIChat() {
  return useMutation({
    mutationFn: ({ 
      query, 
      userId, 
      options 
    }: { 
      query: string; 
      userId: string; 
      options?: {
        conversationId?: string;
        materialId?: string;
        contextChunks?: string[];
      };
    }) => aiApi.chat(query, userId, {
      conversationId: options?.conversationId,
      materialId: options?.materialId,
      contextChunks: options?.contextChunks,
    }),
    onError: (error: any) => {
      toast.error(error.message || 'Failed to get AI response');
    },
  });
}

// Hook for generating summaries
export function useGenerateSummary() {
  return useMutation({
    mutationFn: ({ 
      content, 
      userId, 
      options 
    }: { 
      content: string; 
      userId: string; 
      options?: Parameters<typeof aiApi.generateSummary>[2];
    }) => aiApi.generateSummary(content, userId, options),
    onError: (error: any) => {
      toast.error(error.message || 'Failed to generate summary');
    },
  });
}

// Hook for retrieving context (RAG)
export function useRetrieveContext() {
  return useMutation({
    mutationFn: ({ 
      query, 
      userId, 
      topK 
    }: { 
      query: string; 
      userId: string; 
      topK?: number;
    }) => aiApi.retrieveContext(query, userId, topK),
    onError: (error: any) => {
      toast.error(error.message || 'Failed to retrieve context');
    },
  });
}
