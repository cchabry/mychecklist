
import { operationMode } from '../operationModeService';
import { OperationMode } from '../types';
import { operationModeStorage } from '../storage';
import { operationModeNotifications } from '../notifications';

// Mock des dépendances
jest.mock('../storage', () => ({
  operationModeStorage: {
    saveMode: jest.fn(),
    loadMode: jest.fn().mockReturnValue({ mode: 'REAL', reason: null }),
    saveSettings: jest.fn(),
    loadSettings: jest.fn().mockReturnValue({
      autoSwitchOnFailure: true,
      maxConsecutiveFailures: 3,
      persistentModeStorage: false,
      showNotifications: true
    })
  }
}));

jest.mock('../notifications', () => ({
  operationModeNotifications: {
    showModeChangeNotification: jest.fn(),
    showAutoSwitchNotification: jest.fn(),
    showConnectionErrorNotification: jest.fn()
  }
}));

describe('OperationMode Service', () => {
  // Réinitialiser avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
    operationMode.reset();
    operationMode.enableRealMode(); // Commencer en mode réel
  });

  // Tests de base pour les fonctionnalités principales
  describe('Mode switching functionality', () => {
    it('should start in REAL mode by default', () => {
      expect(operationMode.getMode()).toBe(OperationMode.REAL);
      expect(operationMode.isDemoMode).toBe(false);
      expect(operationMode.isRealMode).toBe(true);
    });

    it('should toggle between modes', () => {
      // Démarrage en mode réel
      expect(operationMode.isDemoMode).toBe(false);
      
      // Basculer vers le mode démo
      operationMode.toggle();
      expect(operationMode.isDemoMode).toBe(true);
      expect(operationMode.isRealMode).toBe(false);
      
      // Basculer vers le mode réel
      operationMode.toggle();
      expect(operationMode.isDemoMode).toBe(false);
      expect(operationMode.isRealMode).toBe(true);
    });

    it('should enable demo mode with a reason', () => {
      const reason = 'Test reason';
      operationMode.enableDemoMode(reason);
      
      expect(operationMode.isDemoMode).toBe(true);
      expect(operationMode.getSwitchReason()).toBe(reason);
      
      // Vérifier que la notification a été appelée
      expect(operationModeNotifications.showModeChangeNotification).toHaveBeenCalledWith(
        OperationMode.DEMO, 
        reason
      );
    });

    it('should enable real mode and reset error state', () => {
      // Simuler un état d'erreur
      operationMode.handleConnectionError(new Error('Test error'));
      expect(operationMode.getConsecutiveFailures()).toBeGreaterThan(0);
      
      // Activer le mode réel
      operationMode.enableRealMode();
      
      expect(operationMode.isRealMode).toBe(true);
      expect(operationMode.getConsecutiveFailures()).toBe(0);
      expect(operationMode.getLastError()).toBeNull();
      
      // Vérifier que la notification a été appelée
      expect(operationModeNotifications.showModeChangeNotification).toHaveBeenCalledWith(
        OperationMode.REAL
      );
    });
  });

  describe('Error handling functionality', () => {
    it('should track consecutive failures', () => {
      expect(operationMode.getConsecutiveFailures()).toBe(0);
      
      operationMode.handleConnectionError(new Error('Test error 1'));
      expect(operationMode.getConsecutiveFailures()).toBe(1);
      
      operationMode.handleConnectionError(new Error('Test error 2'));
      expect(operationMode.getConsecutiveFailures()).toBe(2);
      
      expect(operationMode.getLastError()).not.toBeNull();
      expect(operationMode.getLastError()?.message).toBe('Test error 2');
    });

    it('should auto-switch to demo mode after max failures', () => {
      // Configure pour basculer après 3 échecs
      operationMode.updateSettings({ 
        autoSwitchOnFailure: true,
        maxConsecutiveFailures: 3 
      });
      
      // Simuler 3 erreurs
      operationMode.handleConnectionError(new Error('Error 1'));
      operationMode.handleConnectionError(new Error('Error 2'));
      expect(operationMode.isRealMode).toBe(true); // Toujours en mode réel
      
      // 3ème erreur devrait déclencher le basculement
      operationMode.handleConnectionError(new Error('Error 3'));
      
      expect(operationMode.isDemoMode).toBe(true);
      expect(operationMode.getSwitchReason()).toContain('automatique');
      expect(operationModeNotifications.showAutoSwitchNotification).toHaveBeenCalled();
    });

    it('should reset failure count on successful operation', () => {
      // Simuler quelques erreurs
      operationMode.handleConnectionError(new Error('Error 1'));
      operationMode.handleConnectionError(new Error('Error 2'));
      expect(operationMode.getConsecutiveFailures()).toBe(2);
      
      // Signaler une opération réussie
      operationMode.handleSuccessfulOperation();
      
      expect(operationMode.getConsecutiveFailures()).toBe(0);
      expect(operationMode.getLastError()).toBeNull();
    });

    it('should not count temporary errors towards auto-switch threshold', () => {
      // Simuler une erreur temporaire (réseau)
      operationMode.handleConnectionError(new Error('Failed to fetch'));
      expect(operationMode.getConsecutiveFailures()).toBe(0); // Ne devrait pas incrémenter
      
      // Simuler une erreur temporaire (timeout)
      operationMode.handleConnectionError(new Error('Network timeout'));
      expect(operationMode.getConsecutiveFailures()).toBe(0);
      
      // Simuler une erreur non temporaire
      operationMode.handleConnectionError(new Error('Authentication failed'));
      expect(operationMode.getConsecutiveFailures()).toBe(1); // Devrait incrémenter
    });
  });

  describe('Critical operations functionality', () => {
    it('should mark and unmark operations as critical', () => {
      const opName = 'criticalOperation';
      
      // Marquer comme critique
      operationMode.markOperationAsCritical(opName);
      expect(operationMode.isOperationCritical(opName)).toBe(true);
      
      // Démarquer
      operationMode.unmarkOperationAsCritical(opName);
      expect(operationMode.isOperationCritical(opName)).toBe(false);
    });

    it('should always count errors in critical operations', () => {
      const opName = 'criticalOperation';
      operationMode.markOperationAsCritical(opName);
      
      // Même une erreur temporaire devrait être comptée pour une opération critique
      operationMode.handleConnectionError(new Error('Failed to fetch'), opName);
      expect(operationMode.getConsecutiveFailures()).toBe(1);
      
      // Nettoyer
      operationMode.unmarkOperationAsCritical(opName);
    });
  });

  describe('Temporary mode forcing functionality', () => {
    it('should temporarily force real mode', () => {
      // Commencer en mode démo
      operationMode.enableDemoMode();
      expect(operationMode.isDemoMode).toBe(true);
      
      // Forcer temporairement le mode réel
      operationMode.temporarilyForceReal();
      expect(operationMode.isRealMode).toBe(true);
      
      // Restaurer le mode précédent
      operationMode.restorePreviousMode();
      expect(operationMode.isDemoMode).toBe(true);
    });
  });

  describe('Settings management', () => {
    it('should update settings', () => {
      const newSettings = { 
        autoSwitchOnFailure: false,
        maxConsecutiveFailures: 5,
        persistentModeStorage: true,
        showNotifications: false
      };
      
      operationMode.updateSettings(newSettings);
      
      expect(operationMode.getSettings()).toEqual(newSettings);
      expect(operationModeStorage.saveSettings).toHaveBeenCalledWith(newSettings);
    });

    it('should reset to default settings', () => {
      // Modifier les paramètres
      operationMode.updateSettings({ 
        autoSwitchOnFailure: false,
        maxConsecutiveFailures: 10
      });
      
      // Réinitialiser
      operationMode.reset();
      
      // Vérifier que les paramètres sont revenus aux valeurs par défaut
      const defaultSettings = operationMode.getSettings();
      expect(defaultSettings.autoSwitchOnFailure).toBe(true);
      expect(defaultSettings.maxConsecutiveFailures).toBe(3);
    });
  });

  describe('Subscription system', () => {
    it('should notify subscribers on mode change', () => {
      const subscriber = jest.fn();
      const unsubscribe = operationMode.subscribe(subscriber);
      
      // Changer de mode
      operationMode.enableDemoMode('Test reason');
      
      // Vérifier que le subscriber a été appelé
      expect(subscriber).toHaveBeenCalledWith(OperationMode.DEMO, 'Test reason');
      
      // Se désabonner
      unsubscribe();
      
      // Changer de mode à nouveau
      operationMode.enableRealMode();
      
      // Le subscriber ne devrait pas être appelé cette fois-ci
      expect(subscriber).toHaveBeenCalledTimes(1);
    });

    it('should support simplified boolean subscriptions', () => {
      const booleanSubscriber = jest.fn();
      const unsubscribe = operationMode.onModeChange(booleanSubscriber);
      
      // Changer de mode en démo
      operationMode.enableDemoMode();
      
      // Vérifier que le subscriber a été appelé avec true (mode démo)
      expect(booleanSubscriber).toHaveBeenCalledWith(true);
      
      // Changer en mode réel
      operationMode.enableRealMode();
      
      // Vérifier qu'il a été appelé avec false (pas mode démo)
      expect(booleanSubscriber).toHaveBeenCalledWith(false);
      
      // Se désabonner
      unsubscribe();
    });
  });

  describe('Storage and persistence', () => {
    it('should persist mode when enabled', () => {
      // Activer la persistance
      operationMode.updateSettings({ persistentModeStorage: true });
      
      // Changer de mode
      operationMode.enableDemoMode('Test persistence');
      
      // Vérifier que le mode a été sauvegardé
      expect(operationModeStorage.saveMode).toHaveBeenCalledWith(
        OperationMode.DEMO, 
        'Test persistence'
      );
    });

    it('should not persist mode when disabled', () => {
      // Désactiver la persistance
      operationMode.updateSettings({ persistentModeStorage: false });
      
      // Changer de mode
      operationMode.enableDemoMode('No persistence');
      
      // Vérifier que le mode n'a PAS été sauvegardé
      expect(operationModeStorage.saveMode).not.toHaveBeenCalled();
    });

    it('should load persisted mode on initialization', () => {
      // Réinitialiser le service pour tester l'initialisation
      jest.clearAllMocks();
      
      // Simuler un mode persisté
      (operationModeStorage.loadMode as jest.Mock).mockReturnValueOnce({ 
        mode: OperationMode.DEMO, 
        reason: 'Persisted reason' 
      });
      
      // Réinitialiser pour simuler l'initialisation
      operationMode.reset();
      operationMode.updateSettings({ persistentModeStorage: true });
      
      // Vérifier que le mode a été chargé
      expect(operationModeStorage.loadMode).toHaveBeenCalled();
    });
  });
});
