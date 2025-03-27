
/**
 * Hook pour créer une évaluation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEvaluation } from '..';
import { CreateEvaluationData } from '../types';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

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
      
      return await createEvaluation(evaluationInput);
    },
    onSuccess: (data, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['evaluations', variables.auditId] });
      handleMutationSuccess({ 
        entity: 'Évaluation', 
        action: 'create' 
      });
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, { 
        entity: 'évaluation', 
        action: 'create' 
      });
    }
  });
}
