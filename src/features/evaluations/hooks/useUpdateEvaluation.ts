
/**
 * Hook pour mettre à jour une évaluation existante
 * 
 * Ce hook fournit une mutation pour mettre à jour une évaluation
 * et gérer automatiquement l'invalidation du cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEvaluation } from '..';
import { UpdateEvaluationData } from '../types';
import { toast } from 'sonner';
import { useEvaluationById } from './useEvaluationById';

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
    onSuccess: (_, { id }) => {
      // Invalider les requêtes associées pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      
      if (evaluation?.auditId) {
        queryClient.invalidateQueries({ queryKey: ['evaluations', evaluation.auditId] });
      }
      
      // Notifier l'utilisateur
      toast.success('Évaluation mise à jour avec succès');
    },
    onError: (error) => {
      console.error(`Erreur lors de la mise à jour de l'évaluation:`, error);
      toast.error(`Impossible de mettre à jour l'évaluation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
