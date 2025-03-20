
import { STORAGE_KEYS } from './config';

/**
 * Gestion du mode mock pour les requêtes Notion.
 * Le mode mock permet de simuler des réponses de l'API Notion pour le développement et les démonstrations.
 * Version Brief v2 avec plus de configurations et options de simulation
 */
export const mockMode = {
  /**
   * Vérifie si le mode mock est actif
   */
  isActive: (): boolean => {
    // Vérifier les paramètres d'URL en premier
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('mock')) {
      const mockParam = urlParams.get('mock');
      const shouldActivate = mockParam === 'true' || mockParam === '1';
      
      // Si explicitement demandé dans l'URL, mettre à jour le localStorage
      if (shouldActivate) {
        localStorage.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
        return true;
      } else if (mockParam === 'false' || mockParam === '0') {
        localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
        return false;
      }
    }
    
    // Ensuite, vérifier si le mode force_real est actif
    if (localStorage.getItem('notion_force_real') === 'true') {
      return false;
    }
    
    // Fallback sur le localStorage
    return localStorage.getItem(STORAGE_KEYS.MOCK_MODE) === 'true';
  },
  
  /**
   * Active le mode mock
   */
  activate: (): void => {
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
    // Nettoyer le drapeau force_real si présent
    localStorage.removeItem('notion_force_real');
  },
  
  /**
   * Désactive le mode mock
   */
  deactivate: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
  },
  
  /**
   * Bascule l'état du mode mock
   */
  toggle: (): boolean => {
    const isCurrentlyActive = mockMode.isActive();
    if (isCurrentlyActive) {
      mockMode.deactivate();
    } else {
      mockMode.activate();
    }
    return !isCurrentlyActive;
  },
  
  /**
   * Force le mode réel en supprimant tous les drapeaux liés au mode mock
   */
  forceReset: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.setItem('notion_force_real', 'true');
    // Nettoyer aussi les erreurs précédentes
    localStorage.removeItem('notion_last_error');
  },
  
  /**
   * Réinitialise complètement la configuration du mode mock
   */
  reset: (): void => {
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.removeItem('notion_force_real');
    localStorage.removeItem('notion_mock_scenario');
    localStorage.removeItem('notion_mock_loading_delay');
    localStorage.removeItem('notion_mock_loading_until');
    localStorage.removeItem('notion_mock_error_rate');
  },
  
  /**
   * Force temporairement le mode réel pour une seule opération
   */
  temporarilyForceReal: (): (() => void) => {
    const wasActive = mockMode.isActive();
    if (wasActive) {
      localStorage.setItem('temp_was_mock', 'true');
      mockMode.deactivate();
    }
    
    // Retourner une fonction pour restaurer l'état précédent
    return () => {
      if (localStorage.getItem('temp_was_mock') === 'true') {
        mockMode.activate();
        localStorage.removeItem('temp_was_mock');
      }
    };
  },
  
  /**
   * Vérifie si le mode réel est temporairement forcé
   */
  isTemporarilyForcedReal: (): boolean => {
    return localStorage.getItem('temp_was_mock') === 'true';
  },
  
  /**
   * Restaure l'état précédent après avoir forcé temporairement le mode réel
   */
  restoreAfterForceReal: (): void => {
    if (localStorage.getItem('temp_was_mock') === 'true') {
      mockMode.activate();
      localStorage.removeItem('temp_was_mock');
    }
  },
  
  /**
   * NOUVELLES FONCTIONNALITÉS (BRIEF V2)
   */
  
  /**
   * Récupère le scénario actuel pour les tests
   */
  getScenario: (): string => {
    return localStorage.getItem('notion_mock_scenario') || 'standard';
  },
  
  /**
   * Définit un scénario spécifique pour les tests
   */
  setScenario: (scenario: string): void => {
    localStorage.setItem('notion_mock_scenario', scenario);
  },
  
  /**
   * Vérifie si un délai de chargement doit être simulé
   */
  shouldSimulateLoadingDelay: (): boolean => {
    const shouldDelay = localStorage.getItem('notion_mock_loading_delay') === 'true';
    if (!shouldDelay) return false;
    
    // Vérifier si le délai est toujours valide
    const delayUntil = localStorage.getItem('notion_mock_loading_until');
    if (delayUntil && parseInt(delayUntil) > Date.now()) {
      return true;
    }
    
    // Le délai a expiré, nettoyer
    localStorage.removeItem('notion_mock_loading_delay');
    localStorage.removeItem('notion_mock_loading_until');
    return false;
  },
  
  /**
   * Simule un délai de chargement pour N secondes
   */
  simulateLoadingDelay: (seconds = 30): void => {
    localStorage.setItem('notion_mock_loading_delay', 'true');
    localStorage.setItem('notion_mock_loading_until', (Date.now() + (seconds * 1000)).toString());
  },
  
  /**
   * Configure un taux d'erreur pour simuler des échecs API
   */
  setErrorRate: (rate: number): void => {
    if (rate < 0 || rate > 100) {
      console.error('Le taux d\'erreur doit être entre 0 et 100');
      return;
    }
    localStorage.setItem('notion_mock_error_rate', rate.toString());
  },
  
  /**
   * Récupère le taux d'erreur configuré
   */
  getErrorRate: (): number => {
    const rate = localStorage.getItem('notion_mock_error_rate');
    return rate ? parseInt(rate) : 0;
  },
  
  /**
   * Détermine si une erreur doit être simulée selon le taux configuré
   */
  shouldSimulateError: (): boolean => {
    const errorRate = mockMode.getErrorRate();
    if (errorRate <= 0) return false;
    
    // Générer un nombre aléatoire et comparer au taux d'erreur
    return Math.random() * 100 < errorRate;
  }
};
