
/**
 * Hook pour créer une page d'échantillon
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSamplePage } from '..';
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
      return await createSamplePage(data);
    },
    onSuccess: (data, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['samplePages', variables.projectId] });
      
      handleMutationSuccess('Page d\'échantillon', 'create');
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, 'page d\'échantillon', 'create');
    }
  });
}
