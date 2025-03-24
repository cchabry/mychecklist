
import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';
import { v4 as uuidv4 } from 'uuid';

// Types (à intégrer avec les types existants)
export interface Action {
  id: string;
  evaluationId: string;
  targetScore: string;
  priority: string;
  dueDate: string;
  responsible: string;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Récupère toutes les actions liées à une évaluation
 * @param evaluationId ID de l'évaluation
 */
export async function getActionsByEvaluationId(evaluationId: string) {
  // Simuler un délai si en mode démo
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur aléatoire si activé
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Retourner les actions filtrées pour cette évaluation
    const result = mockData.actions.filter(action => action.evaluationId === evaluationId);
    console.log(`Récupération de ${result.length} actions pour l'évaluation ${evaluationId}`);
    return result;
  }
  
  // En mode réel, implémenter la logique pour récupérer les actions depuis Notion
  throw new Error('Récupération des actions depuis Notion non implémentée');
}

/**
 * Crée une nouvelle action corrective pour une évaluation
 * @param action Données de l'action à créer
 */
export async function createAction(action: Omit<Action, 'id' | 'createdAt' | 'updatedAt'>) {
  // Simuler un délai si en mode démo
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur aléatoire si activé
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Générer un ID unique et des timestamps
    const now = new Date().toISOString();
    const newAction: Action = {
      ...action,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    
    // Ajouter l'action aux données mockées
    mockData.actions.push(newAction);
    
    // Simuler un retard pour l'expérience utilisateur
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Action créée avec succès:', newAction);
    return newAction;
  }
  
  // En mode réel, implémenter la logique pour créer une action dans Notion
  throw new Error('Création d\'action dans Notion non implémentée');
}

/**
 * Met à jour une action existante
 * @param actionId ID de l'action à mettre à jour
 * @param actionData Données à mettre à jour
 */
export async function updateAction(actionId: string, actionData: Partial<Action>) {
  // Simuler un délai si en mode démo
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur aléatoire si activé
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Trouver l'action dans les données mockées
    const actionIndex = mockData.actions.findIndex(action => action.id === actionId);
    
    if (actionIndex === -1) {
      throw new Error(`Action avec l'ID ${actionId} non trouvée`);
    }
    
    // Mettre à jour l'action
    mockData.actions[actionIndex] = {
      ...mockData.actions[actionIndex],
      ...actionData,
      updatedAt: new Date().toISOString()
    };
    
    // Simuler un retard pour l'expérience utilisateur
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Action mise à jour avec succès:', mockData.actions[actionIndex]);
    return mockData.actions[actionIndex];
  }
  
  // En mode réel, implémenter la logique pour mettre à jour une action dans Notion
  throw new Error('Mise à jour d\'action dans Notion non implémentée');
}

/**
 * Supprime une action existante
 * @param actionId ID de l'action à supprimer
 */
export async function deleteAction(actionId: string) {
  // Simuler un délai si en mode démo
  if (operationMode.isDemoMode) {
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur aléatoire si activé
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Trouver l'action dans les données mockées
    const actionIndex = mockData.actions.findIndex(action => action.id === actionId);
    
    if (actionIndex === -1) {
      throw new Error(`Action avec l'ID ${actionId} non trouvée`);
    }
    
    // Supprimer l'action
    const deletedAction = mockData.actions[actionIndex];
    mockData.actions.splice(actionIndex, 1);
    
    // Simuler un retard pour l'expérience utilisateur
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Action supprimée avec succès:', deletedAction);
    return { success: true, id: actionId };
  }
  
  // En mode réel, implémenter la logique pour supprimer une action dans Notion
  throw new Error('Suppression d\'action dans Notion non implémentée');
}
