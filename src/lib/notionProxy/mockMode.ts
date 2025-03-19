
import { STORAGE_KEYS } from './config';
import { toast } from 'sonner';

/**
 * Utility functions for managing the mock mode
 * Used when the API isn't accessible due to CORS or other issues
 */
export const mockMode = {
  isActive: (): boolean => {
    const isMockMode = localStorage.getItem(STORAGE_KEYS.MOCK_MODE) === 'true';
    console.log(`🔍 Mock mode check: ${isMockMode ? 'ACTIVE' : 'INACTIVE'}`);
    return isMockMode;
  },
  
  activate: (): void => {
    console.log('🔶 ACTIVATING MOCK MODE - Will use demo data instead of real Notion API');
    localStorage.setItem(STORAGE_KEYS.MOCK_MODE, 'true');
    toast.warning('Mode démonstration activé', {
      description: 'Les données fictives sont utilisées car l\'API Notion n\'est pas accessible.',
      duration: 4000,
    });
  },
  
  deactivate: (): void => {
    console.log('🟢 DEACTIVATING MOCK MODE - Will use real Notion API');
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    toast.success('Mode réel activé', {
      description: 'L\'application utilise maintenant les données réelles de Notion.',
      duration: 3000,
    });
  },
  
  toggle: (): boolean => {
    const currentState = mockMode.isActive();
    console.log(`🔄 Toggling mock mode from ${currentState ? 'ACTIVE' : 'INACTIVE'}`);
    
    if (currentState) {
      mockMode.deactivate();
      return false;
    } else {
      mockMode.activate();
      return true;
    }
  },
  
  reset: (): void => {
    // Désactiver le mode mock et effacer toute erreur précédente
    console.log('🧹 Resetting mock mode state and errors');
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.removeItem('notion_last_error');
    toast.info('État du proxy réinitialisé', {
      description: 'Les paramètres de connexion à Notion ont été réinitialisés.',
    });
  },
  
  /**
   * Vérifier l'état du mode mock et afficher un indicateur visuel
   */
  checkAndNotify: (): void => {
    if (mockMode.isActive()) {
      console.log('🔔 Mock mode is active - showing notification');
      toast('Mode démonstration actif', {
        description: 'L\'application utilise des données fictives.',
        action: {
          label: 'Désactiver',
          onClick: () => mockMode.deactivate()
        },
        duration: 5000,
      });
    }
  },
  
  /**
   * Force l'état du mode mock en fonction d'une condition
   */
  setBasedOnCondition: (condition: boolean): void => {
    if (condition) {
      // Condition true = activer le mock mode
      if (!mockMode.isActive()) {
        mockMode.activate();
      }
    } else {
      // Condition false = désactiver le mock mode
      if (mockMode.isActive()) {
        mockMode.deactivate();
      }
    }
  },

  /**
   * Forcefully reset the mock mode and all related state
   * This is a more aggressive reset that will clear all mock-related storage
   */
  forceReset: (): void => {
    console.log('🧹 FORCE RESETTING all mock mode state');
    
    // Clear all mock mode and Notion status flags
    localStorage.removeItem(STORAGE_KEYS.MOCK_MODE);
    localStorage.removeItem('notion_last_error');
    localStorage.removeItem('notion_proxy_last_error');
    localStorage.removeItem('notion_proxy_status');
    
    // Clear all caches that might be preventing real data from loading
    localStorage.removeItem('projects_cache');
    localStorage.removeItem('audit_cache');
    localStorage.removeItem('notion_temp_data');
    
    // Remove any other cached data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('cache') || key.includes('temp') || key.includes('notion_data_')) {
        localStorage.removeItem(key);
      }
    });
    
    // Refresh Notion connection status
    localStorage.setItem('notion_connection_refreshed', Date.now().toString());
    
    toast.success('Mode réel forcé', {
      description: 'Tous les caches ont été réinitialisés. L\'application utilisera les données réelles.',
      duration: 3000,
    });
    
    // Rafraîchir la page après un court délai pour s'assurer que tous les composants se mettent à jour
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }
};
