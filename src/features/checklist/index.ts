
/**
 * Feature Checklist
 * 
 * Ce module expose les fonctionnalités liées à la checklist,
 * qui représente le référentiel de bonnes pratiques pour les audits.
 */

// Réexporter les composants, hooks, types et utilitaires
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

// Fonctions d'accès aux données
import { checklistApi } from '@/services/notion/api/checklists';
import { ChecklistItem } from './types';

/**
 * Récupère tous les items de la checklist
 * 
 * @returns Promise résolvant vers un tableau d'items de checklist
 * @throws Error si la récupération échoue
 */
export async function getChecklistItems(): Promise<ChecklistItem[]> {
  try {
    return await checklistApi.getChecklistItems();
  } catch (error) {
    console.error('Erreur lors de la récupération des items de checklist:', error);
    throw new Error(`Impossible de récupérer les items de checklist: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Récupère un item de checklist par son identifiant
 * 
 * @param id - Identifiant unique de l'item
 * @returns Promise résolvant vers l'item ou null si non trouvé
 * @throws Error si la récupération échoue
 */
export async function getChecklistItemById(id: string): Promise<ChecklistItem | null> {
  try {
    return await checklistApi.getChecklistItemById(id);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'item de checklist ${id}:`, error);
    return null;
  }
}

/**
 * Crée un nouvel item de checklist
 * 
 * @param item - Données de l'item à créer (sans l'id)
 * @returns Promise résolvant vers l'item créé
 * @throws Error si la création échoue
 */
export async function createChecklistItem(item: Omit<ChecklistItem, 'id'>): Promise<ChecklistItem> {
  try {
    return await checklistApi.createChecklistItem(item);
  } catch (error) {
    console.error(`Erreur lors de la création de l'item de checklist:`, error);
    throw new Error(`Impossible de créer l'item de checklist: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour un item de checklist existant
 * 
 * @param item - Item de checklist à mettre à jour
 * @returns Promise résolvant vers l'item mis à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateChecklistItem(item: ChecklistItem): Promise<ChecklistItem> {
  try {
    return await checklistApi.updateChecklistItem(item);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'item de checklist ${item.id}:`, error);
    throw new Error(`Impossible de mettre à jour l'item de checklist: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Supprime un item de checklist
 * 
 * @param id - Identifiant unique de l'item à supprimer
 * @returns Promise résolvant vers true si la suppression a réussi
 * @throws Error si la suppression échoue
 */
export async function deleteChecklistItem(id: string): Promise<boolean> {
  try {
    return await checklistApi.deleteChecklistItem(id);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'item de checklist ${id}:`, error);
    throw new Error(`Impossible de supprimer l'item de checklist: ${error instanceof Error ? error.message : String(error)}`);
  }
}
