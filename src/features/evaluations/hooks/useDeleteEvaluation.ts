
/**
 * Hook pour supprimer une évaluation
 * 
 * Ce hook fournit une mutation pour supprimer une évaluation
 * et gérer automatiquement l'invalidation du cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEvaluation } from '..';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour supprimer une évaluation
 * 
 * @param auditId - Identifiant de l'audit (pour l'invalidation du cache)
 * @returns Mutation pour supprimer une évaluation
 * 
 * @example
 * ```tsx
 * const { mutate: remove, isLoading } = useDeleteEvaluation('audit-456');
 * 
 * const handleDelete = async (evaluationId) => {
 *   if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation?')) {
 *     try {
 *       await remove(evaluationId);
 *       // Redirection ou traitement après suppression
 *     } catch (error) {
 *       // Gestion des erreurs
 *     }
 *   }
 * };
 * ```
 */
export function useDeleteEvaluation(auditId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteEvaluation(id);
    },
    onSuccess: () => {
      // Invalider les requêtes associées pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['evaluations', auditId] });
      
      handleMutationSuccess('Évaluation', 'delete');
    },
    onError: (error) => {
      handleMutationError(error, 'évaluation', 'delete');
    }
  });
}
