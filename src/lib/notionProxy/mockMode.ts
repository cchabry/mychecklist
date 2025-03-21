
// État interne du mode mock
let _mockModeActive = false;
let _temporarilyForceReal = false;
let _originalMockState = false;
let _isMockModePermanent = false;

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
   * Restaure l'état original après un forçage temporaire
   */
  restoreState(): void {
    _temporarilyForceReal = false;
    console.log(`🔄 État mock restauré (${_originalMockState ? 'activé' : 'désactivé'})`);
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
  }
};

// Initialiser à partir du localStorage
if (typeof window !== 'undefined') {
  mockMode.loadFromStorage();
}

export default mockMode;
