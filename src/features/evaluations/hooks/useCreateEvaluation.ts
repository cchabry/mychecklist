
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
      // Ajouter createdAt et updatedAt avant d'envoyer à l'API
      const currentTime = new Date().toISOString();
      const evaluationInput = {
        ...data,
        createdAt: currentTime,
        updatedAt: currentTime
      };
      
      return await notionApi.createEvaluation(evaluationInput);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['evaluations', variables.auditId] });
    }
  });
}
