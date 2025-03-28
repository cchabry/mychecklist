
/**
 * Hook pour récupérer une exigence enrichie avec les informations de son item de checklist associé
 * 
 * Ce hook combine les données d'une exigence et de l'item de checklist associé,
 * permettant un accès simplifié aux informations complètes dans les composants.
 */

import { useState, useEffect } from 'react';
import { useExigenceById } from './useExigenceById';
import { useChecklistItemById } from '@/features/checklist/hooks';
import { ExigenceWithItem } from '../types';

/**
 * Hook pour récupérer une exigence enrichie avec les informations de son item de checklist associé
 * 
 * @param exigenceId - Identifiant de l'exigence à récupérer
 * @returns Objet contenant l'exigence enrichie avec son item de checklist, ainsi que l'état de chargement et les erreurs
 * 
 * @example
 * ```tsx
 * const { data: exigence, isLoading, error } = useExigenceWithItem('exigence-123');
 * 
 * if (isLoading) return <Loader />;
 * if (error) return <ErrorDisplay error={error} />;
 * if (!exigence) return <NotFound />;
 * 
 * return (
 *   <div>
 *     <h1>{exigence.checklistItem?.consigne}</h1>
 *     <p>Importance: {exigence.importance}</p>
 *     <p>Commentaire: {exigence.comment}</p>
 *   </div>
 * );
 * ```
 */
export function useExigenceWithItem(exigenceId: string) {
  const [data, setData] = useState<ExigenceWithItem | null>(null);
  
  // Récupérer les données de l'exigence
  const { 
    data: exigence, 
    isLoading: isExigenceLoading, 
    error: exigenceError 
  } = useExigenceById(exigenceId);
  
  // Récupérer les données de l'item de checklist associé
  const { 
    data: checklistItem, 
    isLoading: isItemLoading, 
    error: itemError 
  } = useChecklistItemById(exigence?.itemId);
  
  // Effet pour combiner les données de l'exigence et de l'item
  useEffect(() => {
    if (exigence && checklistItem) {
      const exigenceWithItem: ExigenceWithItem = {
        ...exigence,
        checklistItem
      };
      setData(exigenceWithItem);
    } else if (exigence) {
      // Si l'item n'est pas trouvé, créer un item placeholder
      const exigenceWithItem: ExigenceWithItem = {
        ...exigence,
        checklistItem: {
          id: exigence.itemId,
          consigne: 'Item inconnu',
          description: 'Cet item de checklist n\'existe plus ou n\'est pas accessible',
          category: 'Non catégorisé',
          subcategory: 'Non catégorisé',
          reference: [],
          profil: [],
          phase: [],
          effort: 0,
          priority: 0
        }
      };
      setData(exigenceWithItem);
    } else {
      setData(null);
    }
  }, [exigence, checklistItem]);
  
  // Déterminer l'état de chargement global
  const isLoading = isExigenceLoading || (!!exigence?.itemId && isItemLoading);
  
  // Combiner les erreurs
  const error = exigenceError || itemError;
  
  return { data, isLoading, error };
}
