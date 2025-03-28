
/**
 * Hook pour accéder aux items de checklist
 */

import { useQuery } from '@tanstack/react-query';
import { checklistsApi } from '@/services/notion/api/checklists';
import { ChecklistItemFilter } from '@/types/domain/checklist';
import { adaptDomainListToFeature } from '../adapters';

/**
 * Hook pour récupérer tous les items de checklist
 * 
 * @param filter Filtre optionnel pour les items
 * @returns Résultat de la requête contenant les items de checklist
 */
export function useChecklistItems(filter?: ChecklistItemFilter) {
  return useQuery({
    queryKey: ['checklistItems', filter],
    queryFn: async () => {
      const domainItems = await checklistsApi.getChecklistItems(filter);
      return adaptDomainListToFeature(domainItems);
    }
  });
}
