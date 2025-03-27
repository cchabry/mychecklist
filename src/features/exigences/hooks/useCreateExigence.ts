
/**
 * Hook pour créer une exigence
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExigence } from '..';
import { CreateExigenceData } from '../types';
import { toast } from 'sonner';

/**
 * Hook pour créer une nouvelle exigence
 * 
 * @param projectId - Identifiant du projet concerné (pour l'invalidation de cache)
 * @returns Mutation pour créer une exigence
 */
export function useCreateExigence(projectId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateExigenceData) => {
      return await createExigence(data);
    },
    onSuccess: () => {
      // Invalider les requêtes pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['exigences', projectId] });
      
      // Notifier l'utilisateur
      toast.success('Exigence créée avec succès');
    },
    onError: (error) => {
      console.error(`Erreur lors de la création de l'exigence:`, error);
      toast.error(`Impossible de créer l'exigence: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
