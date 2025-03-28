/**
 * Point d'entrée pour les services Notion
 * 
 * Ce module exporte tous les services Notion et leurs types associés.
 */

// Exporter le client
export { notionClient, resetNotionClient } from './client/notionClient';

// Exporter les types communs
export * from './types';

// Exporter les services de base
export * from './core/BaseService';

// Exporter les services spécifiques à chaque domaine
export { checklistService, checklistsApi } from './api/checklists';
export { notionBaseService, notionApi } from './notionService';
export { exigenceService, exigenceServiceImpl } from './exigenceService';
export { samplePageService, samplePageServiceImpl } from './samplePageService';
export { auditService } from './auditService';
export { evaluationService } from './evaluationService';
export { actionService } from './actionService';
export { progressService } from './progressService';
