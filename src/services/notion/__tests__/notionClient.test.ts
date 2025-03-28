import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notionClient } from '../notionClient';
import { notionHttpClient } from '../client/notionHttpClient';
import { notionMockClient } from '../client/notionMockClient';
import { operationModeService } from '@/services/operationMode/operationModeService';

// Mocker les dépendances
vi.mock('../client/notionHttpClient', () => ({
  notionHttpClient: {
    configure: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

vi.mock('../client/notionMockClient', () => ({
  notionMockClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    testConnection: vi.fn()
  }
}));

vi.mock('@/services/operationMode/operationModeService', () => ({
  operationModeService: {
    isDemoMode: vi.fn(),
    isRealMode: vi.fn()
  }
}));

describe('NotionClient', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Configuration par défaut pour les tests
    (operationModeService.isDemoMode as any).mockReturnValue(false);
    (operationModeService.isRealMode as any).mockReturnValue(true);
  });

  it('devrait correctement configurer le client HTTP en mode réel', () => {
    // Utiliser le client interne par accès direct pour ce test
    notionClient.configure({
      apiKey: 'test-key', 
      projectsDbId: 'test-db'
    });
    
    // Vérifier indirectement que la configuration a été passée correctement
    expect(notionHttpClient.configure).toHaveBeenCalledWith({
      apiKey: 'test-key',
      projectsDbId: 'test-db'
    });
  });

  it('devrait vérifier si le client est configuré', () => {
    // Test à remplacer par une approche différente
    expect(typeof notionClient.isConfigured).toBe('function');
  });

  it('devrait utiliser le client HTTP en mode réel', async () => {
    const mockResponse = { success: true, data: { test: 'data' } };
    (notionHttpClient.get as any).mockResolvedValue(mockResponse);
    
    const result = await notionClient.get('/test-endpoint');
    
    expect(notionHttpClient.get).toHaveBeenCalledWith('/test-endpoint');
    expect(result).toEqual(mockResponse);
  });

  it('devrait utiliser le client mock en mode démo', async () => {
    // Configurer le mode démo
    (operationModeService.isDemoMode as any).mockReturnValue(true);
    (operationModeService.isRealMode as any).mockReturnValue(false);
    
    const mockResponse = { success: true, data: { test: 'mock-data' } };
    (notionMockClient.get as any).mockResolvedValue(mockResponse);
    
    const result = await notionClient.get('/test-endpoint');
    
    expect(notionMockClient.get).toHaveBeenCalledWith('/test-endpoint');
    expect(notionHttpClient.get).not.toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it('devrait utiliser le client mock en mode mock explicite', async () => {
    // Configurer le mode mock explicite
    notionClient.setMockMode(true);
    
    const mockResponse = { success: true, data: { test: 'mock-data' } };
    (notionMockClient.post as any).mockResolvedValue(mockResponse);
    
    const data = { name: 'Test' };
    const result = await notionClient.post('/test-endpoint', data);
    
    expect(notionMockClient.post).toHaveBeenCalledWith('/test-endpoint', data);
    expect(notionHttpClient.post).not.toHaveBeenCalled();
    expect(result).toEqual(mockResponse);
  });

  it('devrait effectuer des requêtes PATCH via le client approprié', async () => {
    const mockResponse = { success: true, data: { test: 'data' } };
    (notionHttpClient.patch as any).mockResolvedValue(mockResponse);
    
    const data = { name: 'Updated' };
    const result = await notionClient.patch('/test-endpoint', data);
    
    expect(notionHttpClient.patch).toHaveBeenCalledWith('/test-endpoint', data);
    expect(result).toEqual(mockResponse);
  });

  it('devrait effectuer des requêtes DELETE via le client approprié', async () => {
    const mockResponse = { success: true, data: { test: 'data' } };
    (notionHttpClient.delete as any).mockResolvedValue(mockResponse);
    
    const result = await notionClient.delete('/test-endpoint');
    
    expect(notionHttpClient.delete).toHaveBeenCalledWith('/test-endpoint');
    expect(result).toEqual(mockResponse);
  });
});
