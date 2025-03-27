
/**
 * Hook pour créer un suivi de progrès d'action
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createActionProgress } from '..';
import { CreateProgressData } from '../types';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour créer un nouveau suivi de progrès d'action
 * 
 * @returns Mutation pour créer un suivi de progrès
 */
export function useCreateActionProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProgressData) => {
      return await createActionProgress(data);
    },
    onSuccess: (data, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['actionProgress', variables.actionId] });
      queryClient.invalidateQueries({ queryKey: ['action', variables.actionId] });
      
      handleMutationSuccess({ 
        entity: 'Progrès d\'action', 
        action: 'create' 
      });
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, { 
        entity: 'progrès d\'action', 
        action: 'create' 
      });
    }
  });
}
