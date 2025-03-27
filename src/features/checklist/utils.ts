
/**
 * Utilitaires pour les items de checklist
 */

import { ChecklistItem, ChecklistFilters, ChecklistSortOption } from './types';

/**
 * Filtre les items de checklist selon des critères spécifiques
 * 
 * @param items - Liste des items à filtrer
 * @param filters - Critères de filtrage
 * @returns Items filtrés
 */
export function filterChecklistItems(items: ChecklistItem[], filters: ChecklistFilters): ChecklistItem[] {
  return items.filter(item => {
    // Filtrer par texte de recherche
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      const inConsigne = item.consigne.toLowerCase().includes(searchLower);
      const inDescription = item.description.toLowerCase().includes(searchLower);
      
      if (!inConsigne && !inDescription) {
        return false;
      }
    }
    
    // Filtrer par catégorie
    if (filters.category && item.category !== filters.category) {
      return false;
    }
    
    // Filtrer par sous-catégorie
    if (filters.subcategory && item.subcategory !== filters.subcategory) {
      return false;
    }
    
    // Filtrer par profil
    if (filters.profile && filters.profile.length > 0) {
      if (!item.profil.some(p => filters.profile?.includes(p))) {
        return false;
      }
    }
    
    // Filtrer par phase
    if (filters.phase && filters.phase.length > 0) {
      if (!item.phase.some(p => filters.phase?.includes(p))) {
        return false;
      }
    }
    
    // Filtrer par priorité
    if (filters.priority) {
      const priorityLevel = item.priority >= 4 ? 'HAUTE' : (item.priority >= 3 ? 'MOYENNE' : 'BASSE');
      if (priorityLevel !== filters.priority) {
        return false;
      }
    }
    
    // Filtrer par effort
    if (filters.effort) {
      const effortLevel = item.effort >= 4 ? 'ÉLEVÉ' : (item.effort >= 3 ? 'MOYEN' : 'FAIBLE');
      if (effortLevel !== filters.effort) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Trie les items de checklist selon un critère spécifique
 * 
 * @param items - Liste des items à trier
 * @param sortOption - Option de tri
 * @returns Items triés
 */
export function sortChecklistItems(items: ChecklistItem[], sortOption: ChecklistSortOption): ChecklistItem[] {
  const sortedItems = [...items];
  
  switch (sortOption) {
    case 'priority_desc':
      return sortedItems.sort((a, b) => b.priority - a.priority);
    case 'priority_asc':
      return sortedItems.sort((a, b) => a.priority - b.priority);
    case 'effort_desc':
      return sortedItems.sort((a, b) => b.effort - a.effort);
    case 'effort_asc':
      return sortedItems.sort((a, b) => a.effort - b.effort);
    case 'category_asc':
      return sortedItems.sort((a, b) => a.category.localeCompare(b.category));
    case 'category_desc':
      return sortedItems.sort((a, b) => b.category.localeCompare(a.category));
    default:
      return sortedItems;
  }
}

/**
 * Extrait les catégories uniques d'une liste d'items
 */
export function extractUniqueCategories(items: ChecklistItem[]): string[] {
  const categories = new Set<string>();
  
  items.forEach(item => {
    if (item.category) {
      categories.add(item.category);
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * Extrait les sous-catégories uniques d'une liste d'items
 */
export function extractUniqueSubcategories(items: ChecklistItem[]): string[] {
  const subcategories = new Set<string>();
  
  items.forEach(item => {
    if (item.subcategory) {
      subcategories.add(item.subcategory);
    }
  });
  
  return Array.from(subcategories).sort();
}

/**
 * Extrait les profils uniques d'une liste d'items
 */
export function extractUniqueProfiles(items: ChecklistItem[]): string[] {
  const profiles = new Set<string>();
  
  items.forEach(item => {
    item.profil.forEach(profile => {
      profiles.add(profile);
    });
  });
  
  return Array.from(profiles).sort();
}

/**
 * Extrait les phases uniques d'une liste d'items
 */
export function extractUniquePhases(items: ChecklistItem[]): string[] {
  const phases = new Set<string>();
  
  items.forEach(item => {
    item.phase.forEach(phase => {
      phases.add(phase);
    });
  });
  
  return Array.from(phases).sort();
}

/**
 * Convertit un niveau numérique d'effort en catégorie
 */
export function getEffortLevel(effort: number): string {
  if (effort >= 4) return 'ÉLEVÉ';
  if (effort >= 3) return 'MOYEN';
  return 'FAIBLE';
}

/**
 * Convertit un niveau numérique de priorité en catégorie
 */
export function getPriorityLevel(priority: number): string {
  if (priority >= 4) return 'HAUTE';
  if (priority >= 3) return 'MOYENNE';
  return 'BASSE';
}
