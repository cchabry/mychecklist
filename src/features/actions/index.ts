
/**
 * Fonctionnalité Actions
 * 
 * Ce module expose les fonctionnalités liées aux actions correctives,
 * qui représentent les tâches à effectuer suite aux évaluations.
 */

// Réexporter les composants, hooks, types et utilitaires
export * from './components';
export * from './hooks';
export * from './types';
export * from './utils';
export * from './constants';

// Fonctions d'accès aux données
import { actionsApi } from '@/services/notion/api/actions';
import { Action, ActionProgress } from '@/types/domain';

/**
 * Récupère toutes les actions correctives pour une évaluation
 * 
 * @param evaluationId - Identifiant de l'évaluation
 * @returns Promise résolvant vers un tableau d'actions
 * @throws Error si la récupération échoue
 */
export async function getActions(evaluationId: string): Promise<Action[]> {
  try {
    return await actionsApi.getActions(evaluationId);
  } catch (error) {
    console.error('Erreur lors de la récupération des actions:', error);
    throw new Error(`Impossible de récupérer les actions: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Récupère une action par son identifiant
 * 
 * @param id - Identifiant unique de l'action
 * @returns Promise résolvant vers l'action ou null si non trouvée
 * @throws Error si la récupération échoue
 */
export async function getActionById(id: string): Promise<Action | null> {
  try {
    return await actionsApi.getActionById(id);
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'action ${id}:`, error);
    return null;
  }
}

/**
 * Crée une nouvelle action corrective
 * 
 * @param action - Données de l'action à créer (sans l'id, createdAt, updatedAt)
 * @returns Promise résolvant vers l'action créée
 * @throws Error si la création échoue
 */
export async function createAction(action: Omit<Action, 'id' | 'createdAt' | 'updatedAt'>): Promise<Action> {
  try {
    return await actionsApi.createAction(action);
  } catch (error) {
    console.error(`Erreur lors de la création de l'action:`, error);
    throw new Error(`Impossible de créer l'action: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour une action existante
 * 
 * @param action - Action à mettre à jour
 * @returns Promise résolvant vers l'action mise à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateAction(action: Action): Promise<Action> {
  try {
    return await actionsApi.updateAction(action);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'action ${action.id}:`, error);
    throw new Error(`Impossible de mettre à jour l'action: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Supprime une action
 * 
 * @param id - Identifiant unique de l'action à supprimer
 * @returns Promise résolvant vers true si la suppression a réussi
 * @throws Error si la suppression échoue
 */
export async function deleteAction(id: string): Promise<boolean> {
  try {
    return await actionsApi.deleteAction(id);
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'action ${id}:`, error);
    throw new Error(`Impossible de supprimer l'action: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Récupère tous les progrès pour une action
 * 
 * @param actionId - Identifiant de l'action
 * @returns Promise résolvant vers un tableau de progrès
 * @throws Error si la récupération échoue
 */
export async function getActionProgress(actionId: string): Promise<ActionProgress[]> {
  try {
    return await actionsApi.getActionProgress(actionId);
  } catch (error) {
    console.error(`Erreur lors de la récupération des progrès pour l'action ${actionId}:`, error);
    throw new Error(`Impossible de récupérer les progrès: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Crée un nouveau progrès d'action
 * 
 * @param progress - Données du progrès à créer (sans l'id)
 * @returns Promise résolvant vers le progrès créé
 * @throws Error si la création échoue
 */
export async function createActionProgress(progress: Omit<ActionProgress, 'id'>): Promise<ActionProgress> {
  try {
    return await actionsApi.createActionProgress(progress);
  } catch (error) {
    console.error(`Erreur lors de la création du progrès:`, error);
    throw new Error(`Impossible de créer le progrès: ${error instanceof Error ? error.message : String(error)}`);
  }
}
