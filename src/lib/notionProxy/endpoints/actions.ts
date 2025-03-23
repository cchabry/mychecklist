import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';

// Actions API endpoints
export async function getActions() {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Renvoyer les données de démonstration
    return mockData.getActions();
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour les actions');
}

export async function getActionById(id: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Renvoyer les données de démonstration
    return mockData.getAction(id);
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour les actions');
}

export async function createAction(data: any) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Créer une action simulée
    return mockData.createAction(data);
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour la création d\'actions');
}

export async function updateAction(id: string, data: any) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Mettre à jour l'action simulée
    return mockData.updateAction(id, data);
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour la mise à jour d\'actions');
}

export async function deleteAction(id: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Supprimer l'action simulée
    return mockData.deleteAction(id);
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour la suppression d\'actions');
}
