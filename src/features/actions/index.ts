
/**
 * Point d'entrée pour la feature Actions
 */

// Réexporter depuis les sous-modules
export * from './types';
export * from './utils';
export * from './constants';
export * from './hooks';
export * from './components';

// Services et API
export { actionsApi } from '@/services/notion/api/actions';

// Fonctions d'accès aux données
import { actionsApi } from '@/services/notion/api/actions';
import { 
  CorrectiveAction, 
  CreateActionData, 
  UpdateActionData,
  ActionProgress,
  CreateProgressData
} from './types';

/**
 * Récupère toutes les actions liées à une évaluation
 * 
 * @param evaluationId - Identifiant de l'évaluation
 * @returns Promise résolvant vers un tableau d'actions
 * @throws Error si la récupération échoue
 */
export async function getActions(evaluationId: string): Promise<CorrectiveAction[]> {
  try {
    return await actionsApi.getActions(evaluationId);
  } catch (error) {
    console.error(`Erreur lors de la récupération des actions:`, error);
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
export async function getActionById(id: string): Promise<CorrectiveAction | null> {
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
 * @param data - Données de l'action à créer
 * @returns Promise résolvant vers l'action créée
 * @throws Error si la création échoue
 */
export async function createAction(data: CreateActionData): Promise<CorrectiveAction> {
  try {
    return await actionsApi.createAction(data);
  } catch (error) {
    console.error(`Erreur lors de la création de l'action:`, error);
    throw new Error(`Impossible de créer l'action: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Met à jour une action corrective existante
 * 
 * @param id - Identifiant unique de l'action
 * @param data - Données à mettre à jour
 * @returns Promise résolvant vers l'action mise à jour
 * @throws Error si la mise à jour échoue
 */
export async function updateAction(id: string, data: UpdateActionData): Promise<CorrectiveAction> {
  try {
    const existingAction = await actionsApi.getActionById(id);
    if (!existingAction) {
      throw new Error(`Action non trouvée`);
    }
    
    const updatedAction: CorrectiveAction = {
      ...existingAction,
      ...data,
    };
    
    return await actionsApi.updateAction(updatedAction);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'action ${id}:`, error);
    throw new Error(`Impossible de mettre à jour l'action: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Supprime une action corrective
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
 * Récupère tous les progrès d'une action
 * 
 * @param actionId - Identifiant de l'action
 * @returns Promise résolvant vers un tableau de progrès
 * @throws Error si la récupération échoue
 */
export async function getActionProgress(actionId: string): Promise<ActionProgress[]> {
  try {
    return await actionsApi.getActionProgress(actionId);
  } catch (error) {
    console.error(`Erreur lors de la récupération des progrès:`, error);
    throw new Error(`Impossible de récupérer les progrès: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Crée un nouveau progrès pour une action
 * 
 * @param data - Données du progrès à créer
 * @returns Promise résolvant vers le progrès créé
 * @throws Error si la création échoue
 */
export async function createActionProgress(data: CreateProgressData): Promise<ActionProgress> {
  try {
    return await actionsApi.createActionProgress(data);
  } catch (error) {
    console.error(`Erreur lors de la création du progrès:`, error);
    throw new Error(`Impossible de créer le progrès: ${error instanceof Error ? error.message : String(error)}`);
  }
}
