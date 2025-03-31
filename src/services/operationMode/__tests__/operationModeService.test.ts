
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { operationModeService } from '../operationModeService';

describe('OperationModeService', () => {
  beforeEach(() => {
    // Réinitialiser le service
    operationModeService.reset();
  });

  it('devrait toujours être en mode démo', () => {
    expect(operationModeService.getMode()).toBe('demo');
    expect(operationModeService.isDemoMode()).toBe(true);
    expect(operationModeService.isRealMode()).toBe(false);
  });

  it('ne devrait pas changer en mode réel même si demandé', () => {
    operationModeService.enableRealMode('Test raison');
    
    expect(operationModeService.getMode()).toBe('demo');
    expect(operationModeService.isDemoMode()).toBe(true);
    expect(operationModeService.isRealMode()).toBe(false);
  });

  it('devrait mettre à jour la raison en mode démo', () => {
    const raison = 'Nouvelle raison de test';
    operationModeService.enableDemoMode(raison);
    
    expect(operationModeService.getState().reason).toBe(raison);
  });

  it('devrait notifier les abonnés lors du changement de raison', () => {
    const listener = vi.fn();
    
    // S'abonner aux changements
    const unsubscribe = operationModeService.subscribe(listener);
    
    // Changer la raison
    operationModeService.enableDemoMode('Nouvelle raison');
    
    // Vérifier que le listener a été appelé
    expect(listener).toHaveBeenCalledTimes(1);
    
    // Se désabonner
    unsubscribe();
    
    // Changer à nouveau la raison
    operationModeService.enableDemoMode('Encore une raison');
    
    // Vérifier que le listener n'a pas été appelé à nouveau
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
