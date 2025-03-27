
/**
 * Hook pour accéder aux items de checklist
 */

import { useQuery } from '@tanstack/react-query';
import { getChecklistItems } from '..';

/**
 * Hook pour récupérer tous les items de checklist
 * 
 * @returns Résultat de la requête contenant les items de checklist
 */
export function useChecklistItems() {
  return useQuery({
    queryKey: ['checklistItems'],
    queryFn: async () => {
      return await getChecklistItems();
    }
  });
}
