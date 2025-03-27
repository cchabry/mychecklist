
/**
 * Utilitaires pour la gestion des exigences
 */

import { 
  Exigence,
  ExigenceWithItem,
  ExigenceFilters,
  ExigenceSortOption
} from './types';
import { ChecklistItem } from '@/types/domain';
import { ImportanceLevel } from '@/types/enums';

/**
 * Enrichit les exigences avec les informations des items de checklist
 */
export function enrichExigencesWithItems(
  exigences: Exigence[],
  checklistItems: ChecklistItem[]
): ExigenceWithItem[] {
  return exigences.map(exigence => {
    const checklistItem = checklistItems.find(item => item.id === exigence.itemId);
    
    return {
      ...exigence,
      checklistItem: checklistItem || {
        id: exigence.itemId,
        consigne: 'Item inconnu',
        description: 'Cet item n\'existe plus dans la checklist',
        category: 'Non catégorisé',
        subcategory: 'Non catégorisé',
        reference: [],
        profil: [],
        phase: [],
        effort: 0,
        priority: 0
      }
    };
  });
}

/**
 * Filtre les exigences selon les critères spécifiés
 */
export function filterExigences(
  exigences: ExigenceWithItem[],
  filters: ExigenceFilters
): ExigenceWithItem[] {
  return exigences.filter(exigence => {
    const { importance, category, subcategory, search } = filters;
    
    // Filtrer par importance
    if (importance && exigence.importance !== importance) {
      return false;
    }
    
    // Filtrer par catégorie
    if (category && exigence.checklistItem?.category !== category) {
      return false;
    }
    
    // Filtrer par sous-catégorie
    if (subcategory && exigence.checklistItem?.subcategory !== subcategory) {
      return false;
    }
    
    // Filtrer par recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesConsigne = exigence.checklistItem?.consigne.toLowerCase().includes(searchLower);
      const matchesDescription = exigence.checklistItem?.description.toLowerCase().includes(searchLower);
      const matchesComment = exigence.comment?.toLowerCase().includes(searchLower);
      
      if (!matchesConsigne && !matchesDescription && !matchesComment) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Trie les exigences selon l'option spécifiée
 */
export function sortExigences(
  exigences: ExigenceWithItem[],
  sortOption: ExigenceSortOption
): ExigenceWithItem[] {
  const sortedExigences = [...exigences];
  
  switch (sortOption) {
    case 'importance_desc':
      return sortedExigences.sort((a, b) => {
        const order = { 
          [ImportanceLevel.Major]: 5, 
          [ImportanceLevel.Important]: 4, 
          [ImportanceLevel.Medium]: 3, 
          [ImportanceLevel.Minor]: 2, 
          [ImportanceLevel.NotApplicable]: 1 
        };
        return (order[b.importance] || 0) - (order[a.importance] || 0);
      });
      
    case 'importance_asc':
      return sortedExigences.sort((a, b) => {
        const order = { 
          [ImportanceLevel.Major]: 5, 
          [ImportanceLevel.Important]: 4, 
          [ImportanceLevel.Medium]: 3, 
          [ImportanceLevel.Minor]: 2, 
          [ImportanceLevel.NotApplicable]: 1 
        };
        return (order[a.importance] || 0) - (order[b.importance] || 0);
      });
      
    case 'category_asc':
      return sortedExigences.sort((a, b) => {
        const categoryA = a.checklistItem?.category || '';
        const categoryB = b.checklistItem?.category || '';
        return categoryA.localeCompare(categoryB);
      });
      
    case 'category_desc':
      return sortedExigences.sort((a, b) => {
        const categoryA = a.checklistItem?.category || '';
        const categoryB = b.checklistItem?.category || '';
        return categoryB.localeCompare(categoryA);
      });
      
    default:
      return sortedExigences;
  }
}

/**
 * Calcule des statistiques sur les exigences
 */
export function calculateExigenceStats(exigences: Exigence[]) {
  const total = exigences.length;
  const byImportance = {
    [ImportanceLevel.Major]: exigences.filter(e => e.importance === ImportanceLevel.Major).length,
    [ImportanceLevel.Important]: exigences.filter(e => e.importance === ImportanceLevel.Important).length,
    [ImportanceLevel.Medium]: exigences.filter(e => e.importance === ImportanceLevel.Medium).length,
    [ImportanceLevel.Minor]: exigences.filter(e => e.importance === ImportanceLevel.Minor).length,
    [ImportanceLevel.NotApplicable]: exigences.filter(e => e.importance === ImportanceLevel.NotApplicable).length,
  };
  
  return { total, byImportance };
}
