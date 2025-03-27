
/**
 * Hook pour accéder à un item de checklist par son ID
 */

import { useQuery } from '@tanstack/react-query';
import { getChecklistItemById } from '..';

/**
 * Hook pour récupérer un item de checklist par son ID
 * 
 * @param id - Identifiant de l'item à récupérer
 * @returns Résultat de la requête contenant l'item de checklist
 */
export function useChecklistItemById(id?: string) {
  return useQuery({
    queryKey: ['checklistItem', id],
    queryFn: async () => {
      if (!id) return null;
      return await getChecklistItemById(id);
    },
    enabled: !!id
  });
}
