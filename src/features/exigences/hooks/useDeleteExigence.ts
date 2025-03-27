
/**
 * Hook pour supprimer une exigence
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExigence } from '..';
import { toast } from 'sonner';

/**
 * Hook pour supprimer une exigence
 * 
 * @param projectId - Identifiant du projet concerné (pour l'invalidation de cache)
 * @returns Mutation pour supprimer une exigence
 */
export function useDeleteExigence(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteExigence(id);
    },
    onSuccess: () => {
      // Invalider les requêtes pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['exigences', projectId] });
      
      // Notifier l'utilisateur
      toast.success('Exigence supprimée avec succès');
    },
    onError: (error) => {
      console.error(`Erreur lors de la suppression de l'exigence:`, error);
      toast.error(`Impossible de supprimer l'exigence: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
