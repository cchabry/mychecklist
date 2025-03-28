
/**
 * Hook pour récupérer un item de checklist par son ID
 */

import { useQuery } from '@tanstack/react-query';
import { checklistsApi } from '@/services/notion/api/checklists';
import { adaptDomainToFeature } from '../adapters';

/**
 * Hook pour récupérer un item de checklist par son ID
 * 
 * @param id ID de l'item à récupérer
 * @returns Résultat de la requête contenant l'item de checklist
 */
export function useChecklistItemById(id?: string) {
  return useQuery({
    queryKey: ['checklistItem', id],
    queryFn: async () => {
      if (!id) return null;
      const domainItem = await checklistsApi.getChecklistItemById(id);
      return domainItem ? adaptDomainToFeature(domainItem) : null;
    },
    enabled: !!id
  });
}
