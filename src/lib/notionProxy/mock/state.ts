
import { OperationMode } from '@/services/operationMode/types';
import { operationMode } from '@/services/operationMode';

/**
 * Activer le mode mock pour Notion API
 */
export function activateMockMode() {
  operationMode.enableDemoMode();
  localStorage.setItem('notion_mock_mode', 'true');
}

/**
 * Désactiver le mode mock pour Notion API
 */
export function deactivateMockMode() {
  operationMode.enableRealMode();
  localStorage.removeItem('notion_mock_mode');
}

/**
 * Mettre à jour la configuration du mode mock 
 */
export function updateMockConfig(config: any) {
  operationMode.updateSettings({
    mode: config.enabled ? OperationMode.DEMO : OperationMode.REAL
  });
  
  // Sauvegarder dans le localStorage pour la persistance
  localStorage.setItem('notion_mock_config', JSON.stringify(config));
}

/**
 * Récupérer la configuration du mode mock
 */
export function getMockConfig() {
  try {
    const configString = localStorage.getItem('notion_mock_config');
    if (configString) {
      return JSON.parse(configString);
    }
  } catch (e) {
    console.error('Erreur lors de la lecture de la configuration mock:', e);
  }
  
  return {
    enabled: operationMode.isDemoMode,
    errorRate: 0.05,
    delayMin: 100,
    delayMax: 1000
  };
}
