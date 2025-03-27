
/**
 * Hook pour mettre à jour une évaluation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { UpdateEvaluationData } from '../types';

/**
 * Hook pour mettre à jour une évaluation
 * 
 * @returns Mutation pour mettre à jour une évaluation
 */
export function useUpdateEvaluation(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateEvaluationData) => {
      return await notionApi.updateEvaluation({ id, ...data });
    },
    onSuccess: (data) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    }
  });
}
