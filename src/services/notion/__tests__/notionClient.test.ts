
/**
 * Tests pour le client Notion unifié (façade)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notionClient } from '../notionClient';
import { notionClient as notionUnifiedClient } from '../client/notionClient';

// Mocker le client unifié
vi.mock('../client/notionClient', () => ({
  notionClient: {
    configure: vi.fn(),
    isConfigured: vi.fn(),
    getConfig: vi.fn(),
    setMockMode: vi.fn(),
    isMockMode: vi.fn(),
    setDebugMode: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    testConnection: vi.fn()
  }
}));

describe('Notion Client Façade', () => {
  beforeEach(() => {
    // Réinitialiser toutes les mocks entre les tests
    vi.resetAllMocks();
  });

  it('devrait déléguer configure() au client unifié', () => {
    const config = { apiKey: 'test-key', projectsDbId: 'test-db' };
    notionClient.configure(config);
    expect(notionUnifiedClient.configure).toHaveBeenCalledWith(config);
  });

  it('devrait déléguer isConfigured() au client unifié', () => {
    notionUnifiedClient.isConfigured.mockReturnValue(true);
    const result = notionClient.isConfigured();
    expect(notionUnifiedClient.isConfigured).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('devrait déléguer getConfig() au client unifié', () => {
    const mockConfig = { mockMode: true };
    notionUnifiedClient.getConfig.mockReturnValue(mockConfig);
    const result = notionClient.getConfig();
    expect(notionUnifiedClient.getConfig).toHaveBeenCalled();
    expect(result).toBe(mockConfig);
  });

  it('devrait déléguer setMockMode() au client unifié', () => {
    notionClient.setMockMode(true);
    expect(notionUnifiedClient.setMockMode).toHaveBeenCalledWith(true);
  });

  it('devrait déléguer isMockMode() au client unifié', () => {
    notionUnifiedClient.isMockMode.mockReturnValue(true);
    const result = notionClient.isMockMode();
    expect(notionUnifiedClient.isMockMode).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('devrait déléguer get() au client unifié', async () => {
    const mockResponse = { success: true, data: { test: 'data' } };
    notionUnifiedClient.get.mockResolvedValue(mockResponse);
    
    const result = await notionClient.get('/test');
    
    expect(notionUnifiedClient.get).toHaveBeenCalledWith('/test');
    expect(result).toBe(mockResponse);
  });

  it('devrait déléguer post() au client unifié', async () => {
    const mockResponse = { success: true, data: { test: 'data' } };
    const mockData = { name: 'Test' };
    notionUnifiedClient.post.mockResolvedValue(mockResponse);
    
    const result = await notionClient.post('/test', mockData);
    
    expect(notionUnifiedClient.post).toHaveBeenCalledWith('/test', mockData);
    expect(result).toBe(mockResponse);
  });

  it('devrait gérer la méthode request() avec différentes méthodes HTTP', async () => {
    // Configurer les mocks pour chaque méthode HTTP
    const mockResponse = { success: true, data: { test: 'data' } };
    notionUnifiedClient.get.mockResolvedValue(mockResponse);
    notionUnifiedClient.post.mockResolvedValue(mockResponse);
    notionUnifiedClient.patch.mockResolvedValue(mockResponse);
    notionUnifiedClient.delete.mockResolvedValue(mockResponse);

    // Tester GET
    let result = await notionClient.request('GET', '/test');
    expect(notionUnifiedClient.get).toHaveBeenCalledWith('/test');
    expect(result).toBe(mockResponse);

    // Tester POST
    const mockData = { name: 'Test' };
    result = await notionClient.request('POST', '/test', mockData);
    expect(notionUnifiedClient.post).toHaveBeenCalledWith('/test', mockData);
    expect(result).toBe(mockResponse);

    // Tester une méthode HTTP non supportée
    result = await notionClient.request('INVALID', '/test');
    expect(result.success).toBe(false);
    expect(result.error.message).toContain('Méthode HTTP non supportée');
  });
});
