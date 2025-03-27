
/**
 * Hook pour mettre à jour un audit existant
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAudit } from '..';
import { UpdateAuditData } from '../types';
import { toast } from 'sonner';

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
      
      // Notifier l'utilisateur
      toast.success('Audit mis à jour avec succès');
      
      return data;
    },
    onError: (error) => {
      console.error(`Erreur lors de la mise à jour de l'audit ${auditId}:`, error);
      toast.error(`Impossible de mettre à jour l'audit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
