
/**
 * Utilitaires pour les exigences
 */

import { ImportanceLevel } from '@/types/enums';
import { ChecklistItem } from '@/features/checklist/types';
import { Exigence, ExigenceWithItem, ExigenceSortOption, ExigenceFilters, ExigenceStat } from './types';

/**
 * Enrichit les exigences avec les informations des items de checklist associés
 * 
 * @param exigences - Liste des exigences
 * @param checklistItems - Liste des items de checklist
 * @returns Liste des exigences enrichies
 */
export function enrichExigencesWithItems(exigences: Exigence[], checklistItems: ChecklistItem[]): ExigenceWithItem[] {
  const exigencesWithItems: ExigenceWithItem[] = exigences.map(exigence => {
    const item = checklistItems.find(item => item.id === exigence.itemId);
    
    return {
      ...exigence,
      checklistItem: item || {
        id: exigence.itemId,
        consigne: 'Item inconnu',
        description: 'Cet item de checklist n\'existe plus ou n\'est pas accessible',
        category: 'Non catégorisé',
        subcategory: 'Non catégorisé',
        reference: [],
        profil: [],
        phase: [],
        effort: 3,
        priority: 3
      }
    };
  });
  
  return exigencesWithItems;
}

/**
 * Filtre une liste d'exigences selon différents critères
 * 
 * @param exigences - Liste des exigences à filtrer
 * @param filters - Critères de filtrage
 * @returns Liste des exigences filtrées
 */
export function filterExigences(
  exigences: ExigenceWithItem[], 
  filters: ExigenceFilters
): ExigenceWithItem[] {
  return exigences.filter(exigence => {
    // Filtre par recherche textuelle (titre, description ou commentaire)
    const searchMatch = !filters.search || [
      exigence.checklistItem?.consigne,
      exigence.checklistItem?.description,
      exigence.comment
    ].some(text => 
      text && text.toLowerCase().includes(filters.search?.toLowerCase() || '')
    );
    
    // Filtre par importance
    const importanceMatch = !filters.importance || exigence.importance === filters.importance;
    
    // Filtre par catégorie
    const categoryMatch = !filters.category || exigence.checklistItem?.category === filters.category;
    
    // Filtre par sous-catégorie
    const subCategoryMatch = !filters.subCategory || exigence.checklistItem?.subcategory === filters.subCategory;
    
    return searchMatch && importanceMatch && categoryMatch && subCategoryMatch;
  });
}

/**
 * Trie une liste d'exigences selon différents critères
 * 
 * @param exigences - Liste des exigences à trier
 * @param sortOption - Option de tri
 * @returns Liste des exigences triées
 */
export function sortExigences(
  exigences: ExigenceWithItem[], 
  sortOption: ExigenceSortOption
): ExigenceWithItem[] {
  const sorted = [...exigences];
  
  switch (sortOption) {
    case 'importance_desc':
      return sorted.sort((a, b) => importanceToValue(b.importance) - importanceToValue(a.importance));
    
    case 'importance_asc':
      return sorted.sort((a, b) => importanceToValue(a.importance) - importanceToValue(b.importance));
    
    case 'category_asc':
      return sorted.sort((a, b) => {
        const catA = a.checklistItem?.category || '';
        const catB = b.checklistItem?.category || '';
        return catA.localeCompare(catB);
      });
    
    case 'category_desc':
      return sorted.sort((a, b) => {
        const catA = a.checklistItem?.category || '';
        const catB = b.checklistItem?.category || '';
        return catB.localeCompare(catA);
      });
    
    default:
      return sorted;
  }
}

/**
 * Calcule les statistiques pour un ensemble d'exigences
 * 
 * @param exigences - Liste des exigences
 * @returns Statistiques calculées
 */
export function calculateExigenceStats(exigences: ExigenceWithItem[]): ExigenceStat {
  const stats: ExigenceStat = {
    total: exigences.length,
    byImportance: {
      [ImportanceLevel.NotApplicable]: 0,
      [ImportanceLevel.Minor]: 0,
      [ImportanceLevel.Medium]: 0,
      [ImportanceLevel.Important]: 0,
      [ImportanceLevel.Major]: 0
    }
  };
  
  // Compter les exigences par niveau d'importance
  exigences.forEach(exigence => {
    stats.byImportance[exigence.importance]++;
  });
  
  return stats;
}

/**
 * Convertit un niveau d'importance en valeur numérique pour le tri
 * 
 * @param importance - Niveau d'importance
 * @returns Valeur numérique correspondante
 */
function importanceToValue(importance: ImportanceLevel): number {
  switch (importance) {
    case ImportanceLevel.NotApplicable:
      return 0;
    case ImportanceLevel.Minor:
      return 1;
    case ImportanceLevel.Medium:
      return 2;
    case ImportanceLevel.Important:
      return 3;
    case ImportanceLevel.Major:
      return 4;
    default:
      return -1;
  }
}
