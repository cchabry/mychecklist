
/**
 * Hook pour mettre à jour une exigence
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExigence } from '..';
import { UpdateExigenceData } from '../types';
import { toast } from 'sonner';

/**
 * Hook pour mettre à jour une exigence existante
 * 
 * @param projectId - Identifiant du projet concerné (pour l'invalidation de cache)
 * @returns Mutation pour mettre à jour une exigence
 */
export function useUpdateExigence(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExigenceData }) => {
      return await updateExigence(id, data);
    },
    onSuccess: () => {
      // Invalider les requêtes pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['exigences', projectId] });
      queryClient.invalidateQueries({ queryKey: ['exigence'] }); // Invalider toutes les exigences individuelles
      
      // Notifier l'utilisateur
      toast.success('Exigence mise à jour avec succès');
    },
    onError: (error) => {
      console.error(`Erreur lors de la mise à jour de l'exigence:`, error);
      toast.error(`Impossible de mettre à jour l'exigence: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
