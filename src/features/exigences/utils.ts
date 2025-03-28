
/**
 * Utilitaires pour les exigences
 */

import { Exigence } from '@/types/domain';
import { ImportanceLevel } from '@/types/enums';
import { ChecklistItem } from '../checklist/types';

/**
 * Calcule le pourcentage d'exigences par niveau d'importance
 * @param exigences Liste des exigences
 * @returns Pourcentage par niveau d'importance
 */
export function calculateImportancePercentage(exigences: Exigence[]) {
  const total = exigences.length;
  if (total === 0) return {};
  
  const counts: Record<ImportanceLevel, number> = {
    [ImportanceLevel.NA]: 0,
    [ImportanceLevel.Minor]: 0,
    [ImportanceLevel.Medium]: 0,
    [ImportanceLevel.Important]: 0,
    [ImportanceLevel.Major]: 0
  };
  
  exigences.forEach(exigence => {
    counts[exigence.importance] = (counts[exigence.importance] || 0) + 1;
  });
  
  const percentages: Record<ImportanceLevel, number> = {
    [ImportanceLevel.NA]: Math.round((counts[ImportanceLevel.NA] / total) * 100),
    [ImportanceLevel.Minor]: Math.round((counts[ImportanceLevel.Minor] / total) * 100),
    [ImportanceLevel.Medium]: Math.round((counts[ImportanceLevel.Medium] / total) * 100),
    [ImportanceLevel.Important]: Math.round((counts[ImportanceLevel.Important] / total) * 100),
    [ImportanceLevel.Major]: Math.round((counts[ImportanceLevel.Major] / total) * 100)
  };
  
  return percentages;
}

/**
 * Filtre une liste d'exigences selon les critères spécifiés
 * @param exigences Liste des exigences à filtrer
 * @param filters Critères de filtrage
 * @returns Liste filtrée d'exigences
 */
export function filterExigences(exigences: Exigence[], filters: Record<string, any> = {}) {
  return exigences.filter(exigence => {
    // Critère d'importance
    if (filters.importance && exigence.importance !== filters.importance) {
      return false;
    }
    
    // Si on a des items associés aux exigences
    if (exigence.item && filters.category && exigence.item.category !== filters.category) {
      return false;
    }
    
    // Recherche textuelle
    if (filters.search && typeof filters.search === 'string') {
      const search = filters.search.toLowerCase();
      const hasMatch = 
        (exigence.item?.name?.toLowerCase().includes(search)) ||
        (exigence.item?.consigne?.toLowerCase().includes(search)) ||
        (exigence.comment?.toLowerCase().includes(search));
      
      if (!hasMatch) return false;
    }
    
    return true;
  });
}

/**
 * Trie une liste d'exigences selon le critère spécifié
 * @param exigences Liste des exigences à trier
 * @param sortBy Critère de tri
 * @param sortDirection Direction du tri (asc/desc)
 * @returns Liste triée d'exigences
 */
export function sortExigences(
  exigences: Exigence[], 
  sortBy: string = 'importance', 
  sortDirection: 'asc' | 'desc' = 'desc'
) {
  const sorted = [...exigences];
  
  sorted.sort((a, b) => {
    let valueA, valueB;
    
    // Déterminer les valeurs à comparer selon le critère de tri
    switch (sortBy) {
      case 'importance':
        valueA = ImportanceLevel[a.importance];
        valueB = ImportanceLevel[b.importance];
        break;
      case 'consigne':
        valueA = a.item?.consigne || '';
        valueB = b.item?.consigne || '';
        break;
      case 'category':
        valueA = a.item?.category || '';
        valueB = b.item?.category || '';
        break;
      default:
        valueA = a[sortBy as keyof Exigence];
        valueB = b[sortBy as keyof Exigence];
    }
    
    // Appliquer la direction du tri
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
  
  return sorted;
}

/**
 * Associe des items de checklist aux exigences
 * @param exigences Liste d'exigences
 * @param items Liste d'items de checklist
 * @returns Exigences avec items associés
 */
export function enrichExigencesWithItems(exigences: Exigence[], items: ChecklistItem[]) {
  return exigences.map(exigence => {
    const item = items.find(item => item.id === exigence.itemId);
    return {
      ...exigence,
      item
    };
  });
}
