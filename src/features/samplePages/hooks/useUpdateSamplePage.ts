
/**
 * Hook pour mettre à jour une page d'échantillon
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { samplePagesApi } from '@/services/notion/api/samplePages';
import { UpdateSamplePageData } from '../types';
import { useSamplePageById } from './useSamplePageById';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour mettre à jour une page d'échantillon
 * 
 * @param id - Identifiant de la page à mettre à jour
 * @param projectId - Identifiant du projet parent
 * @returns Mutation pour mettre à jour une page
 */
export function useUpdateSamplePage(id: string, projectId: string) {
  const queryClient = useQueryClient();
  const { data: currentPage } = useSamplePageById(id);
  
  return useMutation({
    mutationFn: async (data: UpdateSamplePageData) => {
      if (!currentPage) {
        throw new Error("Page d'échantillon non trouvée");
      }
      
      return await samplePagesApi.updateSamplePage({
        ...currentPage,
        ...data
      });
    },
    onSuccess: (data) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['samplePage', id] });
      queryClient.invalidateQueries({ queryKey: ['samplePages', projectId] });
      
      handleMutationSuccess({ 
        entity: 'Page d\'échantillon', 
        action: 'update' 
      });
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, { 
        entity: 'page d\'échantillon', 
        action: 'update' 
      });
    }
  });
}
