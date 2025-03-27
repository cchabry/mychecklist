
/**
 * Utilitaires pour la gestion de la checklist
 */

import { ChecklistItem, ChecklistFilters, ChecklistSortOption } from './types';

/**
 * Filtre les items de checklist selon les critères spécifiés
 */
export function filterChecklistItems(
  items: ChecklistItem[],
  filters: ChecklistFilters
): ChecklistItem[] {
  return items.filter(item => {
    const { search, category, subcategory, priority, effort } = filters;
    
    // Filtrer par catégorie
    if (category && item.category !== category) {
      return false;
    }
    
    // Filtrer par sous-catégorie
    if (subcategory && item.subcategory !== subcategory) {
      return false;
    }
    
    // Filtrer par priorité
    if (priority) {
      const priorityLevel = getPriorityLevel(item.priority);
      if (priorityLevel !== priority) {
        return false;
      }
    }
    
    // Filtrer par effort
    if (effort) {
      const effortLevel = getEffortLevel(item.effort);
      if (effortLevel !== effort) {
        return false;
      }
    }
    
    // Filtrer par recherche textuelle
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesConsigne = item.consigne.toLowerCase().includes(searchLower);
      const matchesDescription = item.description.toLowerCase().includes(searchLower);
      
      if (!matchesConsigne && !matchesDescription) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Trie les items de checklist selon l'option spécifiée
 */
export function sortChecklistItems(
  items: ChecklistItem[],
  sortOption: ChecklistSortOption
): ChecklistItem[] {
  const sortedItems = [...items];
  
  switch (sortOption) {
    case 'consigne_asc':
      return sortedItems.sort((a, b) => a.consigne.localeCompare(b.consigne));
      
    case 'consigne_desc':
      return sortedItems.sort((a, b) => b.consigne.localeCompare(a.consigne));
      
    case 'category_asc':
      return sortedItems.sort((a, b) => a.category.localeCompare(b.category));
      
    case 'category_desc':
      return sortedItems.sort((a, b) => b.category.localeCompare(a.category));
      
    case 'priority_desc':
      return sortedItems.sort((a, b) => b.priority - a.priority);
      
    case 'priority_asc':
      return sortedItems.sort((a, b) => a.priority - b.priority);
      
    case 'effort_desc':
      return sortedItems.sort((a, b) => b.effort - a.effort);
      
    case 'effort_asc':
      return sortedItems.sort((a, b) => a.effort - b.effort);
      
    default:
      return sortedItems;
  }
}

/**
 * Extrait les catégories uniques des items de checklist
 */
export function extractUniqueCategories(items: ChecklistItem[]): string[] {
  const categories = items.map(item => item.category).filter(Boolean);
  return [...new Set(categories)].sort();
}

/**
 * Extrait les sous-catégories uniques des items de checklist
 */
export function extractUniqueSubcategories(items: ChecklistItem[]): string[] {
  const subcategories = items.map(item => item.subcategory).filter(Boolean);
  return [...new Set(subcategories)].sort();
}

/**
 * Convertit un niveau d'effort numérique en étiquette
 */
export function getEffortLevel(level: number): 'FAIBLE' | 'MOYEN' | 'ÉLEVÉ' {
  if (level <= 1) return 'FAIBLE';
  if (level <= 3) return 'MOYEN';
  return 'ÉLEVÉ';
}

/**
 * Convertit un niveau de priorité numérique en étiquette
 */
export function getPriorityLevel(level: number): 'BASSE' | 'MOYENNE' | 'HAUTE' {
  if (level <= 2) return 'BASSE';
  if (level <= 3) return 'MOYENNE';
  return 'HAUTE';
}
