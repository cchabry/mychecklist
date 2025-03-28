/**
 * Utilitaires pour la feature Exigences
 * 
 * Ce module fournit des fonctions utilitaires pour manipuler et
 * enrichir les données des exigences.
 */

import { Exigence, ChecklistItem } from '@/types/domain';
import { ExigenceWithItem } from './types';

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
