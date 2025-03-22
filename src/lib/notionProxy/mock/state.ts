
/**
 * État et configuration du mode mock
 */

// Configuration du mode mock
export interface MockConfig {
  delay: number;
  scenario: string;
  errorRate: number;
}

// Configuration par défaut
const DEFAULT_CONFIG: MockConfig = {
  delay: 500,
  scenario: 'standard',
  errorRate: 0
};

// État interne
let _isActive = false;
let _isPermanent = false;
let _config: MockConfig = { ...DEFAULT_CONFIG };

// Essayer de charger depuis localStorage
try {
  if (typeof localStorage !== 'undefined') {
    // Vérifier si le mode mock est actif
    const storedMock = localStorage.getItem('notion_mock_mode');
    if (storedMock === 'true') {
      _isActive = true;
    }
    
    // Vérifier si le mode mock est permanent
    const storedPermanent = localStorage.getItem('notion_mock_mode_permanent');
    if (storedPermanent === 'true') {
      _isPermanent = true;
    }
    
    // Charger la configuration
    const storedConfig = localStorage.getItem('notion_mock_config');
    if (storedConfig) {
      try {
        const parsedConfig = JSON.parse(storedConfig);
        _config = { ...DEFAULT_CONFIG, ...parsedConfig };
      } catch (e) {
        console.warn('Erreur lors du parsing de la configuration mock:', e);
      }
    }
  }
} catch (e) {
  console.warn('Erreur lors de l\'initialisation du mode mock:', e);
}

// API de gestion de l'état
export const mockState = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive: (): boolean => _isActive,
  
  /**
   * Définit si le mode mock est actif
   */
  setActive: (active: boolean): void => {
    _isActive = active;
    
    // Persister dans localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('notion_mock_mode', active ? 'true' : 'false');
      }
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde du mode mock:', e);
    }
  },
  
  /**
   * Vérifie si le mode mock est permanent
   */
  isPermanent: (): boolean => _isPermanent,
  
  /**
   * Définit si le mode mock est permanent
   */
  setPermanent: (permanent: boolean): void => {
    _isPermanent = permanent;
    
    // Persister dans localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('notion_mock_mode_permanent', permanent ? 'true' : 'false');
      }
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde du mode mock permanent:', e);
    }
  },
  
  /**
   * Récupère la configuration
   */
  getConfig: (): MockConfig => ({ ..._config }),
  
  /**
   * Met à jour la configuration
   */
  updateConfig: (config: Partial<MockConfig>): void => {
    _config = { ..._config, ...config };
    
    // Persister dans localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('notion_mock_config', JSON.stringify(_config));
      }
    } catch (e) {
      console.warn('Erreur lors de la sauvegarde de la configuration mock:', e);
    }
  },
  
  /**
   * Réinitialise la configuration
   */
  resetConfig: (): void => {
    _config = { ...DEFAULT_CONFIG };
    
    // Persister dans localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('notion_mock_config', JSON.stringify(_config));
      }
    } catch (e) {
      console.warn('Erreur lors de la réinitialisation de la configuration mock:', e);
    }
  }
};
