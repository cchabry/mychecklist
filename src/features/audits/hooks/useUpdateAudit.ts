
/**
 * Hook pour mettre à jour un audit existant
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAudit } from '..';
import { UpdateAuditData } from '../types';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour mettre à jour un audit existant
 * 
 * @param auditId - Identifiant de l'audit à mettre à jour
 * @returns Mutation pour mettre à jour un audit
 */
export function useUpdateAudit(auditId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateAuditData) => {
      return await updateAudit(auditId, data);
    },
    onSuccess: (data) => {
      // Invalider les requêtes pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['audit', auditId] });
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      
      handleMutationSuccess({ 
        entity: 'Audit', 
        action: 'update' 
      });
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, { 
        entity: 'audit', 
        action: 'update' 
      });
    }
  });
}
