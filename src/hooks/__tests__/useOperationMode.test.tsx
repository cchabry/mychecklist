
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOperationMode } from '../useOperationMode';
import { operationModeService } from '@/services/operationMode/operationModeService';

describe('useOperationMode hook', () => {
  beforeEach(() => {
    localStorage.clear();
    operationModeService.reset();
  });

  it('devrait retourner l\'état initial correctement', () => {
    const { result } = renderHook(() => useOperationMode());
    
    expect(result.current.mode).toBe('demo');
    expect(result.current.isRealMode).toBe(false);
    expect(result.current.isDemoMode).toBe(true);
  });

  it('devrait refléter les changements de mode', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Changer le mode via le service
    act(() => {
      // Réinitialiser explicitement avant de définir un nouveau mode
      operationModeService.reset();
      operationModeService.enableDemoMode('Test hook');
    });
    
    // Vérifier que le hook a mis à jour son état
    expect(result.current.mode).toBe('demo');
    expect(result.current.isDemoMode).toBe(true);
    expect(result.current.isRealMode).toBe(false);
    expect(result.current.state.reason).toBe('Test hook');
  });

  it('devrait permettre de changer le mode via le hook', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Changer le mode via le hook
    act(() => {
      result.current.enableDemoMode('Via hook');
    });
    
    // Vérifier que le mode a changé
    expect(result.current.mode).toBe('demo');
    expect(result.current.isDemoMode).toBe(true);
    
    // Revenir en mode réel
    act(() => {
      result.current.enableRealMode();
    });
    
    // Vérifier que le mode a changé
    expect(result.current.mode).toBe('real');
    expect(result.current.isRealMode).toBe(true);
  });
});
