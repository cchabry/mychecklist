
import { renderHook, act } from '@testing-library/react-hooks';
import { useCriticalOperation } from '@/hooks/useCriticalOperation';
import { operationMode } from '@/services/operationMode';

// Espionner les méthodes d'operationMode
jest.spyOn(operationMode, 'markOperationAsCritical');
jest.spyOn(operationMode, 'unmarkOperationAsCritical');
jest.spyOn(operationMode, 'isOperationCritical');

describe('useCriticalOperation - Tests de non-régression', () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait marquer et démarquer une opération comme critique', async () => {
    const operationName = 'test-operation';
    const { result } = renderHook(() => useCriticalOperation(operationName));
    
    const mockFunction = jest.fn().mockResolvedValue('success');
    
    await act(async () => {
      await result.current.executeCritical(mockFunction);
    });
    
    // Vérifier que l'opération a été marquée comme critique
    expect(operationMode.markOperationAsCritical).toHaveBeenCalledWith(operationName);
    
    // Vérifier que l'opération a été démarquée après l'exécution
    expect(operationMode.unmarkOperationAsCritical).toHaveBeenCalledWith(operationName);
    
    // Vérifier que la fonction a été exécutée
    expect(mockFunction).toHaveBeenCalled();
  });

  test('devrait démarquer l\'opération même en cas d\'erreur', async () => {
    const operationName = 'error-operation';
    const { result } = renderHook(() => useCriticalOperation(operationName));
    
    const mockFunction = jest.fn().mockRejectedValue(new Error('Test error'));
    
    await act(async () => {
      await result.current.executeCritical(mockFunction);
    });
    
    // Vérifier que l'opération a été marquée comme critique
    expect(operationMode.markOperationAsCritical).toHaveBeenCalledWith(operationName);
    
    // Vérifier que l'opération a été démarquée malgré l'erreur
    expect(operationMode.unmarkOperationAsCritical).toHaveBeenCalledWith(operationName);
    
    // Vérifier que la fonction a été exécutée
    expect(mockFunction).toHaveBeenCalled();
    
    // Vérifier que l'erreur a été capturée
    expect(result.current.error).not.toBeNull();
  });

  test('devrait nettoyer l\'opération critique au démontage du composant', () => {
    const operationName = 'cleanup-operation';
    
    // Simuler que l'opération est critique
    jest.spyOn(operationMode, 'isOperationCritical').mockReturnValue(true);
    
    const { unmount } = renderHook(() => useCriticalOperation(operationName));
    
    // Déclencher le démontage du composant
    unmount();
    
    // Vérifier que l'opération a été démarquée lors du nettoyage
    expect(operationMode.unmarkOperationAsCritical).toHaveBeenCalledWith(operationName);
  });
});
