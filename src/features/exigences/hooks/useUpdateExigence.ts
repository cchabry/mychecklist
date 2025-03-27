
/**
 * Hook pour mettre à jour une exigence existante
 * 
 * Ce hook fournit une mutation pour mettre à jour une exigence
 * et gérer automatiquement l'invalidation du cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExigence } from '..';
import { UpdateExigenceData } from '../types';
import { handleMutationSuccess, handleMutationError } from '@/utils/query-helpers';

/**
 * Hook pour mettre à jour une exigence existante
 * 
 * @param projectId - Identifiant du projet (pour l'invalidation du cache)
 * @returns Mutation pour mettre à jour une exigence
 * 
 * @example
 * ```tsx
 * const { mutate: update, isLoading } = useUpdateExigence('project-456');
 * 
 * const handleUpdate = async (exigenceId, newData) => {
 *   try {
 *     await update({ id: exigenceId, data: newData });
 *     // Traitement après mise à jour
 *   } catch (error) {
 *     // Gestion des erreurs
 *   }
 * };
 * ```
 */
export function useUpdateExigence(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateExigenceData }) => {
      return await updateExigence(id, data);
    },
    onSuccess: (data, { id }) => {
      // Invalider les requêtes associées pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['exigence', id] });
      queryClient.invalidateQueries({ queryKey: ['exigences', projectId] });
      queryClient.invalidateQueries({ queryKey: ['exigencesWithItems', projectId] });
      
      handleMutationSuccess('Exigence', 'update');
      
      return data;
    },
    onError: (error) => {
      handleMutationError(error, 'exigence', 'update');
    }
  });
}
