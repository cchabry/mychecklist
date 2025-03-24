
import { operationMode, operationModeUtils } from '@/services/operationMode';
import { mockData } from '../mock/data';

// Checklist API endpoints
export async function getChecklist() {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Renvoyer les données de démonstration
    return mockData.getChecklistItems();
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour la checklist');
}

export async function getChecklistItemById(id: string) {
  // Vérifier si on est en mode démonstration
  if (operationMode.isDemoMode) {
    // Appliquer un délai pour simuler une requête réseau
    await operationModeUtils.applySimulatedDelay();
    
    // Simuler une erreur réseau aléatoire
    if (operationModeUtils.shouldSimulateError()) {
      operationModeUtils.simulateConnectionError();
    }
    
    // Renvoyer les données de démonstration
    return mockData.getChecklistItem(id);
  }
  
  // En mode réel, tenter d'utiliser l'API Notion
  // Implémentation à venir
  throw new Error('API Notion non implémentée pour la checklist');
}

// Autres fonctions pour la checklist...
