
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExigenceById } from '../useExigenceById';
import * as exigencesModule from '../..';

// Mock des dépendances
vi.mock('../..', () => ({
  getExigenceById: vi.fn()
}));

// Wrapper pour le QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useExigenceById', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('devrait récupérer une exigence par son ID', async () => {
    // Mock de la réponse API
    const mockExigence = { 
      id: 'exig-123', 
      projectId: 'project-123',
      itemId: 'item-123',
      importance: 'major'
    };
    vi.mocked(exigencesModule.getExigenceById).mockResolvedValue(mockExigence as any);
    
    // Rendu du hook
    const { result } = renderHook(() => useExigenceById('exig-123'), {
      wrapper: createWrapper()
    });
    
    // Vérifier l'état initial
    expect(result.current.isLoading).toBe(true);
    
    // Attendre que la requête soit terminée
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Vérifier les résultats
    expect(result.current.data).toEqual(mockExigence);
    expect(exigencesModule.getExigenceById).toHaveBeenCalledWith('exig-123');
  });

  it('ne devrait pas déclencher la requête si l\'ID est vide', async () => {
    // Rendu du hook avec un ID vide
    const { result } = renderHook(() => useExigenceById(undefined), {
      wrapper: createWrapper()
    });
    
    // Vérifier que la requête n'a pas été déclenchée
    expect(result.current.isLoading).toBe(false);
    expect(exigencesModule.getExigenceById).not.toHaveBeenCalled();
  });

  it('devrait gérer le cas où l\'exigence n\'est pas trouvée', async () => {
    // Mock pour simuler une exigence non trouvée
    vi.mocked(exigencesModule.getExigenceById).mockResolvedValue(null);
    
    // Rendu du hook
    const { result } = renderHook(() => useExigenceById('non-existant'), {
      wrapper: createWrapper()
    });
    
    // Attendre que la requête soit terminée
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));
    
    // Vérifier que la donnée est null
    expect(result.current.data).toBeNull();
  });
});
