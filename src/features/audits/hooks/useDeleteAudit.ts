
/**
 * Hook pour supprimer un audit
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAudit } from '..';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour supprimer un audit
 * 
 * @param projectId - Identifiant du projet parent (pour l'invalidation du cache)
 * @returns Mutation pour supprimer un audit
 */
export function useDeleteAudit(projectId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteAudit(id);
    },
    onSuccess: () => {
      // Invalider les requêtes pour forcer le rechargement des données
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['audits', projectId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['audits'] });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      handleMutationSuccess('Audit', 'delete');
    },
    onError: (error) => {
      handleMutationError(error, 'audit', 'delete');
    }
  });
}
