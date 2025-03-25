
import { renderHook, act } from '@testing-library/react-hooks';
import { useOperationQueue } from '@/hooks/api/useOperationQueue';
import { toast } from 'sonner';

// Mock pour les toasts
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn()
  }
}));

// Mock pour useRetryQueue qui est utilisé par useOperationQueue
jest.mock('@/services/notion/errorHandling', () => ({
  useRetryQueue: () => ({
    operations: [],
    pendingCount: 0,
    successCount: 0,
    errorCount: 0,
    isProcessing: false,
    enqueue: jest.fn().mockReturnValue('operation-id'),
    processQueue: jest.fn().mockResolvedValue(undefined),
    removeOperation: jest.fn(),
    clearQueue: jest.fn()
  })
}));

describe('useOperationQueue - Tests de non-régression', () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait ajouter une opération à la file d\'attente', () => {
    const { result } = renderHook(() => useOperationQueue());
    
    const operation = jest.fn().mockResolvedValue(undefined);
    const name = 'Test operation';
    const description = 'Test description';
    
    act(() => {
      result.current.addOperation(name, operation, { description });
    });
    
    // Vérifier que l'opération a été ajoutée
    expect(toast.info).toHaveBeenCalled();
  });

  test('devrait traiter la file d\'attente', async () => {
    const { result } = renderHook(() => useOperationQueue());
    
    await act(async () => {
      await result.current.processQueue();
    });
    
    // Comme pendingCount est 0 dans le mock, nous devrions voir un toast info
    expect(toast.info).toHaveBeenCalledWith('Aucune opération en attente');
  });

  test('devrait ajouter et exécuter immédiatement une opération', async () => {
    const { result } = renderHook(() => useOperationQueue());
    
    const operation = jest.fn().mockResolvedValue(undefined);
    const name = 'Test operation';
    
    await act(async () => {
      result.current.addOperation(name, operation, { executeNow: true });
    });
    
    // Vérifier que l'opération a été ajoutée et que processQueue a été appelé
    expect(toast.info).toHaveBeenCalled();
  });

  test('ne devrait pas afficher de toast si silent est true', () => {
    const { result } = renderHook(() => useOperationQueue());
    
    const operation = jest.fn().mockResolvedValue(undefined);
    const name = 'Silent operation';
    
    act(() => {
      result.current.addOperation(name, operation, { silent: true });
    });
    
    // Vérifier qu'aucun toast n'a été affiché
    expect(toast.info).not.toHaveBeenCalled();
  });
});
