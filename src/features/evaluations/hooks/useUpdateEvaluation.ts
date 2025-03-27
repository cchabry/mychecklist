
/**
 * Hook pour mettre à jour une évaluation existante
 * 
 * Ce hook fournit une mutation pour mettre à jour une évaluation
 * et gérer automatiquement l'invalidation du cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEvaluation } from '..';
import { UpdateEvaluationData } from '../types';
import { useEvaluationById } from './useEvaluationById';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour mettre à jour une évaluation existante
 * 
 * @param evaluationId - Identifiant de l'évaluation à mettre à jour
 * @returns Mutation pour mettre à jour une évaluation
 * 
 * @example
 * ```tsx
 * const { mutate: update, isLoading } = useUpdateEvaluation('eval-123');
 * 
 * const handleUpdate = async (data) => {
 *   try {
 *     await update({ id: 'eval-123', data: data });
 *     // Traitement après mise à jour
 *   } catch (error) {
 *     // Gestion des erreurs
 *   }
 * };
 * ```
 */
export function useUpdateEvaluation(evaluationId: string) {
  const queryClient = useQueryClient();
  const { data: evaluation } = useEvaluationById(evaluationId);
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateEvaluationData }) => {
      if (!evaluation) {
        throw new Error('Évaluation non trouvée');
      }
      return await updateEvaluation(id, data);
    },
    onSuccess: (data, { id }) => {
      // Invalider les requêtes associées pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      
      if (evaluation?.auditId) {
        queryClient.invalidateQueries({ queryKey: ['evaluations', evaluation.auditId] });
      }
      
      handleMutationSuccess({ 
        entity: 'Évaluation', 
        action: 'update' 
      });
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, {
        entity: 'évaluation', 
        action: 'update'
      });
    }
  });
}
