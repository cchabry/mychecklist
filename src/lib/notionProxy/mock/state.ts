
/**
 * État interne du mode mock
 */
let _mockModeActive = false;
let _temporarilyForceReal = false;
let _originalMockState = false;
let _isMockModePermanent = false;

/**
 * Configuration du mode mock
 */
export interface MockConfig {
  scenario: string;
  delay: number;
  errorRate: number;
}

// Configuration par défaut
const DEFAULT_CONFIG: MockConfig = {
  scenario: 'standard', // standard, partial-failure, full-failure
  delay: 500, // délai simulé en ms
  errorRate: 0 // taux d'erreur simulé (0-100)
};

let _mockConfig: MockConfig = { ...DEFAULT_CONFIG };

/**
 * Module de gestion de l'état interne du mode mock
 */
export const mockState = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive(): boolean {
    return _temporarilyForceReal ? false : _mockModeActive;
  },
  
  /**
   * Définit l'état actif/inactif du mode mock
   */
  setActive(active: boolean): void {
    _mockModeActive = active;
  },
  
  /**
   * Vérifie si le mode est temporairement forcé en réel
   */
  isTemporarilyForcedReal(): boolean {
    return _temporarilyForceReal;
  },
  
  /**
   * Force temporairement le mode réel
   */
  setTemporarilyForceReal(force: boolean): void {
    if (force) {
      _originalMockState = _mockModeActive;
    }
    _temporarilyForceReal = force;
  },
  
  /**
   * Vérifie si le mode mock est permanent
   */
  isPermanent(): boolean {
    return _isMockModePermanent;
  },
  
  /**
   * Définit si le mode mock est permanent
   */
  setPermanent(permanent: boolean): void {
    _isMockModePermanent = permanent;
    if (permanent) {
      _mockModeActive = true;
    }
  },
  
  /**
   * Récupère l'état original du mode mock (avant forçage temporaire)
   */
  getOriginalState(): boolean {
    return _originalMockState;
  },
  
  /**
   * Récupère la configuration mock actuelle
   */
  getConfig(): MockConfig {
    return { ..._mockConfig };
  },
  
  /**
   * Met à jour la configuration mock
   */
  updateConfig(config: Partial<MockConfig>): void {
    _mockConfig = { ..._mockConfig, ...config };
  },
  
  /**
   * Réinitialise la configuration mock aux valeurs par défaut
   */
  resetConfig(): void {
    _mockConfig = { ...DEFAULT_CONFIG };
  }
};
