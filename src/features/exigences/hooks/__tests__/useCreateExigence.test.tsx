
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateExigence } from '../useCreateExigence';
import * as exigencesModule from '../..';
import { ImportanceLevel } from '@/types/enums';
import { toast } from 'sonner';

// Mock des dépendances
vi.mock('../..', () => ({
  createExigence: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Wrapper pour le QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCreateExigence', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('devrait créer une exigence et invalider les requêtes', async () => {
    // Préparer les données de test
    const mockInput = {
      projectId: 'project-123',
      itemId: 'item-123',
      importance: ImportanceLevel.Major,
      comment: 'Test comment'
    };
    
    const mockCreatedExigence = {
      id: 'exig-new',
      ...mockInput
    };
    
    // Mock de la réponse API
    vi.mocked(exigencesModule.createExigence).mockResolvedValue(mockCreatedExigence as any);
    
    // Espionner la méthode invalidateQueries
    const queryClient = new QueryClient();
    queryClient.invalidateQueries = vi.fn();
    
    // Rendu du hook
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    const { result } = renderHook(() => useCreateExigence(), { wrapper });
    
    // Exécuter la mutation
    await result.current.mutateAsync(mockInput);
    
    // Vérifier que la fonction a été appelée avec les bons paramètres
    expect(exigencesModule.createExigence).toHaveBeenCalledTimes(1);
    expect(exigencesModule.createExigence).toHaveBeenCalledWith(mockInput);
    
    // Vérifier que le toast de succès a été affiché
    expect(toast.success).toHaveBeenCalledWith('Exigence créée avec succès');
  });
  
  it('devrait gérer les erreurs lors de la création', async () => {
    // Mock d'une erreur
    const error = new Error('Erreur test');
    vi.mocked(exigencesModule.createExigence).mockRejectedValue(error);
    
    // Rendu du hook
    const { result } = renderHook(() => useCreateExigence(), {
      wrapper: createWrapper()
    });
    
    // Exécuter la mutation et vérifier qu'elle échoue
    await expect(result.current.mutateAsync({
      projectId: 'project-123',
      itemId: 'item-123',
      importance: ImportanceLevel.Major,
      comment: 'Test comment'
    })).rejects.toThrow();
    
    // Vérifier que le toast d'erreur a été affiché
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Impossible de créer'));
  });
});
