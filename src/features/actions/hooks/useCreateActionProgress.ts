
/**
 * Hook pour créer un suivi de progrès d'action
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { CreateProgressData } from '../types';

/**
 * Hook pour créer un nouveau suivi de progrès d'action
 * 
 * @returns Mutation pour créer un suivi de progrès
 */
export function useCreateActionProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProgressData) => {
      return await notionApi.createActionProgress(data);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['actionProgress', variables.actionId] });
      queryClient.invalidateQueries({ queryKey: ['action', variables.actionId] });
    }
  });
}
