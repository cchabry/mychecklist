
/**
 * Hook pour supprimer une action corrective
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour supprimer une action corrective
 * 
 * @param id - Identifiant de l'action à supprimer
 * @returns Mutation pour supprimer une action
 */
export function useDeleteAction(id: string, evaluationId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await notionApi.deleteAction(id);
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['actions', evaluationId] });
    }
  });
}
