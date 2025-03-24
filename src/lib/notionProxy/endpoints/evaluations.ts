
import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';

// Evaluations API endpoints
export async function getEvaluations() {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Renvoyer les données de démonstration
    return mockData.getEvaluations();
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour les évaluations');
}

export async function getEvaluationById(id: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Renvoyer les données de démonstration
    return mockData.getEvaluation(id);
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour les évaluations');
}

// Autres fonctions pour les évaluations...
