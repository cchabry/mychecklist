
/**
 * Hook pour supprimer une action corrective
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAction } from '..';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour supprimer une action corrective
 * 
 * @param id - Identifiant de l'action à supprimer
 * @param evaluationId - Identifiant de l'évaluation parent (pour l'invalidation du cache)
 * @returns Mutation pour supprimer une action
 */
export function useDeleteAction(id: string, evaluationId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await deleteAction(id);
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['actions', evaluationId] });
      
      handleMutationSuccess({ 
        entity: 'Action corrective', 
        action: 'delete' 
      });
    },
    onError: (error) => {
      handleMutationError(error, { 
        entity: 'action corrective', 
        action: 'delete' 
      });
    }
  });
}
