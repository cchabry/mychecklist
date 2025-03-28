
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actionService } from '../actionService';
import { notionClient } from '../../notionClient';
import { ActionPriority, ActionStatus, ComplianceStatus } from '@/types/domain';
import { CorrectiveAction } from '@/types/domain';
import { NotionConfig } from '../../types';
import { ComplianceLevel, PriorityLevel, StatusType } from '@/types/enums';

// Mock du notionClient
vi.mock('../../notionClient', () => ({
  notionClient: {
    getConfig: vi.fn(),
    isMockMode: vi.fn()
  }
}));

describe('ActionService', () => {
  const mockAction: CorrectiveAction = {
    id: 'action-1',
    evaluationId: 'eval-123',
    targetScore: ComplianceLevel.Compliant,
    priority: PriorityLevel.High,
    dueDate: '2023-01-01T00:00:00.000Z',
    responsible: 'John Doe',
    comment: 'Test comment',
    status: StatusType.Todo
  };

  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    vi.resetAllMocks();
  });

  describe('getActions', () => {
    it('devrait retourner une erreur si la configuration est manquante', async () => {
      // Configuration du mock pour simuler l'absence de configuration
      vi.mocked(notionClient.getConfig).mockReturnValue(undefined as unknown as NotionConfig);
      
      const result = await actionService.getActions('eval-123');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Configuration Notion non disponible");
    });

    it('devrait retourner des données simulées en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await actionService.getActions('eval-123');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.data?.[0].evaluationId).toBe('eval-123');
    });
  });

  describe('getActionById', () => {
    it('devrait retourner une action par son ID en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await actionService.getActionById('action-1');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('devrait retourner une erreur si l\'action n\'existe pas en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await actionService.getActionById('non-existant');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('non trouvée');
    });
  });

  describe('createAction', () => {
    const createInput = {
      evaluationId: 'eval-123',
      targetScore: ComplianceStatus.Compliant,
      priority: ActionPriority.High,
      dueDate: '2023-01-01T00:00:00.000Z',
      responsible: 'John Doe',
      comment: 'Test comment',
      status: ActionStatus.Todo
    };

    it('devrait créer une action en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await actionService.createAction(createInput);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.evaluationId).toBe(createInput.evaluationId);
      expect(result.data?.responsible).toBe(createInput.responsible);
      expect(result.data?.comment).toBe(createInput.comment);
    });
  });

  describe('updateAction', () => {
    it('devrait mettre à jour une action en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const updatedAction = { ...mockAction, comment: 'Updated comment' };
      
      const result = await actionService.updateAction(updatedAction);
      
      expect(result.success).toBe(true);
      expect(result.data?.comment).toBe('Updated comment');
    });
  });

  describe('deleteAction', () => {
    it('devrait supprimer une action en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await actionService.deleteAction('action-1');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
});
