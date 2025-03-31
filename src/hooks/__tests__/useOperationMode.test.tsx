
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOperationMode } from '../useOperationMode';
import { operationModeService } from '@/services/operationMode/operationModeService';

describe('useOperationMode', () => {
  it('devrait retourner le mode démo par défaut', () => {
    const { result } = renderHook(() => useOperationMode());
    
    expect(result.current.isDemoMode).toBe(true);
    expect(result.current.mode).toBe('demo');
    expect(result.current.isRealMode).toBe(false);
    expect(result.current.state).toBeDefined();
  });

  it('ne devrait pas pouvoir passer en mode réel', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useOperationMode());
    
    act(() => {
      result.current.enableRealMode();
    });
    
    expect(result.current.isDemoMode).toBe(true);
    expect(result.current.mode).toBe('demo');
    expect(result.current.isRealMode).toBe(false);
    expect(console.warn).toHaveBeenCalled();
    
    spy.mockRestore();
  });
  
  it('devrait mettre à jour la raison du mode démo', () => {
    const { result } = renderHook(() => useOperationMode());
    const raison = 'Nouvelle raison de test';
    
    act(() => {
      result.current.enableDemoMode(raison);
    });
    
    expect(result.current.mode).toBe('demo');
    expect(result.current.state.reason).toBe(raison);
  });
  
  it('devrait réinitialiser l\'état avec la raison par défaut', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // D'abord, définir une raison personnalisée
    act(() => {
      result.current.enableDemoMode('Raison temporaire');
    });
    
    // Puis réinitialiser
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.mode).toBe('demo');
    expect(result.current.isRealMode).toBe(false);
    expect(result.current.state.reason).toBe('Mode de démonstration permanent');
  });
});
