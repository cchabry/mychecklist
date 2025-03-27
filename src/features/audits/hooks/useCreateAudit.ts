
/**
 * Hook pour créer un nouvel audit
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAudit } from '..';
import { CreateAuditData } from '../types';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

export function useCreateAudit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateAuditData) => {
      return await createAudit(data);
    },
    onSuccess: (data, variables) => {
      // Invalider les requêtes pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['audits', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      handleMutationSuccess('Audit', 'create');
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, 'audit', 'create');
    }
  });
}
