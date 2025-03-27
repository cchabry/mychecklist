
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

/**
 * Hook pour mettre à jour une évaluation existante
 * 
 * @param auditId - Identifiant de l'audit (pour l'invalidation du cache)
 * @returns Mutation pour mettre à jour une évaluation
 * 
 * @example
 * ```tsx
 * const { mutate: update, isLoading } = useUpdateEvaluation('audit-456');
 * 
 * const handleUpdate = async (evaluationId, newData) => {
 *   try {
 *     await update({ id: evaluationId, data: newData });
 *     // Traitement après mise à jour
 *   } catch (error) {
 *     // Gestion des erreurs
 *   }
 * };
 * ```
 */
export function useUpdateEvaluation(auditId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateEvaluationData }) => {
      return await updateEvaluation(id, data);
    },
    onSuccess: (_, { id }) => {
      // Invalider les requêtes associées pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      queryClient.invalidateQueries({ queryKey: ['evaluations', auditId] });
      
      // Notifier l'utilisateur
      toast.success('Évaluation mise à jour avec succès');
    },
    onError: (error) => {
      console.error(`Erreur lors de la mise à jour de l'évaluation:`, error);
      toast.error(`Impossible de mettre à jour l'évaluation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
