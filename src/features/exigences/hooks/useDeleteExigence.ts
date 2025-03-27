
/**
 * Hook pour supprimer une exigence
 * 
 * Ce hook fournit une mutation pour supprimer une exigence
 * et gérer automatiquement l'invalidation du cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteExigence } from '..';
import { toast } from 'sonner';

/**
 * Hook pour supprimer une exigence
 * 
 * @param projectId - Identifiant du projet (pour l'invalidation du cache)
 * @returns Mutation pour supprimer une exigence
 * 
 * @example
 * ```tsx
 * const { mutate: remove, isLoading } = useDeleteExigence('project-456');
 * 
 * const handleDelete = async (exigenceId) => {
 *   if (confirm('Êtes-vous sûr de vouloir supprimer cette exigence?')) {
 *     try {
 *       await remove(exigenceId);
 *       // Redirection ou traitement après suppression
 *     } catch (error) {
 *       // Gestion des erreurs
 *     }
 *   }
 * };
 * ```
 */
export function useDeleteExigence(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteExigence(id);
    },
    onSuccess: () => {
      // Invalider les requêtes associées pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['exigences', projectId] });
      queryClient.invalidateQueries({ queryKey: ['exigencesWithItems', projectId] });
      
      // Notifier l'utilisateur
      toast.success('Exigence supprimée avec succès');
    },
    onError: (error) => {
      console.error(`Erreur lors de la suppression de l'exigence:`, error);
      toast.error(`Impossible de supprimer l'exigence: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
