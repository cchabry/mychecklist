
/**
 * Point d'entrée principal pour les services Notion
 * 
 * Ce module exporte tous les services Notion de manière uniforme,
 * facilitant l'importation et garantissant la cohérence des interfaces.
 */

// Exporter le client principal
export { notionClient } from './client/notionClient';

// Exporter l'API d'implémentation principale
export { notionApi } from './notionApiImpl';

// Exporter les services de base
export { BaseNotionService, generateMockId } from './base/BaseNotionService';
export * from './base';

// Exporter les services spécifiques
export { notionBaseService } from './notionBaseService';
export { notionService } from './notionService';
export { projectService } from './project/projectService';
export { checklistService } from './checklistService';
export { exigenceService, exigenceServiceImpl } from './exigence';
export { samplePageService, samplePageServiceImpl } from './samplePage';
export { auditService } from './audit';
export { evaluationService } from './evaluation';
export { actionService, progressService } from './action';

// Exporter les types
export * from './types';
