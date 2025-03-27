
/**
 * Hook pour créer une action corrective
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { CreateActionData } from '../types';
import { StatusType } from '@/types/enums';

/**
 * Hook pour créer une nouvelle action corrective
 * 
 * @returns Mutation pour créer une action
 */
export function useCreateAction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateActionData) => {
      // S'assurer que le statut a une valeur par défaut si non fourni
      const actionData = {
        ...data,
        status: data.status || StatusType.Todo
      };
      return await notionApi.createAction(actionData);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['actions', variables.evaluationId] });
    }
  });
}
