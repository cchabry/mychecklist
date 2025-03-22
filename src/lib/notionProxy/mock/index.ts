
import { mockState, MockConfig } from './state';
import { mockStorage } from './storage';
import { mockUtils } from './utils';
import { mockExporter } from './exporter';

/**
 * Utilitaire pour gérer le mode mock de l'API Notion
 */
export const mockMode = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive(): boolean {
    return mockState.isActive();
  },
  
  /**
   * Active le mode mock
   */
  activate(): void {
    console.log('✅ Mode mock activé');
    mockState.setActive(true);
    mockStorage.saveToStorage();
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate(): void {
    // Ne pas désactiver si le mode est permanent
    if (mockState.isPermanent()) {
      console.log('⚠️ Impossible de désactiver le mode mock permanent');
      return;
    }
    
    console.log('✅ Mode mock désactivé');
    mockState.setActive(false);
    mockStorage.saveToStorage();
  },
  
  /**
   * Bascule entre mode mock actif et inactif
   */
  toggle(): boolean {
    if (mockState.isActive()) {
      this.deactivate();
    } else {
      this.activate();
    }
    return mockState.isActive();
  },
  
  /**
   * Force temporairement le mode réel pour une opération
   */
  temporarilyForceReal(): void {
    mockState.setTemporarilyForceReal(true);
    console.log('🔄 Mode réel forcé temporairement');
  },
  
  /**
   * Vérifie si le mode est temporairement forcé en réel
   */
  isTemporarilyForcedReal(): boolean {
    return mockState.isTemporarilyForcedReal();
  },
  
  /**
   * Restaure l'état original après un forçage temporaire
   */
  restoreState(): void {
    mockState.setTemporarilyForceReal(false);
    console.log(`🔄 État mock restauré (${mockState.getOriginalState() ? 'activé' : 'désactivé'})`);
  },
  
  /**
   * Alternative à restoreState pour plus de clarté dans certains cas
   */
  restoreAfterForceReal(): void {
    this.restoreState();
  },
  
  /**
   * Définit le mode mock comme permanent (ne peut être désactivé que manuellement)
   */
  setPermanent(): void {
    mockState.setPermanent(true);
    mockState.setActive(true);
    mockStorage.saveToStorage();
    console.log('🔒 Mode mock défini comme permanent');
  },
  
  /**
   * Vérifie si le mode mock est permanent
   */
  isPermanent(): boolean {
    return mockState.isPermanent();
  },
  
  /**
   * Réinitialise le mode mock (utile pour les tests)
   */
  reset(): void {
    mockState.setActive(false);
    mockState.setTemporarilyForceReal(false);
    mockState.setPermanent(false);
    mockStorage.clearStorage();
  },

  /**
   * Force une réinitialisation complète (y compris paramètres avancés)
   */
  forceReset(): void {
    this.reset();
    mockState.resetConfig();
    console.log('🔄 Réinitialisation complète du mode mock');
  },

  /**
   * Obtient le scénario de mock actuel
   */
  getScenario(): string {
    return mockState.getConfig().scenario;
  },

  /**
   * Définit le scénario de mock
   */
  setScenario(scenario: string): void {
    mockState.updateConfig({ scenario });
    mockStorage.saveToStorage();
    console.log(`✅ Scénario mock défini: ${scenario}`);
  },

  /**
   * Obtient le délai simulé
   */
  getDelay(): number {
    return mockState.getConfig().delay;
  },

  /**
   * Définit le délai simulé
   */
  setDelay(delay: number): void {
    mockState.updateConfig({ delay });
    mockStorage.saveToStorage();
    console.log(`✅ Délai mock défini: ${delay}ms`);
  },

  /**
   * Obtient le taux d'erreur simulé
   */
  getErrorRate(): number {
    return mockState.getConfig().errorRate;
  },

  /**
   * Définit le taux d'erreur simulé
   */
  setErrorRate(rate: number): void {
    const validRate = Math.max(0, Math.min(100, rate));
    mockState.updateConfig({ errorRate: validRate });
    mockStorage.saveToStorage();
    console.log(`✅ Taux d'erreur mock défini: ${validRate}%`);
  },

  /**
   * Applique un délai simulé (utile pour tester les états de chargement)
   */
  applySimulatedDelay: mockUtils.applySimulatedDelay,

  /**
   * Détermine si une erreur doit être simulée en fonction du taux d'erreur
   */
  shouldSimulateError: mockUtils.shouldSimulateError,

  /**
   * Exporte les données de mock au format CSV
   */
  exportMockDataCSV: mockExporter.exportMockDataCSV,
  
  /**
   * Télécharge les données de mock au format CSV
   */
  downloadMockDataCSV: mockExporter.downloadMockDataCSV
};

// Initialiser à partir du localStorage si on est dans un environnement navigateur
if (typeof window !== 'undefined') {
  mockStorage.loadFromStorage();
}

export default mockMode;
