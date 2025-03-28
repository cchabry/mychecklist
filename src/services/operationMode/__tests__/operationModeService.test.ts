
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { operationModeService } from '../operationModeService';
import { STORAGE_KEYS } from '@/constants/appConstants';

describe('OperationModeService', () => {
  // Sauvegarde de l'environnement original
  const originalEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    // Réinitialiser localStorage avant chaque test
    localStorage.clear();
    // Réinitialiser le service
    operationModeService.reset();
    // Réinitialiser les mocks
    vi.resetAllMocks();
  });
  
  afterEach(() => {
    // Restaurer l'environnement original
    process.env.NODE_ENV = originalEnv;
  });

  it('devrait être en mode réel par défaut en production', () => {
    // Simuler l'environnement de production
    process.env.NODE_ENV = 'production';
    
    // Réinitialiser le service pour qu'il prenne en compte le nouvel environnement
    operationModeService.reset();
    
    expect(operationModeService.getMode()).toBe('real');
    expect(operationModeService.isRealMode()).toBe(true);
    expect(operationModeService.isDemoMode()).toBe(false);
  });
  
  it('devrait être en mode démo par défaut en développement', () => {
    // Simuler l'environnement de développement
    process.env.NODE_ENV = 'development';
    
    // Réinitialiser le service pour qu'il prenne en compte le nouvel environnement
    operationModeService.reset();
    
    expect(operationModeService.getMode()).toBe('demo');
    expect(operationModeService.isDemoMode()).toBe(true);
    expect(operationModeService.isRealMode()).toBe(false);
  });

  it('devrait passer en mode démo avec une raison', () => {
    operationModeService.enableDemoMode('Test raison');
    
    expect(operationModeService.getMode()).toBe('demo');
    expect(operationModeService.isDemoMode()).toBe(true);
    expect(operationModeService.isRealMode()).toBe(false);
    expect(operationModeService.getState().reason).toBe('Test raison');
    expect(operationModeService.getState().source).toBe('user');
  });

  it('devrait revenir en mode réel', () => {
    // D'abord passer en mode démo
    operationModeService.enableDemoMode();
    expect(operationModeService.isDemoMode()).toBe(true);
    
    // Puis revenir en mode réel
    operationModeService.enableRealMode('Retour en mode réel');
    
    expect(operationModeService.getMode()).toBe('real');
    expect(operationModeService.isRealMode()).toBe(true);
    expect(operationModeService.isDemoMode()).toBe(false);
    expect(operationModeService.getState().reason).toBe('Retour en mode réel');
    expect(operationModeService.getState().source).toBe('user');
  });

  it('devrait notifier les abonnés lors du changement de mode', () => {
    const listener = vi.fn();
    
    // S'abonner aux changements
    const unsubscribe = operationModeService.subscribe(listener);
    
    // Le listener devrait avoir été appelé une fois lors de l'abonnement
    expect(listener).toHaveBeenCalledTimes(1);
    
    // Changer de mode
    operationModeService.enableDemoMode();
    
    // Vérifier que le listener a été appelé à nouveau
    expect(listener).toHaveBeenCalledTimes(2);
    const latestCall = listener.mock.calls[1][0];
    expect(latestCall.mode).toBe('demo');
    
    // Se désabonner
    unsubscribe();
    
    // Changer à nouveau de mode
    operationModeService.enableRealMode();
    
    // Vérifier que le listener n'a pas été appelé à nouveau
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('devrait persister le mode dans localStorage', () => {
    // Activer le mode démo
    operationModeService.enableDemoMode('Test persistance');
    
    // Vérifier que le mode a été sauvegardé dans localStorage
    const savedState = JSON.parse(localStorage.getItem(STORAGE_KEYS.OPERATION_MODE) || '{}');
    expect(savedState.mode).toBe('demo');
    expect(savedState.reason).toBe('Test persistance');
  });
  
  it('devrait gérer correctement les erreurs de localStorage', () => {
    // Simuler une erreur lors de l'accès au localStorage
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = vi.fn().mockImplementation(() => {
      throw new Error('localStorage non disponible');
    });
    
    // S'assurer que le service ne plante pas
    expect(() => operationModeService.getMode()).not.toThrow();
    
    // Restaurer le comportement original
    Storage.prototype.getItem = originalGetItem;
  });
  
  it('devrait gérer correctement les erreurs lors de la sauvegarde', () => {
    // Simuler une erreur lors de la sauvegarde dans localStorage
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn().mockImplementation(() => {
      throw new Error('localStorage non disponible');
    });
    
    // S'assurer que le service ne plante pas lors de la sauvegarde
    expect(() => operationModeService.enableDemoMode()).not.toThrow();
    
    // Restaurer le comportement original
    Storage.prototype.setItem = originalSetItem;
  });
});
