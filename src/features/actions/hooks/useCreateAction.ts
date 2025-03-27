
/**
 * Hook pour créer une action corrective
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { CreateActionData } from '../types';

/**
 * Hook pour créer une nouvelle action corrective
 * 
 * @returns Mutation pour créer une action
 */
export function useCreateAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateActionData) => {
      return await notionApi.createAction(data);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['actions', variables.evaluationId] });
    }
  });
}
