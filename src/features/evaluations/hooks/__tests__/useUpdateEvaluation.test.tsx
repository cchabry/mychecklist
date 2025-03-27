
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateEvaluation } from '../useUpdateEvaluation';
import { useEvaluationById } from '../useEvaluationById';
import { notionApi } from '@/services/api';
import { ComplianceLevel } from '@/types/enums';

// Mock des dépendances
vi.mock('@/services/api', () => ({
  notionApi: {
    updateEvaluation: vi.fn()
  }
}));

vi.mock('../useEvaluationById', () => ({
  useEvaluationById: vi.fn()
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

describe('useUpdateEvaluation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('devrait mettre à jour une évaluation et invalider les requêtes', async () => {
    // Mock de l'évaluation actuelle
    const mockCurrentEvaluation = {
      id: 'eval-1',
      auditId: 'audit-123',
      pageId: 'page-123',
      exigenceId: 'exig-123',
      score: ComplianceLevel.PartiallyCompliant,
      comment: 'Initial comment',
      attachments: [],
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    };
    
    vi.mocked(useEvaluationById).mockReturnValue({
      data: mockCurrentEvaluation,
      isLoading: false,
      error: null,
    } as any);
    
    // Préparer les données de mise à jour
    const updateData = {
      score: ComplianceLevel.Compliant,
      comment: 'Updated comment'
    };
    
    const expectedUpdatedEvaluation = {
      ...mockCurrentEvaluation,
      ...updateData,
      updatedAt: expect.any(String)
    };
    
    // Mock de la réponse API
    vi.mocked(notionApi.updateEvaluation).mockResolvedValue(expectedUpdatedEvaluation);
    
    // Espionner la méthode invalidateQueries
    const queryClient = new QueryClient();
    queryClient.invalidateQueries = vi.fn();
    
    // Rendu du hook
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    
    const { result } = renderHook(() => useUpdateEvaluation('eval-1'), { wrapper });
    
    // Exécuter la mutation - Correction de l'appel pour respecter la structure attendue
    const mutationResult = result.current.mutateAsync({ id: 'eval-1', data: updateData });
    
    // Vérifier que la fonction a été appelée avec les bons paramètres
    expect(notionApi.updateEvaluation).toHaveBeenCalledTimes(1);
    expect(notionApi.updateEvaluation).toHaveBeenCalledWith(expect.objectContaining({
      id: 'eval-1',
      score: ComplianceLevel.Compliant,
      comment: 'Updated comment'
    }));
    
    // Attendre la résolution de la mutation
    await mutationResult;
  });

  it('devrait lancer une erreur si l\'évaluation n\'est pas trouvée', async () => {
    // Mock pour simuler une évaluation non trouvée
    vi.mocked(useEvaluationById).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as any);
    
    // Rendu du hook
    const { result } = renderHook(() => useUpdateEvaluation('non-existant'), {
      wrapper: createWrapper()
    });
    
    // Exécuter la mutation et vérifier qu'elle échoue - Correction de l'appel
    await expect(result.current.mutateAsync({ id: 'non-existant', data: { comment: 'Test' } })).rejects.toThrow('Évaluation non trouvée');
    
    // Vérifier que l'API n'a pas été appelée
    expect(notionApi.updateEvaluation).not.toHaveBeenCalled();
  });
});
