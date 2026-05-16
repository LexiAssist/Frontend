import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialApi, courseApi } from '@/services/api';
import { toast } from 'sonner';
import type { ApiError } from '@/types/errors';

// Keys for query caching
export const materialKeys = {
  all: ['materials'] as const,
  lists: () => [...materialKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number }) => [...materialKeys.lists(), filters] as const,
  details: () => [...materialKeys.all, 'detail'] as const,
  detail: (id: string) => [...materialKeys.details(), id] as const,
  course: (courseId: string) => [...materialKeys.all, 'course', courseId] as const,
};

// Hook to fetch all materials
export function useMaterials(limit = 20, offset = 0) {
  return useQuery({
    queryKey: materialKeys.list({ limit, offset }),
    queryFn: () => materialApi.getAll(limit, offset),
  });
}

// Hook to fetch a single material
export function useMaterial(id: string) {
  return useQuery({
    queryKey: materialKeys.detail(id),
    queryFn: () => materialApi.getById(id),
    enabled: !!id,
  });
}

// Hook to fetch materials for a course
export function useCourseMaterials(courseId: string) {
  return useQuery({
    queryKey: materialKeys.course(courseId),
    queryFn: () => courseApi.getMaterials(courseId),
    enabled: !!courseId,
  });
}

// Hook to upload a material
export function useUploadMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, courseId }: { file: File; courseId?: string }) =>
      materialApi.upload(file, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      toast.success('Material uploaded successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to upload material');
    },
  });
}

// Hook to delete a material
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
      toast.success('Material deleted successfully!');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to delete material');
    },
  });
}
