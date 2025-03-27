
/**
 * Feature Checklist
 * 
 * Ce module expose les fonctionnalités liées à la gestion des items de checklist
 * qui servent de référentiel pour les critères d'évaluation.
 */

// Réexporter les composants, hooks et utilitaires pour faciliter l'accès
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

// Fonctions d'accès aux données
import { checklistsApi } from '@/services/notion/api/checklists';
import { ChecklistItem } from './types';

/**
 * Récupère tous les items de checklist
 * 
 * @returns Promise résolvant vers un tableau d'items de checklist
 * @throws Error si la récupération échoue
 */
export async function getChecklistItems(): Promise<ChecklistItem[]> {
  try {
    return await checklistsApi.getChecklistItems();
  } catch (error) {
    console.error(`Erreur lors de la récupération des items de checklist:`, error);
    throw new Error(`Impossible de récupérer les items de checklist: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Récupère un item de checklist par son identifiant
 * 
 * @param id - Identifiant unique de l'item
 * @returns Promise résolvant vers l'item de checklist ou null si non trouvé
 * @throws Error si la récupération échoue
 */
export async function getChecklistItemById(id: string): Promise<ChecklistItem | null> {
  try {
    return await checklistsApi.getChecklistItemById(id);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'item de checklist ${id}:`, error);
    return null;
  }
}
