
import { renderHook, act } from '@testing-library/react-hooks';
import { useErrorReporter } from '@/hooks/useErrorReporter';
import { operationMode } from '@/services/operationMode';
import { toast } from 'sonner';
import { createNetworkError, createAuthError } from './mockErrorUtils';

// Mock pour les toasts
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn()
  }
}));

// Espionner les méthodes d'operationMode
jest.spyOn(operationMode, 'handleConnectionError');
jest.spyOn(operationMode, 'handleSuccessfulOperation');

describe('useErrorReporter - Tests de non-régression', () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait signaler une erreur au système operationMode', () => {
    const { result } = renderHook(() => useErrorReporter());
    
    // Simuler une erreur
    const error = createNetworkError();
    const context = 'Test context';
    
    act(() => {
      result.current.reportError(error, context);
    });
    
    // Vérifier que l'erreur a été transmise à operationMode
    expect(operationMode.handleConnectionError).toHaveBeenCalledWith(error, context);
    
    // Vérifier que le toast a été affiché
    expect(toast.error).toHaveBeenCalled();
  });

  test('devrait signaler une opération réussie', () => {
    const { result } = renderHook(() => useErrorReporter());
    const message = 'Opération réussie';
    
    act(() => {
      result.current.reportSuccess(message);
    });
    
    // Vérifier que l'opération réussie a été signalée
    expect(operationMode.handleSuccessfulOperation).toHaveBeenCalled();
    
    // Vérifier que le toast de succès a été affiché
    expect(toast.success).toHaveBeenCalledWith(message);
  });

  test('devrait formater les erreurs qui ne sont pas des instances d\'Error', () => {
    const { result } = renderHook(() => useErrorReporter());
    const errorString = 'Erreur sous forme de chaîne';
    
    act(() => {
      result.current.reportError(errorString);
    });
    
    // Vérifier que l'erreur a été formatée et transmise
    expect(operationMode.handleConnectionError).toHaveBeenCalledWith(
      expect.objectContaining({ message: errorString }),
      expect.any(String)
    );
  });

  test('ne devrait pas afficher de toast si showToast est false', () => {
    const { result } = renderHook(() => useErrorReporter());
    
    act(() => {
      result.current.reportError(new Error('Test error'), 'Test context', { showToast: false });
    });
    
    // Vérifier que le toast n'a pas été affiché
    expect(toast.error).not.toHaveBeenCalled();
    
    // Mais l'erreur a quand même été signalée
    expect(operationMode.handleConnectionError).toHaveBeenCalled();
  });
});
