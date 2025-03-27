
/**
 * Hook pour supprimer une page d'échantillon
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSamplePage } from '..';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour supprimer une page d'échantillon
 * 
 * @param id - Identifiant de la page à supprimer
 * @param projectId - Identifiant du projet parent (pour l'invalidation du cache)
 * @returns Mutation pour supprimer une page
 */
export function useDeleteSamplePage(id: string, projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await deleteSamplePage(id);
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['samplePages', projectId] });
      
      handleMutationSuccess('Page d\'échantillon', 'delete');
    },
    onError: (error) => {
      handleMutationError(error, 'page d\'échantillon', 'delete');
    }
  });
}
