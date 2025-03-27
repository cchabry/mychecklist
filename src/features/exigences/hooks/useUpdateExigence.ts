
/**
 * Hook pour mettre à jour une exigence existante
 * 
 * Ce hook fournit une mutation pour mettre à jour une exigence
 * et gérer automatiquement l'invalidation du cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExigence } from '..';
import { UpdateExigenceData } from '../types';
import { toast } from 'sonner';

/**
 * Hook pour mettre à jour une exigence existante
 * 
 * @param id - Identifiant de l'exigence à mettre à jour
 * @param projectId - Identifiant du projet (pour l'invalidation du cache)
 * @returns Mutation pour mettre à jour une exigence
 * 
 * @example
 * ```tsx
 * const { mutate: update, isLoading } = useUpdateExigence('exigence-123', 'project-456');
 * 
 * const handleUpdate = async (newImportance) => {
 *   try {
 *     await update({
 *       importance: newImportance,
 *       comment: 'Mise à jour du niveau d\'importance'
 *     });
 *     
 *     // Traitement après mise à jour
 *   } catch (error) {
 *     // Gestion des erreurs
 *   }
 * };
 * ```
 */
export function useUpdateExigence(id: string, projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateExigenceData) => {
      return await updateExigence(id, data);
    },
    onSuccess: () => {
      // Invalider les requêtes associées pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['exigence', id] });
      queryClient.invalidateQueries({ queryKey: ['exigences', projectId] });
      queryClient.invalidateQueries({ queryKey: ['exigencesWithItems', projectId] });
      
      // Notifier l'utilisateur
      toast.success('Exigence mise à jour avec succès');
    },
    onError: (error) => {
      console.error(`Erreur lors de la mise à jour de l'exigence ${id}:`, error);
      toast.error(`Impossible de mettre à jour l'exigence: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
