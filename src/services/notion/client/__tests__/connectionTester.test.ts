
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testConnection } from '../connectionTester';
import { notionHttpClient } from '../notionHttpClient';
import { notionMockClient } from '../mock/notionMockClient';

// Mocker les dépendances
vi.mock('../notionHttpClient', () => ({
  notionHttpClient: {
    get: vi.fn()
  }
}));

vi.mock('../mock/notionMockClient', () => ({
  notionMockClient: {
    testConnection: vi.fn()
  }
}));

describe('Connection Tester', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('devrait retourner un résultat de mock en mode mock', async () => {
    const mockResult = {
      success: true,
      user: 'Utilisateur test',
      workspaceName: 'Workspace test'
    };
    
    (notionMockClient.testConnection as any).mockResolvedValue(mockResult);
    
    const result = await testConnection({}, true);
    
    expect(notionMockClient.testConnection).toHaveBeenCalled();
    expect(result).toEqual(mockResult);
  });

  it('devrait retourner une erreur si la clé API est manquante', async () => {
    const result = await testConnection({});
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Clé API Notion non configurée');
  });

  it('devrait gérer une requête utilisateur réussie', async () => {
    const userResponse = {
      success: true,
      data: {
        name: 'Test User',
        person: { email: 'test@example.com' },
        bot: { workspace_name: 'Test Workspace' }
      }
    };
    
    const projectsDbResponse = {
      success: true,
      data: {
        title: [{ plain_text: 'Base Projets' }]
      }
    };
    
    const checklistsDbResponse = {
      success: true,
      data: {
        title: [{ plain_text: 'Base Checklist' }]
      }
    };
    
    // Configurer les mocks
    (notionHttpClient.get as any).mockImplementation((endpoint: string) => {
      if (endpoint === '/users/me') return Promise.resolve(userResponse);
      if (endpoint === '/databases/test-projects-db') return Promise.resolve(projectsDbResponse);
      if (endpoint === '/databases/test-checklist-db') return Promise.resolve(checklistsDbResponse);
      return Promise.resolve({ success: false });
    });
    
    const result = await testConnection({
      apiKey: 'test-key',
      projectsDbId: 'test-projects-db',
      checklistsDbId: 'test-checklist-db'
    });
    
    expect(result.success).toBe(true);
    expect(result.user).toBe('Test User');
    expect(result.workspaceName).toBe('Test Workspace');
    expect(result.projectsDbName).toBe('Base Projets');
    expect(result.checklistsDbName).toBe('Base Checklist');
  });

  it('devrait gérer une erreur lors de la récupération des informations utilisateur', async () => {
    const errorResponse = {
      success: false,
      error: {
        message: 'Invalid API key'
      }
    };
    
    (notionHttpClient.get as any).mockResolvedValue(errorResponse);
    
    const result = await testConnection({
      apiKey: 'invalid-key'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid API key');
  });

  it('devrait gérer une exception', async () => {
    (notionHttpClient.get as any).mockRejectedValue(new Error('Network error'));
    
    const result = await testConnection({
      apiKey: 'test-key'
    });
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
  });
});
