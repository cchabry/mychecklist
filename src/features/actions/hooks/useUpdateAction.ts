
/**
 * Hook pour mettre à jour une action corrective
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notionApi } from '@/services/api';
import { UpdateActionData } from '../types';
import { useActionById } from './useActionById';

/**
 * Hook pour mettre à jour une action corrective
 * 
 * @returns Mutation pour mettre à jour une action
 */
export function useUpdateAction(id: string) {
  const queryClient = useQueryClient();
  const { data: currentAction } = useActionById(id);
  
  return useMutation({
    mutationFn: async (data: UpdateActionData) => {
      if (!currentAction) {
        throw new Error("Action non trouvée");
      }
      
      const updatedAction = {
        ...currentAction,
        ...data,
      };
      
      return await notionApi.updateAction(updatedAction);
    },
    onSuccess: () => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['action', id] });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    }
  });
}
