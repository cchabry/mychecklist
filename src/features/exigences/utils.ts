
/**
 * Utilitaires pour la feature Exigences
 * 
 * Ce module fournit des fonctions utilitaires pour manipuler et
 * enrichir les données des exigences.
 */

import { Exigence, ChecklistItem } from '@/types/domain';
import { ExigenceWithItem } from './types';
import { ImportanceLevel } from '@/types/enums';

/**
 * Enrichit les exigences avec leurs items de checklist correspondants
 * 
 * @param exigences - Liste des exigences
 * @param checklistItems - Liste des items de checklist
 * @returns Exigences enrichies avec leurs items de checklist
 */
export function enrichExigencesWithItems(exigences: Exigence[], checklistItems: ChecklistItem[]): ExigenceWithItem[] {
  return exigences.map(exigence => {
    const checklistItem = checklistItems.find(item => item.id === exigence.itemId);
    
    return {
      ...exigence,
      checklistItem: checklistItem
    } as ExigenceWithItem;
  });
}

/**
 * Filtre les exigences selon des critères spécifiques
 * 
 * @param exigences - Liste des exigences à filtrer
 * @param filters - Critères de filtrage
 * @returns Liste des exigences filtrées
 */
export function filterExigences(exigences: ExigenceWithItem[], filters: any): ExigenceWithItem[] {
  if (!filters || Object.keys(filters).length === 0) {
    return exigences;
  }
  
  return exigences.filter(exigence => {
    // Filtrer par terme de recherche
    if (filters.search && exigence.checklistItem) {
      const searchTerm = filters.search.toLowerCase();
      const consigne = exigence.checklistItem.consigne?.toLowerCase() || '';
      const description = exigence.checklistItem.description?.toLowerCase() || '';
      
      if (!consigne.includes(searchTerm) && !description.includes(searchTerm)) {
        return false;
      }
    }
    
    // Filtrer par importance
    if (filters.importance && exigence.importance !== filters.importance) {
      return false;
    }
    
    // Filtrer par catégorie
    if (filters.category && exigence.checklistItem && exigence.checklistItem.category !== filters.category) {
      return false;
    }
    
    return true;
  });
}

/**
 * Trie les exigences selon un critère spécifique
 * 
 * @param exigences - Liste des exigences à trier
 * @param sortBy - Critère de tri
 * @param sortDirection - Direction du tri (asc ou desc)
 * @returns Liste des exigences triées
 */
export function sortExigences(
  exigences: ExigenceWithItem[], 
  sortBy: string = 'importance', 
  sortDirection: 'asc' | 'desc' = 'desc'
): ExigenceWithItem[] {
  const sortedExigences = [...exigences];
  
  sortedExigences.sort((a, b) => {
    if (sortBy === 'importance') {
      const importanceOrder = {
        [ImportanceLevel.Major]: 5,
        [ImportanceLevel.Important]: 4,
        [ImportanceLevel.High]: 4, // Équivalent à Important
        [ImportanceLevel.Medium]: 3,
        [ImportanceLevel.Minor]: 2,
        [ImportanceLevel.NotApplicable]: 1
      };
      
      const valueA = importanceOrder[a.importance] || 0;
      const valueB = importanceOrder[b.importance] || 0;
      
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    }
    
    if (sortBy === 'consigne' && a.checklistItem && b.checklistItem) {
      const valueA = a.checklistItem.consigne || '';
      const valueB = b.checklistItem.consigne || '';
      
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    if (sortBy === 'category' && a.checklistItem && b.checklistItem) {
      const valueA = a.checklistItem.category || '';
      const valueB = b.checklistItem.category || '';
      
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB) 
        : valueB.localeCompare(valueA);
    }
    
    return 0;
  });
  
  return sortedExigences;
}

/**
 * Formatte un commentaire d'exigence pour l'affichage
 * 
 * @param comment - Commentaire à formater
 * @returns Commentaire formaté
 */
export function formatExigenceComment(comment: string | undefined): string {
  if (!comment) {
    return "Aucun commentaire";
  }
  
  // Ajouter une logique de formatage plus complexe si nécessaire
  return comment;
}

/**
 * Génère une chaîne de recherche à partir des filtres d'exigence
 * 
 * @param filters - Filtres à appliquer
 * @returns Chaîne de recherche
 */
export function generateExigenceSearchString(filters: any): string {
  let searchString = '';
  
  if (filters.search) {
    searchString += `search=${filters.search}&`;
  }
  
  if (filters.importance) {
    searchString += `importance=${filters.importance}&`;
  }
  
  return searchString.slice(0, -1); // Retirer le dernier '&'
}
