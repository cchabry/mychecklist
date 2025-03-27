
/**
 * Hook pour créer une page d'échantillon
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { CreateSamplePageData } from '../types';

/**
 * Hook pour créer une nouvelle page d'échantillon
 * 
 * @returns Mutation pour créer une page
 */
export function useCreateSamplePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSamplePageData) => {
      return await notionApi.createSamplePage(data);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['samplePages', variables.projectId] });
    }
  });
}
