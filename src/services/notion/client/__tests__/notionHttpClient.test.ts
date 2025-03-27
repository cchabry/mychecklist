
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notionHttpClient } from '../notionHttpClient';

// Mocker fetch pour les tests
global.fetch = vi.fn();

describe('NotionHttpClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Configurer le client avec une clé API pour les tests
    notionHttpClient.configure({ 
      apiKey: 'test-api-key',
      projectsDbId: 'test-db-id'
    });
  });

  it('devrait correctement configurer le client', () => {
    const config = { 
      apiKey: 'new-api-key', 
      projectsDbId: 'new-db-id',
      debug: true
    };
    
    notionHttpClient.configure(config);
    const currentConfig = notionHttpClient.getConfig();
    
    expect(currentConfig.apiKey).toBe('new-api-key');
    expect(currentConfig.projectsDbId).toBe('new-db-id');
    expect(currentConfig.debug).toBe(true);
  });

  it('devrait effectuer des requêtes GET avec les bons headers', async () => {
    // Configuration de la réponse mock
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] })
    });
    
    // Effectuer la requête
    await notionHttpClient.get('/databases');
    
    // Vérifier que fetch a été appelé avec les bons paramètres
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    
    expect(url).toBe('https://api.notion.com/v1/databases');
    expect(options.method).toBe('GET');
    expect(options.headers.Authorization).toBe('Bearer test-api-key');
    expect(options.headers['Notion-Version']).toBeDefined();
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('devrait effectuer des requêtes POST avec les bonnes données', async () => {
    // Configuration de la réponse mock
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'new-item' })
    });
    
    const data = { title: 'Nouveau projet' };
    
    // Effectuer la requête
    await notionHttpClient.post('/databases/test-db/pages', data);
    
    // Vérifier que fetch a été appelé avec les bons paramètres
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    
    expect(url).toBe('https://api.notion.com/v1/databases/test-db/pages');
    expect(options.method).toBe('POST');
    expect(options.body).toBe(JSON.stringify(data));
  });

  it('devrait gérer les erreurs HTTP correctement', async () => {
    // Configuration de la réponse d'erreur
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        message: 'Invalid API key',
        code: 'unauthorized'
      })
    });
    
    // Effectuer la requête
    const response = await notionHttpClient.get('/users/me');
    
    // Vérifier que la réponse contient les bonnes informations d'erreur
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    if (response.error) {
      expect(response.error.message).toBe('Invalid API key');
      expect(response.error.code).toBe('unauthorized');
      expect(response.error.status).toBe(401);
    }
  });

  it('devrait gérer les exceptions lors des requêtes', async () => {
    // Simuler une erreur réseau
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    // Effectuer la requête
    const response = await notionHttpClient.get('/databases');
    
    // Vérifier que la réponse contient les bonnes informations d'erreur
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    if (response.error) {
      expect(response.error.message).toBe('Network error');
    }
  });

  it('devrait retourner une erreur si la clé API manque', async () => {
    // Configurer le client sans clé API
    notionHttpClient.configure({ apiKey: undefined });
    
    // Effectuer la requête
    const response = await notionHttpClient.get('/users/me');
    
    // Vérifier que la réponse contient les bonnes informations d'erreur
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    if (response.error) {
      expect(response.error.message).toContain('Clé API Notion non configurée');
    }
  });
});
