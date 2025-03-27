
/**
 * Hook pour supprimer un audit
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAudit } from '..';
import { toast } from 'sonner';

export function useDeleteAudit(projectId?: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteAudit(id);
    },
    onSuccess: () => {
      // Invalider les requêtes pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['audits', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // Notifier l'utilisateur
      toast.success('Audit supprimé avec succès');
    },
    onError: (error) => {
      console.error(`Erreur lors de la suppression de l'audit:`, error);
      toast.error(`Impossible de supprimer l'audit: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
