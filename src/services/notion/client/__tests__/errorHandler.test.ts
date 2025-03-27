
import { describe, it, expect } from 'vitest';
import { handleNotionError, notionErrorToAppError, networkErrorToAppError } from '../errorHandler';
import { ErrorType } from '@/types/error';
import { NotionError } from '../../types';

describe('Notion Error Handler', () => {
  describe('notionErrorToAppError', () => {
    it('devrait convertir une erreur Notion en AppError avec le bon type', () => {
      const notionError: NotionError = {
        message: 'Erreur de validation',
        code: 'validation_error',
        status: 400,
        details: { field: 'name', error: 'required' }
      };
      
      const appError = notionErrorToAppError(notionError, '/test-endpoint');
      
      expect(appError.type).toBe(ErrorType.VALIDATION);
      expect(appError.message).toBe('Erreur de validation');
      expect(appError.code).toBe('validation_error');
      expect(appError.status).toBe(400);
      expect(appError.context).toBe('API Notion: /test-endpoint');
    });
    
    it('devrait déduire le type d\'erreur à partir du statut HTTP si le code est inconnu', () => {
      const notionError: NotionError = {
        message: 'Erreur inconnue',
        status: 403,
        details: {}
      };
      
      const appError = notionErrorToAppError(notionError);
      
      expect(appError.type).toBe(ErrorType.FORBIDDEN);
      expect(appError.message).toBe('Erreur inconnue');
      expect(appError.status).toBe(403);
    });
  });
  
  describe('networkErrorToAppError', () => {
    it('devrait identifier les erreurs réseau', () => {
      const networkError = new Error('network error: failed to fetch');
      
      const appError = networkErrorToAppError(networkError);
      
      expect(appError.type).toBe(ErrorType.NETWORK);
      expect(appError.message).toContain('Problème de connexion');
    });
    
    it('devrait traiter les erreurs normales', () => {
      const regularError = new Error('Une erreur standard');
      
      const appError = networkErrorToAppError(regularError);
      
      expect(appError.type).toBe(ErrorType.UNEXPECTED);
      expect(appError.message).toBe('Une erreur standard');
    });
  });
  
  describe('handleNotionError', () => {
    it('devrait retourner l\'erreur telle quelle si c\'est déjà une AppError', () => {
      const appError = {
        type: ErrorType.VALIDATION,
        message: 'Erreur existante',
        name: 'AppError'
      };
      
      const result = handleNotionError(appError);
      
      expect(result).toBe(appError);
    });
    
    it('devrait convertir une erreur Notion standard', () => {
      const notionError = {
        message: 'Rate limit exceeded',
        code: 'rate_limited',
        status: 429
      };
      
      const result = handleNotionError(notionError);
      
      expect(result.type).toBe(ErrorType.API);
      expect(result.message).toBe('Rate limit exceeded');
    });
    
    it('devrait traiter les erreurs non structurées', () => {
      const result = handleNotionError('Erreur sous forme de chaîne');
      
      expect(result.type).toBe(ErrorType.UNEXPECTED);
      expect(result.message).toBe('Erreur sous forme de chaîne');
    });
  });
});
