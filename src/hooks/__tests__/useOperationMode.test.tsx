
import { renderHook, act } from '@testing-library/react';
import { useOperationMode } from '../useOperationMode';

describe('useOperationMode', () => {
  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
  });

  it('devrait retourner l\'état par défaut (real mode)', () => {
    const { result } = renderHook(() => useOperationMode());
    
    expect(result.current.mode).toBe('real');
    expect(result.current.isDemoMode).toBe(false);
    expect(result.current.isRealMode).toBe(true);
    expect(result.current.state).toEqual({
      mode: 'real',
      timestamp: expect.any(Number),
      source: 'system'
    });
  });

  it('ne devrait plus avoir la possibilité de passer en mode démo', () => {
    const { result } = renderHook(() => useOperationMode());
    
    // Vérifier que nous sommes en mode réel par défaut
    expect(result.current.mode).toBe('real');
    
    // La fonction enableDemoMode existe mais ne fait rien
    act(() => {
      result.current.enableDemoMode();
    });
    
    // Le mode ne change pas
    expect(result.current.mode).toBe('real');
    expect(result.current.state).toEqual({
      mode: 'real',
      timestamp: expect.any(Number),
      source: 'system'
    });
    
    // La fonction reset existe mais ne fait rien
    act(() => {
      result.current.reset();
    });
    
    // Le mode reste inchangé
    expect(result.current.mode).toBe('real');
  });
});
