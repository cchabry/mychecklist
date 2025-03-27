
/**
 * Hook pour récupérer une exigence avec l'item de checklist associé
 */

import { useState, useEffect } from 'react';
import { useChecklistItemById } from '@/features/checklist/hooks';
import { useExigenceById } from './useExigenceById';
import { ExigenceWithItem } from '../types';
import { enrichExigencesWithItems } from '../utils';

/**
 * Hook pour récupérer une exigence avec l'item de checklist associé
 * 
 * @param exigenceId - Identifiant de l'exigence
 * @returns Exigence enrichie avec les informations de l'item de checklist
 */
export function useExigenceWithItem(exigenceId: string) {
  const { data: exigence, isLoading: isLoadingExigence, error: exigenceError } = useExigenceById(exigenceId);
  const { data: checklistItem, isLoading: isLoadingItem, error: itemError } = useChecklistItemById(exigence?.itemId || '');
  
  const [exigenceWithItem, setExigenceWithItem] = useState<ExigenceWithItem | null>(null);

  useEffect(() => {
    if (exigence && checklistItem) {
      const enriched = enrichExigencesWithItems([exigence], [checklistItem])[0];
      setExigenceWithItem(enriched);
    } else if (exigence) {
      // Si l'item n'est pas trouvé, on crée quand même l'exigence enrichie avec un item undefined
      setExigenceWithItem({
        ...exigence,
        checklistItem: undefined
      });
    }
  }, [exigence, checklistItem]);

  return {
    data: exigenceWithItem,
    isLoading: isLoadingExigence || (exigence && isLoadingItem),
    error: exigenceError || itemError
  };
}
