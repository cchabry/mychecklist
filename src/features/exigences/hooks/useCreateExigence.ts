
/**
 * Hook pour créer une nouvelle exigence
 * 
 * Ce hook fournit une mutation pour créer une nouvelle exigence
 * et gérer automatiquement l'invalidation du cache.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExigence } from '..';
import { CreateExigenceData } from '../types';
import { toast } from 'sonner';

/**
 * Hook pour créer une nouvelle exigence
 * 
 * @returns Mutation pour créer une exigence
 * 
 * @example
 * ```tsx
 * const { mutate: createExigence, isLoading } = useCreateExigence();
 * 
 * const handleSubmit = async (formData) => {
 *   try {
 *     const newExigence = await createExigence({
 *       projectId: 'project-123',
 *       itemId: 'checklist-item-456',
 *       importance: ImportanceLevel.Important,
 *       comment: 'Cette exigence est cruciale pour notre projet'
 *     });
 *     
 *     // Traitement après création
 *   } catch (error) {
 *     // Gestion des erreurs
 *   }
 * };
 * ```
 */
export function useCreateExigence() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateExigenceData) => {
      return await createExigence(data);
    },
    onSuccess: (_, variables) => {
      // Invalider les requêtes associées pour forcer le rechargement des données
      queryClient.invalidateQueries({ queryKey: ['exigences', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['exigencesWithItems', variables.projectId] });
      
      // Notifier l'utilisateur
      toast.success('Exigence créée avec succès');
    },
    onError: (error) => {
      console.error('Erreur lors de la création de l\'exigence:', error);
      toast.error(`Impossible de créer l'exigence: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });
}
