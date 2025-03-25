
import { operationMode } from '../operationModeService';
import { OperationMode } from '../types';

// Ne pas mocker les dépendances pour ce test d'intégration

describe('OperationMode Integration Tests', () => {
  beforeEach(() => {
    // Réinitialiser l'état avant chaque test
    operationMode.reset();
    operationMode.enableRealMode(); // Commencer en mode réel
  });
  
  /**
   * Scénario 1: Basculement automatique après des erreurs
   * Ce test simule le comportement d'auto-basculement après plusieurs erreurs
   */
  it('Scenario 1: should auto-switch to demo mode after consecutive errors', () => {
    // Configurer pour basculer après 3 erreurs
    operationMode.updateSettings({
      autoSwitchOnFailure: true,
      maxConsecutiveFailures: 3
    });
    
    // Simuler plusieurs appels d'API avec des erreurs
    for (let i = 0; i < 2; i++) {
      operationMode.handleConnectionError(
        new Error(`API error ${i+1}`),
        'Test API'
      );
      
      // Vérifier qu'on est toujours en mode réel
      expect(operationMode.getMode()).toBe(OperationMode.REAL);
    }
    
    // Simuler la dernière erreur qui doit déclencher le basculement
    operationMode.handleConnectionError(
      new Error('API error 3'),
      'Test API'
    );
    
    // Vérifier qu'on est passé en mode démo
    expect(operationMode.getMode()).toBe(OperationMode.DEMO);
    
    // Vérifier que la raison est correcte
    expect(operationMode.getSwitchReason()).toContain('automatique');
  });
  
  /**
   * Scénario 2: Gestion d'une opération critique
   * Ce test vérifie que les erreurs sur une opération critique sont toujours comptées
   */
  it('Scenario 2: should handle critical operations correctly', () => {
    const criticalOp = 'critical-api-call';
    
    // Marquer l'opération comme critique
    operationMode.markOperationAsCritical(criticalOp);
    
    // Même une erreur normalement ignorée doit être comptée
    operationMode.handleConnectionError(
      new Error('Failed to fetch'),
      criticalOp
    );
    
    // Vérifier que l'erreur temporaire est quand même comptée
    expect(operationMode.getConsecutiveFailures()).toBe(1);
    
    // Démarquer l'opération
    operationMode.unmarkOperationAsCritical(criticalOp);
    
    // Maintenant, une erreur temporaire ne devrait pas être comptée
    operationMode.handleConnectionError(
      new Error('Network timeout'),
      'regular-operation'
    );
    
    // Le compteur ne devrait pas avoir augmenté
    expect(operationMode.getConsecutiveFailures()).toBe(1);
  });
  
  /**
   * Scénario 3: Fonctionnement du système d'abonnement
   * Vérifie que les abonnés sont correctement notifiés des changements de mode
   */
  it('Scenario 3: should notify subscribers correctly', () => {
    const subscriber = jest.fn();
    const booleanSubscriber = jest.fn();
    
    // S'abonner aux changements
    const unsubscribe = operationMode.subscribe(subscriber);
    const unsubscribeBool = operationMode.onModeChange(booleanSubscriber);
    
    // Changer de mode
    operationMode.enableDemoMode('Test reason');
    
    // Vérifier que les abonnés ont été notifiés
    expect(subscriber).toHaveBeenCalledWith(OperationMode.DEMO, 'Test reason');
    expect(booleanSubscriber).toHaveBeenCalledWith(true);
    
    // Se désabonner
    unsubscribe();
    
    // Changer de mode à nouveau
    operationMode.enableRealMode();
    
    // Le premier abonné ne devrait pas être notifié
    expect(subscriber).toHaveBeenCalledTimes(1);
    
    // Mais le deuxième devrait l'être
    expect(booleanSubscriber).toHaveBeenCalledTimes(2);
    expect(booleanSubscriber).toHaveBeenCalledWith(false);
    
    // Se désabonner pour le second aussi
    unsubscribeBool();
  });
  
  /**
   * Scénario 4: Forçage temporaire du mode réel
   * Vérifie que le système peut temporairement forcer le mode réel puis revenir au mode précédent
   */
  it('Scenario 4: should support temporarily forcing real mode', () => {
    // Commencer en mode démo
    operationMode.enableDemoMode('Starting in demo');
    expect(operationMode.isDemoMode).toBe(true);
    
    // Forcer temporairement le mode réel
    operationMode.temporarilyForceReal();
    
    // Vérifier qu'on est en mode réel
    expect(operationMode.isRealMode).toBe(true);
    
    // Restaurer le mode précédent
    operationMode.restorePreviousMode();
    
    // Vérifier qu'on est revenu en mode démo
    expect(operationMode.isDemoMode).toBe(true);
  });
  
  /**
   * Scénario 5: Réinitialisation des erreurs après une opération réussie
   * Vérifie que le compteur d'erreurs est correctement réinitialisé
   */
  it('Scenario 5: should reset errors after successful operation', () => {
    // Simuler des erreurs
    operationMode.handleConnectionError(new Error('Error 1'));
    operationMode.handleConnectionError(new Error('Error 2'));
    
    // Vérifier que les erreurs sont comptées
    expect(operationMode.getConsecutiveFailures()).toBe(2);
    expect(operationMode.getLastError()).not.toBeNull();
    
    // Signaler une opération réussie
    operationMode.handleSuccessfulOperation();
    
    // Vérifier que les erreurs sont réinitialisées
    expect(operationMode.getConsecutiveFailures()).toBe(0);
    expect(operationMode.getLastError()).toBeNull();
  });
});
