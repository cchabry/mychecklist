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

// Correction de la signature pour ne pas attendre d'argument (ou le rendre facultatif)
export async function temporarilyForceReal() {
  // Vous ne devriez pas appeler mockMode directement ici
  // mais plutôt utiliser l'operationMode
  const wasInDemoMode = operationMode.isDemoMode;
  
  // Si c'était en mode démo, le désactiver temporairement
  if (wasInDemoMode) {
    operationMode.enableRealMode();
    console.log('Mode réel temporairement forcé pour une opération Notion');
  }
  
  return wasInDemoMode;
}

export async function restoreAfterForceReal(wasInDemoMode: boolean) {
  // Restaurer le mode démo si c'était actif avant
  if (wasInDemoMode) {
    operationMode.enableDemoMode('Restauration du mode démo après opération temporaire');
    console.log('Mode démonstration restauré après opération Notion temporaire');
  }
}

// Autres fonctions pour les actions...
