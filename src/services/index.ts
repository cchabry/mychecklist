
/**
 * Point d'entrée pour les services
 * Réexporte tous les services de l'application
 */

// Exporter les services principaux
export * from './operationMode';
export { notionService } from './notion/notionService';
export { notionClient } from './notion/client/notionClient';

// Export the cache service
export * from './cache/cacheService';

// Export the domain services but avoid type ambiguities
export * from './api';

// Export notion services but handle potential duplicates
// by using named exports instead of re-exporting everything
export {
  // Types are exported via the notion module
  // Services
  notionApi,
  checklistService,
  exigenceService,
  samplePageService,
  auditService,
  evaluationService,
  actionService
} from './notion';

