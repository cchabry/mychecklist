
/**
 * Hook pour récupérer une exigence avec son item de checklist associé
 */

import { useQuery } from '@tanstack/react-query';
import { getExigenceById } from '..';
import { useChecklistItemById } from '@/features/checklist';
import { ExigenceWithItem } from '../types';

/**
 * Hook pour récupérer une exigence enrichie avec son item de checklist
 * 
 * @param id - Identifiant de l'exigence
 * @returns Exigence avec les détails de l'item de checklist associé
 */
export function useExigenceWithItem(id?: string) {
  // Récupérer l'exigence
  const { data: exigence, isLoading: isLoadingExigence, error: exigenceError } = useExigenceById(id);
  
  // Récupérer l'item de checklist associé si l'exigence est chargée
  const { data: checklistItem, isLoading: isLoadingItem, error: itemError } = useChecklistItemById(
    exigence?.itemId
  );
  
  // Combiner les résultats
  const isLoading = isLoadingExigence || (exigence && isLoadingItem);
  const error = exigenceError || itemError;
  
  let data: ExigenceWithItem | null = null;
  
  if (exigence && checklistItem) {
    data = {
      ...exigence,
      checklistItem
    };
  }
  
  return {
    data,
    isLoading,
    error,
    isError: !!error
  };
}
