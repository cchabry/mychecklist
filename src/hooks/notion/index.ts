
/**
 * Point d'entrée pour les hooks Notion
 */

// Exporter les hooks
export * from './useNotionConfig';
export * from './useNotionConfigUI';
export * from './useNotionConnection';
export * from './useNotionConnectionStatus';
export * from './useNotionDiagnostic';
export * from './useNotionError';
export * from './useNotionErrorHandling';
export * from './useNotionErrorState';
export * from './useNotionIntegrationUpdated';
export * from './useNotionRequest';
export * from './useNotionStorage';
export * from './useMockMode';
export * from './useNotionErrorService';
export * from './useRetryQueue';
export { useNotionAPI } from './useNotionAPI';

// Avertissement de dépréciation
console.warn('Les hooks Notion sont en cours de migration vers le nouveau système operationMode.');
