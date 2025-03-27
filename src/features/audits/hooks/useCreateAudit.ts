
/**
 * Hook pour créer un nouvel audit
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAudit } from '..';
import { CreateAuditData } from '../types';
import { toast } from 'sonner';

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
      
      // Notifier l'utilisateur
      toast.success('Audit créé avec succès');
      
      return data;
    },
    onError: (error) => {
      console.error('Erreur lors de la création de l\'audit:', error);
      toast.error(`Impossible de créer l'audit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
