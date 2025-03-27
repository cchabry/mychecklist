
/**
 * Hook pour mettre à jour une action corrective
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { UpdateActionData } from '../types';

/**
 * Hook pour mettre à jour une action corrective
 * 
 * @returns Mutation pour mettre à jour une action
 */
export function useUpdateAction(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateActionData) => {
      return await notionApi.updateAction({ id, ...data });
    },
    onSuccess: (data) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['action', id] });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    }
  });
}
