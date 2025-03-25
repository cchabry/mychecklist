
import { operationMode } from '@/services/operationMode';
import { OperationMode } from '@/services/operationMode/types';

/**
 * Tests de non-régression pour le système operationMode
 * 
 * Ces tests vérifient le comportement du système avant sa refactorisation
 * afin de garantir que les fonctionnalités essentielles sont préservées.
 */

// Sauvegarde de l'état initial pour restauration après les tests
const initialMode = operationMode.mode;
const initialFailures = operationMode.failures;
const initialReason = operationMode.switchReason;

// Réinitialise l'état entre les tests
function resetOperationMode() {
  // Réinitialiser l'état directement plutôt que d'utiliser reset()
  // pour ne pas affecter le localStorage
  if (initialMode === OperationMode.DEMO) {
    operationMode.enableDemoMode('Test reset');
  } else {
    operationMode.enableRealMode();
  }
  
  // Réinitialiser manuellement les compteurs d'erreur
  // @ts-ignore - Accès aux propriétés privées pour les tests
  operationMode.failures = initialFailures;
  // @ts-ignore - Accès aux propriétés privées pour les tests
  operationMode.switchReason = initialReason;
}

describe('OperationMode - Tests de non-régression', () => {
  // Réinitialiser avant chaque test
  beforeEach(() => {
    resetOperationMode();
  });
  
  // Restaurer l'état d'origine après tous les tests
  afterAll(() => {
    resetOperationMode();
  });

  // 1. Tests de basculement de mode
  describe('Basculement de mode', () => {
    test('devrait basculer du mode réel au mode démo', () => {
      // Forcer le mode réel
      operationMode.enableRealMode();
      expect(operationMode.mode).toBe(OperationMode.REAL);
      
      // Basculer en mode démo
      operationMode.enableDemoMode('Test de basculement');
      expect(operationMode.mode).toBe(OperationMode.DEMO);
      expect(operationMode.isDemoMode).toBe(true);
    });
    
    test('devrait basculer du mode démo au mode réel', () => {
      // Forcer le mode démo
      operationMode.enableDemoMode('Test de basculement');
      expect(operationMode.mode).toBe(OperationMode.DEMO);
      
      // Basculer en mode réel
      operationMode.enableRealMode();
      expect(operationMode.mode).toBe(OperationMode.REAL);
      expect(operationMode.isRealMode).toBe(true);
    });
    
    test('devrait basculer avec toggle()', () => {
      // Commencer en mode réel
      operationMode.enableRealMode();
      expect(operationMode.mode).toBe(OperationMode.REAL);
      
      // Basculer avec toggle
      operationMode.toggle();
      expect(operationMode.mode).toBe(OperationMode.DEMO);
      
      // Basculer à nouveau
      operationMode.toggle();
      expect(operationMode.mode).toBe(OperationMode.REAL);
    });
  });

  // 2. Tests de gestion des erreurs
  describe('Gestion des erreurs', () => {
    test('devrait compter les échecs consécutifs', () => {
      // Réinitialiser le compteur
      // @ts-ignore - Accès aux propriétés privées pour les tests
      operationMode.failures = 0;
      
      // Simuler des erreurs
      operationMode.handleConnectionError(new Error('Test error 1'), 'Test context');
      operationMode.handleConnectionError(new Error('Test error 2'), 'Test context');
      
      expect(operationMode.failures).toBe(2);
    });
    
    test('devrait réinitialiser le compteur d\'échecs après une opération réussie', () => {
      // Simuler des erreurs
      operationMode.handleConnectionError(new Error('Test error'), 'Test context');
      expect(operationMode.failures).toBeGreaterThan(0);
      
      // Simuler une opération réussie
      operationMode.handleSuccessfulOperation();
      expect(operationMode.failures).toBe(0);
    });
    
    test('devrait conserver la raison du basculement', () => {
      const reason = 'Erreur de test spécifique';
      operationMode.enableRealMode(); // Commencer en mode réel
      
      // Forcer le basculement avec une raison
      operationMode.enableDemoMode(reason);
      
      expect(operationMode.switchReason).toBe(reason);
    });
  });

  // 3. Tests de basculement automatique
  describe('Basculement automatique', () => {
    test('ne devrait pas basculer automatiquement pour les opérations critiques', () => {
      // Forcer le mode réel
      operationMode.enableRealMode();
      
      // Marquer une opération comme critique
      operationMode.markOperationAsCritical('operation-test');
      
      // Simuler des erreurs (pas assez pour un basculement normal)
      operationMode.handleConnectionError(new Error('Test error 1'), 'operation-test');
      operationMode.handleConnectionError(new Error('Test error 2'), 'operation-test');
      
      // Vérifier que nous sommes toujours en mode réel
      expect(operationMode.mode).toBe(OperationMode.REAL);
      
      // Démarquer l'opération critique
      operationMode.unmarkOperationAsCritical('operation-test');
    });
    
    test('devrait conserver le dernier message d\'erreur', () => {
      const errorMessage = 'Erreur de test spécifique';
      
      // Simuler une erreur avec un message spécifique
      operationMode.handleConnectionError(new Error(errorMessage), 'Test context');
      
      expect(operationMode.lastError?.message).toBe(errorMessage);
    });
  });
});
