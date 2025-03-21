
// État interne du mode mock
let _mockModeActive = false;
let _temporarilyForceReal = false;
let _originalMockState = false;
let _isMockModePermanent = false;

// Nouveaux paramètres pour la version améliorée
let _mockScenario = 'standard';
let _mockDelay = 500;
let _mockErrorRate = 0;

/**
 * Utilitaire pour gérer le mode mock de l'API Notion
 */
export const mockMode = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive(): boolean {
    // Si on force temporairement le mode réel, on retourne false
    if (_temporarilyForceReal) {
      return false;
    }
    return _mockModeActive;
  },
  
  /**
   * Active le mode mock
   */
  activate(): void {
    console.log('✅ Mode mock activé');
    _mockModeActive = true;
    
    // Stocker l'état dans localStorage pour persistance entre les sessions
    try {
      localStorage.setItem('notion_mock_mode', 'true');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate(): void {
    console.log('✅ Mode mock désactivé');
    _mockModeActive = false;
    
    // Mettre à jour localStorage
    try {
      localStorage.setItem('notion_mock_mode', 'false');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Bascule entre mode mock actif et inactif
   */
  toggle(): boolean {
    if (_mockModeActive) {
      this.deactivate();
    } else {
      this.activate();
    }
    return _mockModeActive;
  },
  
  /**
   * Force temporairement le mode réel pour une opération
   */
  temporarilyForceReal(): void {
    _originalMockState = _mockModeActive;
    _temporarilyForceReal = true;
    console.log('🔄 Mode réel forcé temporairement');
  },
  
  /**
   * Vérifie si le mode réel est temporairement forcé
   */
  isTemporarilyForcedReal(): boolean {
    return _temporarilyForceReal;
  },
  
  /**
   * Restaure l'état original après un forçage temporaire
   */
  restoreState(): void {
    _temporarilyForceReal = false;
    console.log(`🔄 État mock restauré (${_originalMockState ? 'activé' : 'désactivé'})`);
  },
  
  /**
   * Alias de restoreState pour la compatibilité
   */
  restoreAfterForceReal(): void {
    this.restoreState();
  },
  
  /**
   * Charge l'état depuis localStorage lors de l'initialisation
   */
  loadFromStorage(): void {
    try {
      const storedMode = localStorage.getItem('notion_mock_mode');
      if (storedMode === 'true') {
        _mockModeActive = true;
        console.log('✅ Mode mock chargé depuis localStorage (activé)');
      } else if (storedMode === 'true_permanent') {
        _mockModeActive = true;
        _isMockModePermanent = true;
        console.log('✅ Mode mock permanent chargé depuis localStorage');
      }
      
      // Charger aussi les paramètres de simulation
      const storedScenario = localStorage.getItem('notion_mock_scenario');
      if (storedScenario) {
        _mockScenario = storedScenario;
      }
      
      const storedDelay = localStorage.getItem('notion_mock_delay');
      if (storedDelay) {
        _mockDelay = parseInt(storedDelay, 10);
      }
      
      const storedErrorRate = localStorage.getItem('notion_mock_error_rate');
      if (storedErrorRate) {
        _mockErrorRate = parseInt(storedErrorRate, 10);
      }
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Définit le mode mock comme permanent (ne peut être désactivé que manuellement)
   */
  setPermanent(): void {
    _isMockModePermanent = true;
    _mockModeActive = true;
    
    try {
      localStorage.setItem('notion_mock_mode', 'true_permanent');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
    
    console.log('🔒 Mode mock défini comme permanent');
  },
  
  /**
   * Vérifie si le mode mock est permanent
   */
  isPermanent(): boolean {
    return _isMockModePermanent;
  },
  
  /**
   * Réinitialise le mode mock (utile pour les tests)
   */
  reset(): void {
    _mockModeActive = false;
    _temporarilyForceReal = false;
    _originalMockState = false;
    _isMockModePermanent = false;
    
    try {
      localStorage.removeItem('notion_mock_mode');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Réinitialise complètement le mode mock et force le mode réel
   * Plus agressive que reset(), permet de nettoyer tous les états
   */
  forceReset(): void {
    this.reset();
    
    // Nettoyage supplémentaire
    try {
      localStorage.removeItem('notion_mock_mode');
      localStorage.removeItem('notion_mock_scenario');
      localStorage.removeItem('notion_mock_delay');
      localStorage.removeItem('notion_mock_error_rate');
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
    
    console.log('🧹 Réinitialisation forcée du mode mock, mode réel activé');
  },
  
  // PARAMÈTRES DE SIMULATION V2
  
  /**
   * Définit le scénario de mock
   */
  setScenario(scenario: string): void {
    _mockScenario = scenario;
    try {
      localStorage.setItem('notion_mock_scenario', scenario);
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Récupère le scénario de mock actuel
   */
  getScenario(): string {
    return _mockScenario;
  },
  
  /**
   * Définit le délai de réponse simulé (en ms)
   */
  setDelay(delay: number): void {
    _mockDelay = delay;
    try {
      localStorage.setItem('notion_mock_delay', delay.toString());
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Récupère le délai de réponse simulé
   */
  getDelay(): number {
    return _mockDelay;
  },
  
  /**
   * Définit le taux d'erreur simulé (0-100%)
   */
  setErrorRate(rate: number): void {
    _mockErrorRate = rate;
    try {
      localStorage.setItem('notion_mock_error_rate', rate.toString());
    } catch (e) {
      // Ignorer les erreurs de localStorage
    }
  },
  
  /**
   * Récupère le taux d'erreur simulé
   */
  getErrorRate(): number {
    return _mockErrorRate;
  },
  
  /**
   * Applique un délai simulé (utilisation asynchrone)
   */
  async applySimulatedDelay(): Promise<void> {
    if (this.isActive() && _mockDelay > 0) {
      return new Promise(resolve => setTimeout(resolve, _mockDelay));
    }
  },
  
  /**
   * Détermine si une erreur doit être simulée en fonction du taux d'erreur
   */
  shouldSimulateError(): boolean {
    if (!this.isActive() || _mockErrorRate <= 0) {
      return false;
    }
    
    // Générer un nombre aléatoire entre 0 et 100
    const randomValue = Math.random() * 100;
    
    // Si le nombre est inférieur au taux d'erreur, simuler une erreur
    return randomValue < _mockErrorRate;
  }
};

// Initialiser à partir du localStorage
if (typeof window !== 'undefined') {
  mockMode.loadFromStorage();
}

export default mockMode;
