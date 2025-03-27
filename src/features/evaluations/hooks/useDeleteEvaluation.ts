
/**
 * Hook pour supprimer une évaluation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';

/**
 * Hook pour supprimer une évaluation
 * 
 * @param id - Identifiant de l'évaluation à supprimer
 * @returns Mutation pour supprimer une évaluation
 */
export function useDeleteEvaluation(id: string, auditId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await notionApi.deleteEvaluation(id);
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['evaluations', auditId] });
    }
  });
}
