
/**
 * Hook pour supprimer une page d'échantillon
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour supprimer une page d'échantillon
 * 
 * @param id - Identifiant de la page à supprimer
 * @returns Mutation pour supprimer une page
 */
export function useDeleteSamplePage(id: string, projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await notionApi.deleteSamplePage(id);
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['samplePages', projectId] });
    }
  });
}
