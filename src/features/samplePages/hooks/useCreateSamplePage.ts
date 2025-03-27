
/**
 * Hook pour créer une page d'échantillon
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { samplePagesApi } from '@/services/notion/api/samplePages';
import { CreateSamplePageData } from '../types';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour créer une nouvelle page d'échantillon
 * 
 * @returns Mutation pour créer une page
 */
export function useCreateSamplePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateSamplePageData) => {
      return await samplePagesApi.createSamplePage(data);
    },
    onSuccess: (data, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['samplePages', variables.projectId] });
      
      handleMutationSuccess({ 
        entity: 'Page d\'échantillon', 
        action: 'create' 
      });
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, { 
        entity: 'page d\'échantillon', 
        action: 'create' 
      });
    }
  });
}
