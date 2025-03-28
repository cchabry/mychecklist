
/**
 * Hook pour récupérer une exigence enrichie avec son item de checklist
 */

import { useQuery } from '@tanstack/react-query';
import { useExigenceById } from './useExigenceById';
import { useChecklistItemById } from '@/features/checklist/hooks';
import { ExigenceWithItem } from '../types';
import { toast } from 'sonner';

/**
 * Hook pour récupérer une exigence par son ID et l'enrichir avec son item de checklist
 * 
 * @param id - Identifiant de l'exigence à récupérer
 * @returns Résultat de la requête contenant l'exigence enrichie ou null si non trouvée
 */
export function useExigenceWithItem(id?: string) {
  const exigenceQuery = useExigenceById(id);
  
  const itemIdQuery = useQuery({
    queryKey: ['exigence-item-id', id],
    queryFn: () => exigenceQuery.data?.itemId || null,
    enabled: !!exigenceQuery.data
  });
  
  const checklistItemQuery = useChecklistItemById(itemIdQuery.data || '');
  
  return useQuery({
    queryKey: ['exigence-with-item', id],
    queryFn: async () => {
      try {
        if (!exigenceQuery.data) {
          return null;
        }
        
        // Attendre que les données de l'item soient chargées
        const checklistItem = checklistItemQuery.data;
        
        // Enrichir l'exigence avec l'item de checklist
        return {
          ...exigenceQuery.data,
          checklistItem
        } as ExigenceWithItem;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'exigence enrichie:', error);
        toast.error('Erreur de chargement', {
          description: 'Impossible de récupérer les détails de l\'exigence'
        });
        throw error;
      }
    },
    enabled: !!exigenceQuery.data && !!checklistItemQuery.data
  });
}
