
/**
 * Tests pour le client Notion en mode démonstration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { notionMockClient } from '../notionMockClient';

describe('Notion Mock Client', () => {
  beforeEach(() => {
    // Réinitialiser toutes les mocks entre les tests
    vi.restoreAllMocks();
    // Configurer le client mock avec des valeurs par défaut
    notionMockClient.configure({
      mockMode: true,
      debug: false
    });
  });

  it('devrait être configuré en mode mock par défaut', () => {
    const config = notionMockClient.getConfig();
    expect(config.mockMode).toBe(true);
  });

  it('devrait pouvoir être configuré', () => {
    // Configurer le client
    notionMockClient.configure({
      mockMode: true,
      debug: true,
      apiKey: 'mock-api-key',
      projectsDbId: 'mock-projects-db-id'
    });

    // Vérifier la configuration
    const config = notionMockClient.getConfig();
    expect(config.mockMode).toBe(true);
    expect(config.debug).toBe(true);
    expect(config.apiKey).toBe('mock-api-key');
    expect(config.projectsDbId).toBe('mock-projects-db-id');
  });

  it('devrait simuler une requête GET /users/me avec succès', async () => {
    // Espionner la méthode console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Activer le mode debug pour le test
    notionMockClient.configure({ debug: true });

    // Effectuer la requête
    const response = await notionMockClient.get('/users/me');

    // Vérifier que la requête a réussi
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe('mock-user-id');
    expect(response.data.name).toBe('Utilisateur Démo');

    // Vérifier que la requête a été loggée en mode debug
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[Notion Mock] GET /users/me'));
  });

  it('devrait simuler une requête GET sur une base de données avec succès', async () => {
    const dbId = 'mock-database-id';
    const response = await notionMockClient.get(`/databases/${dbId}`);

    // Vérifier que la requête a réussi
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(dbId);
    expect(response.data.title).toBeDefined();
    expect(response.data.properties).toBeDefined();
  });

  it('devrait simuler une requête POST pour créer un page dans une base de données', async () => {
    const dbId = 'mock-database-id';
    const data = {
      properties: {
        Name: {
          title: [{ text: { content: 'Test Project' } }]
        }
      }
    };

    const response = await notionMockClient.post(`/databases/${dbId}/pages`, data);

    // Vérifier que la requête a réussi
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.id).toMatch(/^mock-/);
    expect(response.data.created_time).toBeDefined();
    expect(response.data.last_edited_time).toBeDefined();
  });

  it('devrait simuler une requête PATCH pour mettre à jour une page', async () => {
    const pageId = 'mock-page-id';
    const data = {
      properties: {
        Status: {
          select: {
            name: 'Terminé'
          }
        }
      }
    };

    const response = await notionMockClient.patch(`/pages/${pageId}`, data);

    // Vérifier que la requête a réussi
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(pageId);
    expect(response.data.last_edited_time).toBeDefined();
    expect(response.data.properties).toEqual(data.properties);
  });

  it('devrait simuler une requête DELETE pour supprimer une page', async () => {
    const pageId = 'mock-page-id';
    const response = await notionMockClient.delete(`/pages/${pageId}`);

    // Vérifier que la requête a réussi
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data.id).toBe(pageId);
    expect(response.data.deleted).toBe(true);
  });

  it('devrait simuler un test de connexion toujours réussi', async () => {
    const result = await notionMockClient.testConnection();

    // Vérifier que le test a réussi
    expect(result.success).toBe(true);
    expect(result.user).toBe('Utilisateur démo');
    expect(result.workspaceName).toBe('Workspace démo');
    expect(result.projectsDbName).toBeDefined();
    expect(result.checklistsDbName).toBeDefined();
  });
});
