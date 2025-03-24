
import { operationMode } from '@/services/operationMode';

/**
 * Utilitaires pour le mode mock
 */
export const mockUtils = {
  /**
   * Vérifie si le mode mock est activé
   */
  isMockModeEnabled(): boolean {
    // Vérifier le localStorage et l'objet operationMode
    return localStorage.getItem('notion_mock_mode') === 'true' || operationMode.isDemoMode;
  },
  
  /**
   * Vérifie si le mode réel est forcé temporairement
   */
  isRealModeForced(): boolean {
    return localStorage.getItem('notion_force_real') === 'true';
  },
  
  /**
   * Applique un délai aléatoire simulé
   */
  async applyMockDelay(): Promise<void> {
    const config = this.getMockConfig();
    const delayMin = config.delayMin || 100;
    const delayMax = config.delayMax || 1000;
    
    // Calculer un délai aléatoire entre min et max
    const delay = Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin;
    
    // Appliquer le délai
    await new Promise(resolve => setTimeout(resolve, delay));
  },
  
  /**
   * Détermine si une erreur simulée doit être générée
   */
  shouldSimulateError(): boolean {
    const config = this.getMockConfig();
    const errorRate = config.errorRate || 0.05;
    
    // Générer une erreur avec la probabilité définie dans la config
    return Math.random() < errorRate;
  },
  
  /**
   * Récupère la configuration du mode mock
   */
  getMockConfig(): any {
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
  },
  
  /**
   * Récupère un scénario pour le mode mock
   */
  getScenario(name: string): any {
    return { type: 'default' }; // Implémentation simplifiée
  }
};
