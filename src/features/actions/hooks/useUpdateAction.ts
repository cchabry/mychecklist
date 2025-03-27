
/**
 * Hook pour mettre à jour une action corrective
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAction } from '..';
import { UpdateActionData } from '../types';
import { useActionById } from './useActionById';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour mettre à jour une action corrective
 * 
 * @param id - Identifiant de l'action à mettre à jour
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
      
      return await updateAction(id, data);
    },
    onSuccess: (data) => {
      // Invalider les requêtes associées
      queryClient.invalidateQueries({ queryKey: ['action', id] });
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      
      handleMutationSuccess('Action corrective', 'update');
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, 'action corrective', 'update');
    }
  });
}
