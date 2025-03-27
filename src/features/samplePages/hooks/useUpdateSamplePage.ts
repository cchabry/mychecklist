
/**
 * Hook pour mettre à jour une page d'échantillon
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { UpdateSamplePageData } from '../types';

/**
 * Hook pour mettre à jour une page d'échantillon
 * 
 * @returns Mutation pour mettre à jour une page
 */
export function useUpdateSamplePage(id: string, projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateSamplePageData) => {
      return await notionApi.updateSamplePage({ id, ...data });
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['samplePage', id] });
      queryClient.invalidateQueries({ queryKey: ['samplePages', projectId] });
    }
  });
}
