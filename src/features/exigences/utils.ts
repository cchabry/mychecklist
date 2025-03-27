
/**
 * Utilitaires pour les exigences
 */

import { ImportanceLevel } from '@/types/enums';
import { ExigenceWithItem, ExigenceFilters, Exigence, ExigenceSortOption } from './types';
import { ChecklistItem } from '@/types/domain';

/**
 * Associe les items de checklist aux exigences
 * 
 * @param exigences - Liste des exigences
 * @param checklistItems - Liste des items de checklist
 * @returns Exigences enrichies avec les informations des items de checklist
 */
export function enrichExigencesWithItems(
  exigences: Exigence[], 
  checklistItems: ChecklistItem[]
): ExigenceWithItem[] {
  const itemsMap = new Map<string, ChecklistItem>();
  
  // Créer un index des items de checklist pour un accès rapide
  checklistItems.forEach(item => {
    itemsMap.set(item.id, item);
  });
  
  // Associer chaque exigence à son item de checklist
  return exigences.map(exigence => {
    const checklistItem = itemsMap.get(exigence.itemId) || {
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
    };
    
    return {
      ...exigence,
      checklistItem
    };
  });
}

/**
 * Filtre les exigences selon des critères spécifiques
 * 
 * @param exigences - Liste des exigences à filtrer
 * @param filters - Critères de filtrage
 * @returns Exigences filtrées
 */
export function filterExigences(exigences: ExigenceWithItem[], filters: ExigenceFilters): ExigenceWithItem[] {
  return exigences.filter(exigence => {
    // Filtrer par texte de recherche
    if (filters.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      const inConsigne = exigence.checklistItem?.consigne?.toLowerCase().includes(searchLower) || false;
      const inDescription = exigence.checklistItem?.description?.toLowerCase().includes(searchLower) || false;
      const inComment = exigence.comment?.toLowerCase().includes(searchLower) || false;
      
      if (!inConsigne && !inDescription && !inComment) {
        return false;
      }
    }
    
    // Filtrer par niveau d'importance
    if (filters.importance && exigence.importance !== filters.importance) {
      return false;
    }
    
    // Filtrer par catégorie
    if (filters.category && exigence.checklistItem?.category !== filters.category) {
      return false;
    }
    
    // Filtrer par sous-catégorie
    if (filters.subcategory && exigence.checklistItem?.subcategory !== filters.subcategory) {
      return false;
    }
    
    return true;
  });
}

/**
 * Trie les exigences selon un critère spécifique
 * 
 * @param exigences - Liste des exigences à trier
 * @param sortOption - Option de tri
 * @returns Exigences triées
 */
export function sortExigences(exigences: ExigenceWithItem[], sortOption: ExigenceSortOption): ExigenceWithItem[] {
  const sortedExigences = [...exigences];
  
  // Ordre de priorité des niveaux d'importance
  const importanceOrder = {
    [ImportanceLevel.Major]: 5,
    [ImportanceLevel.Important]: 4,
    [ImportanceLevel.Medium]: 3,
    [ImportanceLevel.Minor]: 2,
    [ImportanceLevel.NotApplicable]: 1
  };
  
  switch (sortOption) {
    case 'importance_desc':
      return sortedExigences.sort((a, b) => 
        (importanceOrder[b.importance] || 0) - (importanceOrder[a.importance] || 0)
      );
    case 'importance_asc':
      return sortedExigences.sort((a, b) => 
        (importanceOrder[a.importance] || 0) - (importanceOrder[b.importance] || 0)
      );
    case 'category_asc':
      return sortedExigences.sort((a, b) => 
        (a.checklistItem?.category || '').localeCompare(b.checklistItem?.category || '')
      );
    case 'category_desc':
      return sortedExigences.sort((a, b) => 
        (b.checklistItem?.category || '').localeCompare(a.checklistItem?.category || '')
      );
    default:
      return sortedExigences;
  }
}

/**
 * Extrait les catégories uniques d'une liste d'exigences
 */
export function extractUniqueCategories(exigences: ExigenceWithItem[]): string[] {
  const categories = new Set<string>();
  
  exigences.forEach(exigence => {
    if (exigence.checklistItem?.category) {
      categories.add(exigence.checklistItem.category);
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * Extrait les sous-catégories uniques d'une liste d'exigences
 */
export function extractUniqueSubcategories(exigences: ExigenceWithItem[]): string[] {
  const subcategories = new Set<string>();
  
  exigences.forEach(exigence => {
    if (exigence.checklistItem?.subcategory) {
      subcategories.add(exigence.checklistItem.subcategory);
    }
  });
  
  return Array.from(subcategories).sort();
}

/**
 * Calcule des statistiques sur les exigences d'un projet
 */
export function getExigenceStats(exigences: ExigenceWithItem[]) {
  const total = exigences.length;
  const byImportance = {
    [ImportanceLevel.Major]: 0,
    [ImportanceLevel.Important]: 0,
    [ImportanceLevel.Medium]: 0,
    [ImportanceLevel.Minor]: 0,
    [ImportanceLevel.NotApplicable]: 0
  };
  
  exigences.forEach(exigence => {
    byImportance[exigence.importance as keyof typeof byImportance]++;
  });
  
  const applicable = total - byImportance[ImportanceLevel.NotApplicable];
  
  return {
    total,
    applicable,
    byImportance
  };
}

/**
 * Regroupe les exigences par catégorie
 */
export function groupExigencesByCategory(exigences: ExigenceWithItem[]) {
  const grouped: Record<string, ExigenceWithItem[]> = {};
  
  exigences.forEach(exigence => {
    const category = exigence.checklistItem?.category || 'Non catégorisé';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(exigence);
  });
  
  return grouped;
}

/**
 * Compte les exigences par niveau d'importance
 */
export function countExigencesByImportance(exigences: ExigenceWithItem[]) {
  const counts = {
    [ImportanceLevel.Major]: 0,
    [ImportanceLevel.Important]: 0,
    [ImportanceLevel.Medium]: 0,
    [ImportanceLevel.Minor]: 0,
    [ImportanceLevel.NotApplicable]: 0
  };
  
  exigences.forEach(exigence => {
    counts[exigence.importance as keyof typeof counts]++;
  });
  
  return counts;
}
