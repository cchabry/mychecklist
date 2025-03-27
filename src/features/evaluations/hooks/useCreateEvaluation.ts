
/**
 * Hook pour créer une évaluation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { CreateEvaluationData } from '../types';

/**
 * Hook pour créer une nouvelle évaluation
 * 
 * @returns Mutation pour créer une évaluation
 */
export function useCreateEvaluation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateEvaluationData) => {
      return await notionApi.createEvaluation(data);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['evaluations', variables.auditId] });
    }
  });
}
