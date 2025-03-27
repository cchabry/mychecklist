
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { progressService } from '../progressService';
import { notionClient } from '../../notionClient';
import { ComplianceLevel, StatusType } from '@/types/enums';
import { ActionProgress } from '@/types/domain';
import { NotionConfig } from '../../types';

// Mock du notionClient
vi.mock('../../notionClient', () => ({
  notionClient: {
    getConfig: vi.fn(),
    isMockMode: vi.fn()
  }
}));

describe('ProgressService', () => {
  const mockProgress: ActionProgress = {
    id: 'progress-1',
    actionId: 'action-123',
    date: '2023-01-01T00:00:00.000Z',
    responsible: 'Jane Doe',
    comment: 'Test progress',
    score: ComplianceLevel.PartiallyCompliant,
    status: StatusType.InProgress
  };

  beforeEach(() => {
    // Réinitialiser tous les mocks avant chaque test
    vi.resetAllMocks();
  });

  describe('getActionProgress', () => {
    it('devrait retourner une erreur si la configuration est manquante', async () => {
      // Configuration du mock pour simuler l'absence de configuration
      vi.mocked(notionClient.getConfig).mockReturnValue(undefined as unknown as NotionConfig);
      
      const result = await progressService.getActionProgress('action-123');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe("Configuration Notion non disponible");
    });

    it('devrait retourner des données simulées en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await progressService.getActionProgress('action-123');
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.data?.[0].actionId).toBe('action-123');
    });
  });

  describe('getActionProgressById', () => {
    it('devrait retourner un progrès par son ID en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await progressService.getActionProgressById('progress-1');
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
    });

    it('devrait retourner une erreur si le progrès n\'existe pas en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await progressService.getActionProgressById('non-existant');
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('non trouvé');
    });
  });

  describe('createActionProgress', () => {
    const createInput = {
      actionId: 'action-123',
      date: '2023-01-01T00:00:00.000Z',
      responsible: 'Jane Doe',
      comment: 'Test progress',
      score: ComplianceLevel.PartiallyCompliant,
      status: StatusType.InProgress
    };

    it('devrait créer un progrès en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await progressService.createActionProgress(createInput);
      
      expect(result.success).toBe(true);
      expect(result.data?.id).toBeDefined();
      expect(result.data?.actionId).toBe(createInput.actionId);
      expect(result.data?.responsible).toBe(createInput.responsible);
      expect(result.data?.comment).toBe(createInput.comment);
    });
  });

  describe('updateActionProgress', () => {
    it('devrait mettre à jour un progrès en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const updatedProgress = { ...mockProgress, comment: 'Updated progress' };
      
      const result = await progressService.updateActionProgress(updatedProgress);
      
      expect(result.success).toBe(true);
      expect(result.data?.comment).toBe('Updated progress');
    });
  });

  describe('deleteActionProgress', () => {
    it('devrait supprimer un progrès en mode mock', async () => {
      // Configuration des mocks
      vi.mocked(notionClient.getConfig).mockReturnValue({ apiKey: 'fake-key' } as NotionConfig);
      vi.mocked(notionClient.isMockMode).mockReturnValue(true);
      
      const result = await progressService.deleteActionProgress('progress-1');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
    });
  });
});
