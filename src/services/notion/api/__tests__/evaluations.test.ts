import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluationsApi } from '../evaluations';
import { evaluationService } from '../../evaluation';
import { DELETE_ERROR } from '@/constants/errorMessages';

// Mock du service d'évaluation
vi.mock('../../evaluation', () => ({
  evaluationService: {
    getEvaluations: vi.fn(),
    getEvaluationById: vi.fn(),
    createEvaluation: vi.fn(),
    updateEvaluation: vi.fn(),
    deleteEvaluation: vi.fn()
  }
}));

describe('NotionEvaluationApi', () => {
  const mockEvaluation: Evaluation = {
    id: 'eval-1',
    auditId: 'audit-123',
    pageId: 'page-123',
    exigenceId: 'exig-123',
    score: ComplianceLevel.Compliant,
    comment: 'Test comment',
    attachments: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  };

  const mockEvaluationList: Evaluation[] = [
    mockEvaluation,
    {
      ...mockEvaluation,
      id: 'eval-2',
      score: ComplianceLevel.NonCompliant
    }
  ];

  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    vi.resetAllMocks();
  });

  describe('getEvaluations', () => {
    it('devrait retourner les évaluations lorsque la requête réussit', async () => {
      // Configuration du mock
      vi.mocked(evaluationService.getEvaluations).mockResolvedValue({
        success: true,
        data: mockEvaluationList
      });
      
      const result = await evaluationsApi.getEvaluations('audit-123');
      
      expect(result).toEqual(mockEvaluationList);
      expect(evaluationService.getEvaluations).toHaveBeenCalledWith('audit-123', undefined, undefined);
    });

    it('devrait propager les filtres pageId et exigenceId', async () => {
      // Configuration du mock
      vi.mocked(evaluationService.getEvaluations).mockResolvedValue({
        success: true,
        data: [mockEvaluation]
      });
      
      await evaluationsApi.getEvaluations('audit-123', 'page-123', 'exig-123');
      
      expect(evaluationService.getEvaluations).toHaveBeenCalledWith('audit-123', 'page-123', 'exig-123');
    });

    it('devrait lancer une erreur en cas d\'échec', async () => {
      // Configuration du mock pour simuler un échec
      vi.mocked(evaluationService.getEvaluations).mockResolvedValue({
        success: false,
        error: { message: 'Erreur test' }
      });
      
      // Utiliser exactement le message d'erreur renvoyé par le service
      await expect(evaluationsApi.getEvaluations('audit-123'))
        .rejects.toThrow('Erreur test');
    });
  });

  describe('getEvaluationById', () => {
    it('devrait retourner une évaluation lorsque la requête réussit', async () => {
      // Configuration du mock
      vi.mocked(evaluationService.getEvaluationById).mockResolvedValue({
        success: true,
        data: mockEvaluation
      });
      
      const result = await evaluationsApi.getEvaluationById('eval-1');
      
      expect(result).toEqual(mockEvaluation);
      expect(evaluationService.getEvaluationById).toHaveBeenCalledWith('eval-1');
    });

    it('devrait retourner null lorsque l\'évaluation n\'est pas trouvée', async () => {
      // Configuration du mock
      vi.mocked(evaluationService.getEvaluationById).mockResolvedValue({
        success: false,
        error: { message: 'Non trouvée' }
      });
      
      const result = await evaluationsApi.getEvaluationById('non-existant');
      
      expect(result).toBeNull();
    });
  });

  describe('createEvaluation', () => {
    const createInput: CreateEvaluationInput = {
      auditId: 'audit-123',
      pageId: 'page-123',
      exigenceId: 'exig-123',
      score: ComplianceLevel.Compliant,
      comment: 'Test comment'
    };

    it('devrait créer une évaluation lorsque la requête réussit', async () => {
      // Configuration du mock
      vi.mocked(evaluationService.createEvaluation).mockResolvedValue({
        success: true,
        data: mockEvaluation
      });
      
      const result = await evaluationsApi.createEvaluation(createInput);
      
      expect(result).toEqual(mockEvaluation);
      expect(evaluationService.createEvaluation).toHaveBeenCalledWith(createInput);
    });

    it('devrait lancer une erreur en cas d\'échec de création', async () => {
      // Configuration du mock
      vi.mocked(evaluationService.createEvaluation).mockResolvedValue({
        success: false,
        error: { message: 'Erreur de création' }
      });
      
      // Utiliser exactement le message d'erreur renvoyé par le service
      await expect(evaluationsApi.createEvaluation(createInput))
        .rejects.toThrow('Erreur de création');
    });
  });

  describe('updateEvaluation', () => {
    it('devrait mettre à jour une évaluation lorsque la requête réussit', async () => {
      const updatedEvaluation = { ...mockEvaluation, comment: 'Updated comment' };
      
      // Configuration du mock
      vi.mocked(evaluationService.updateEvaluation).mockResolvedValue({
        success: true,
        data: updatedEvaluation
      });
      
      const result = await evaluationsApi.updateEvaluation(updatedEvaluation);
      
      expect(result).toEqual(updatedEvaluation);
      expect(evaluationService.updateEvaluation).toHaveBeenCalledWith(updatedEvaluation);
    });

    it('devrait lancer une erreur en cas d\'échec de mise à jour', async () => {
      // Configuration du mock
      vi.mocked(evaluationService.updateEvaluation).mockResolvedValue({
        success: false,
        error: { message: 'Erreur de mise à jour' }
      });
      
      // Utiliser exactement le message d'erreur renvoyé par le service
      await expect(evaluationsApi.updateEvaluation(mockEvaluation))
        .rejects.toThrow('Erreur de mise à jour');
    });
  });

  describe('deleteEvaluation', () => {
    it('devrait supprimer une évaluation lorsque la requête réussit', async () => {
      // Configuration du mock
      vi.mocked(evaluationService.deleteEvaluation).mockResolvedValue({
        success: true,
        data: true
      });
      
      const result = await evaluationsApi.deleteEvaluation('eval-1');
      
      expect(result).toBe(true);
      expect(evaluationService.deleteEvaluation).toHaveBeenCalledWith('eval-1');
    });

    it('devrait propager l\'erreur en cas d\'échec de suppression', async () => {
      // Configurer le mock pour simuler un échec
      vi.mocked(evaluationService.deleteEvaluation).mockResolvedValue({
        success: false,
        error: { message: DELETE_ERROR }
      });
      
      // Utiliser exactement le message d'erreur renvoyé par le service
      await expect(evaluationsApi.deleteEvaluation('eval-1'))
        .rejects.toThrow(DELETE_ERROR);
    });
  });
});
