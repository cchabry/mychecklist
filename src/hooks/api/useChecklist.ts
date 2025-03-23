
import { useChecklistItem } from './useChecklistItem';
import { QueryFilters } from './types';

/**
 * Alias pour useChecklistItem pour compatibilité avec l'ancien code
 * @deprecated Utilisez useChecklistItem à la place
 */
export function useChecklist(filters?: QueryFilters) {
  return useChecklistItem(filters);
}

export { useChecklistItem };
