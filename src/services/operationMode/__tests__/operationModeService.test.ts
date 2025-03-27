
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { operationModeService } from '../operationModeService';
import { OPERATION_MODE_RESET } from '@/constants/errorMessages';

describe('OperationModeService', () => {
  beforeEach(() => {
    // Réinitialiser le localStorage avant chaque test
    localStorage.clear();
    // Réinitialiser le service
    operationModeService.reset();
  });

  it('devrait être en mode réel par défaut', () => {
    expect(operationModeService.getMode()).toBe('real');
    expect(operationModeService.isRealMode()).toBe(true);
    expect(operationModeService.isDemoMode()).toBe(false);
  });

  it('devrait passer en mode démo', () => {
    operationModeService.enableDemoMode('Test raison');
    
    expect(operationModeService.getMode()).toBe('demo');
    expect(operationModeService.isDemoMode()).toBe(true);
    expect(operationModeService.isRealMode()).toBe(false);
    expect(operationModeService.getState().reason).toBe('Test raison');
  });

  it('devrait revenir en mode réel', () => {
    // D'abord passer en mode démo
    operationModeService.enableDemoMode();
    expect(operationModeService.isDemoMode()).toBe(true);
    
    // Puis revenir en mode réel
    operationModeService.enableRealMode();
    
    expect(operationModeService.getMode()).toBe('real');
    expect(operationModeService.isRealMode()).toBe(true);
    expect(operationModeService.isDemoMode()).toBe(false);
  });

  it('devrait notifier les abonnés lors du changement de mode', () => {
    const listener = vi.fn();
    
    // S'abonner aux changements
    const unsubscribe = operationModeService.subscribe(listener);
    
    // Changer de mode
    operationModeService.enableDemoMode();
    
    // Vérifier que le listener a été appelé
    expect(listener).toHaveBeenCalledTimes(1);
    
    // Se désabonner
    unsubscribe();
    
    // Changer à nouveau de mode
    operationModeService.enableRealMode();
    
    // Vérifier que le listener n'a pas été appelé à nouveau
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('devrait persister le mode dans localStorage', () => {
    // Activer le mode démo
    operationModeService.enableDemoMode('Test persistance');
    
    // Vérifier que le mode a été sauvegardé
    expect(operationModeService.getMode()).toBe('demo');
    expect(operationModeService.getState().reason).toBe('Test persistance');
    
    // Créer une nouvelle instance du service pour simuler un rechargement de page
    const newService = operationModeService;
    
    // Vérifier que le mode a été restauré
    expect(newService.getMode()).toBe('demo');
    expect(newService.getState().reason).toBe('Test persistance');
  });
});
