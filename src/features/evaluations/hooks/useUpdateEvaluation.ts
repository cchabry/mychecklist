
/**
 * Hook pour mettre à jour une évaluation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { UpdateEvaluationData } from '../types';
import { useEvaluationById } from './useEvaluationById';

/**
 * Hook pour mettre à jour une évaluation
 * 
 * @returns Mutation pour mettre à jour une évaluation
 */
export function useUpdateEvaluation(id: string) {
  const queryClient = useQueryClient();
  const { data: currentEvaluation } = useEvaluationById(id);
  
  return useMutation({
    mutationFn: async (data: UpdateEvaluationData) => {
      if (!currentEvaluation) {
        throw new Error("Évaluation non trouvée");
      }
      
      const updatedEvaluation = {
        ...currentEvaluation,
        ...data,
      };
      
      return await notionApi.updateEvaluation(updatedEvaluation);
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['evaluation', id] });
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    }
  });
}
