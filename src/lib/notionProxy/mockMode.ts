
// Contrôle du mode mock pour les tests
let mockModeActive = false;
let temporarilyForcedReal = false;

export const mockMode = {
  // Vérifie si le mode mock est actif
  isActive: () => {
    // Vérifier d'abord dans localStorage
    if (typeof localStorage !== 'undefined') {
      const storedMode = localStorage.getItem('notion_mock_mode');
      if (storedMode === 'true') {
        mockModeActive = true;
      } else if (storedMode === 'false') {
        mockModeActive = false;
      }
    }
    return mockModeActive;
  },
  
  // Active le mode mock
  activate: () => {
    mockModeActive = true;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('notion_mock_mode', 'true');
    }
    console.log('Mode mock activé');
  },
  
  // Désactive le mode mock
  deactivate: () => {
    mockModeActive = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('notion_mock_mode', 'false');
    }
    console.log('Mode mock désactivé');
  },
  
  // Bascule entre mode mock et réel
  toggle: () => {
    mockModeActive = !mockModeActive;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('notion_mock_mode', mockModeActive.toString());
    }
    return mockModeActive;
  },
  
  // Réinitialise le mode mock (désactive)
  reset: () => {
    mockModeActive = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('notion_mock_mode', 'false');
    }
  },
  
  // Vérifie et notifie l'état du mode mock
  checkAndNotify: () => {
    const isActive = mockMode.isActive();
    if (isActive) {
      console.log('⚠️ Le mode mock est actuellement actif');
    } else {
      console.log('✅ Le mode réel est actif');
    }
    return isActive;
  },
  
  // Définit le mode selon une condition
  setBasedOnCondition: (condition: boolean) => {
    if (condition) {
      mockMode.activate();
    } else {
      mockMode.deactivate();
    }
  },
  
  // Force temporairement le mode réel
  temporarilyForceReal: () => {
    if (mockModeActive) {
      temporarilyForcedReal = true;
      mockModeActive = false;
      console.log('Mode réel temporairement forcé');
    }
  },
  
  // Restaure après avoir forcé le mode réel
  restoreAfterForceReal: () => {
    if (temporarilyForcedReal) {
      mockModeActive = true;
      temporarilyForcedReal = false;
      console.log('Mode mock restauré après forçage temporaire');
    }
  },
  
  // Réinitialisation forcée (complète)
  forceReset: () => {
    mockModeActive = false;
    temporarilyForcedReal = false;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('notion_mock_mode');
    }
    console.log('Mode mock réinitialisé de force');
  }
};
