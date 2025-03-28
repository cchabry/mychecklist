
/**
 * Point d'entrée pour les services Notion
 * 
 * Ce module exporte tous les services Notion et leurs types associés.
 */

// Exporter le client
export { notionClient } from './client/notionClient';

// Exporter les types communs
export * from './types';

// Exporter les services de base
export * from './core/BaseService';

// Exporter les services spécifiques à chaque domaine
export { checklistService, checklistsApi } from './api/checklists';

// Exporter les services existants pour rétrocompatibilité
export { notionService } from './notionService';
export { notionApi } from './notionApiImpl';
export { exigenceService } from './exigenceService';
export { samplePageService } from './samplePageService';
export { auditService } from './auditService';
export { evaluationService } from './evaluationService';
export { actionService } from './actionService';

// Note: progressService sera ajouté ultérieurement
